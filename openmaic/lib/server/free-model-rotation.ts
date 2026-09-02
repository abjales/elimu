/**
 * Automatic free-model rotation for classroom generation.
 *
 * Background: Elimu's classroom generation resolves its LLM from
 * `DEFAULT_MODEL` (see lib/server/resolve-model.ts). When that model is a
 * free OpenRouter model (e.g. `openrouter:tencent/hy3:free`), it ships with a
 * daily/rate quota that gets exhausted — at which point every generation
 * request starts failing with a 429 / "rate limit" / "quota" error until the
 * quota resets or a human swaps the model string by hand.
 *
 * This module removes the human from that loop. When rotation is active it:
 *   1. Keeps an ordered pool of free OpenRouter models.
 *   2. On a detected quota/rate-limit error, rotates `DEFAULT_MODEL` to the
 *      next candidate (persisting the choice so it survives across requests
 *      and server restarts) and lets the generation job retry.
 *   3. Optionally resets back to the primary model on server start (daily
 *      quotas reset daily, so the best model is re-favored each day).
 *
 * The active model is applied by mutating `process.env.DEFAULT_MODEL`, which is
 * exactly the variable resolveModel() falls back to — so no caller changes are
 * required for the resolution path itself.
 */

import path from 'path';
import { readFileSync, mkdirSync } from 'fs';
import { createLogger } from '@/lib/logger';
import { writeJsonFileAtomic } from '@/lib/server/classroom-storage';

const log = createLogger('FreeModelRotation');

const ROTATION_STATE_FILE = path.join(process.cwd(), 'data', 'model-rotation.json');

/** Provider used for all free pool models. */
const FREE_PROVIDER = 'openrouter';

/**
 * Curated pool of free OpenRouter models. Ordered by rough quality/preference
 * — index 0 is the primary (favored) model. Override with
 * `FREE_MODEL_POOL="id1,id2,..."` (comma-separated OpenRouter model IDs, no
 * `openrouter:` prefix).
 */
const DEFAULT_FREE_POOL: string[] = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'openai/gpt-oss-20b:free',
  'inclusionai/ling-3.0-flash:free',
  'poolside/laguna-s-2.1:free',
  'poolside/laguna-xs-2.1:free',
  'cohere/north-mini-code:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
];

interface RotationState {
  /** Index into the active pool of the currently selected model. */
  currentIndex: number;
  /** Resolved model string, e.g. `openrouter:tencent/hy3:free`. */
  currentModel: string;
  /** Candidate pool (OpenRouter model IDs, no prefix). */
  pool: string[];
  /** Most recent rotation event. */
  lastRotatedAt?: string;
  lastRotatedFrom?: string;
  lastRotatedTo?: string;
  lastRotationReason?: string;
  /** Most recent detected quota/rate-limit error. */
  lastErrorAt?: string;
  lastErrorMessage?: string;
  /** Count of automatic rotations performed this process lifetime. */
  rotationCount: number;
}

// Process-singleton state (loaded lazily / on startup).
let state: RotationState | null = null;
let startupApplied = false;

function poolFromEnv(): string[] {
  const raw = process.env.FREE_MODEL_POOL;
  if (raw && raw.trim()) {
    const ids = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length > 0) return ids;
  }
  return [...DEFAULT_FREE_POOL];
}

function isEnabledByConfig(): boolean {
  // Explicit disable wins.
  if (process.env.FREE_MODEL_ROTATION_ENABLED === 'false') return false;
  // Auto-enable when the configured default model is a free OpenRouter model.
  const def = process.env.DEFAULT_MODEL || '';
  const isFreeOpenRouter =
    def.startsWith(`${FREE_PROVIDER}:`) && def.toLowerCase().includes(':free');
  if (process.env.FREE_MODEL_ROTATION_ENABLED === 'true') return true;
  return isFreeOpenRouter;
}

function fullModelString(modelId: string): string {
  return `${FREE_PROVIDER}:${modelId}`;
}

async function persistState(): Promise<void> {
  if (!state) return;
  try {
    // Ensure the exact parent dir exists (idempotent) before the atomic write,
    // so a transiently-missing data/ dir can't cause a rename ENOENT.
    mkdirSync(path.dirname(ROTATION_STATE_FILE), { recursive: true });
    await writeJsonFileAtomic(ROTATION_STATE_FILE, state);
  } catch (err) {
    log.warn('Failed to persist free-model rotation state:', err);
  }
}

function loadStateFile(): RotationState | null {
  try {
    const raw = readFileSync(ROTATION_STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<RotationState>;
    if (!parsed || !Array.isArray(parsed.pool) || parsed.pool.length === 0) {
      return null;
    }
    return parsed as RotationState;
  } catch {
    return null;
  }
}

/**
 * Apply rotation state to `process.env.DEFAULT_MODEL` so the existing model
 * resolution path picks up the chosen free model. Call once at startup.
 */
export function initFreeModelRotation(): void {
  if (startupApplied) return;
  startupApplied = true;

  if (!isEnabledByConfig()) {
    log.info('[FreeModelRotation] disabled (DEFAULT_MODEL is not a free OpenRouter model, or explicitly disabled).');
    return;
  }

  const pool = poolFromEnv();
  const fileState = loadStateFile();

  let currentIndex = 0;
  // Resume from saved index unless a daily reset is requested.
  if (fileState) {
    const dailyReset = process.env.FREE_MODEL_ROTATION_DAILY_RESET !== 'false';
    if (dailyReset) {
      log.info('[FreeModelRotation] daily reset — favoring primary model (index 0).');
      currentIndex = 0;
    } else if (fileState.currentIndex >= 0 && fileState.currentIndex < pool.length) {
      // Only reuse saved index if the saved pool still matches; otherwise fall back to 0.
      if (JSON.stringify(fileState.pool) === JSON.stringify(pool)) {
        currentIndex = fileState.currentIndex;
      }
    }
  }

  state = {
    currentIndex,
    pool,
    currentModel: fullModelString(pool[currentIndex]),
    rotationCount: fileState?.rotationCount ?? 0,
  };

  process.env.DEFAULT_MODEL = state.currentModel;
  log.info(`[FreeModelRotation] active. Pool size=${pool.length}. Current model=${state.currentModel}.`);
  void persistState();
}

/** Whether rotation is currently active. */
export function isFreeRotationActive(): boolean {
  if (!state) {
    // Allow an early query before init() ran: fall back to config check.
    return isEnabledByConfig();
  }
  return true;
}

export function getFreeModelPoolSize(): number {
  return state?.pool.length ?? poolFromEnv().length;
}

/** Whether the active rotation pool is empty (nothing to rotate to). */
export function isFreeModelPoolEmpty(): boolean {
  return getFreeModelPoolSize() === 0;
}

/**
 * Rotate to the next candidate model. Updates `process.env.DEFAULT_MODEL` and
 * persists the choice. Returns the new full model string.
 */
export async function rotateFreeModel(reason: string): Promise<string> {
  if (!state) initFreeModelRotation();
  if (!state) {
    // Not active — nothing to rotate.
    return process.env.DEFAULT_MODEL || '';
  }

  const prevIndex = state.currentIndex;
  const prevModel = state.currentModel;
  const nextIndex = (prevIndex + 1) % state.pool.length;

  state.currentIndex = nextIndex;
  state.currentModel = fullModelString(state.pool[nextIndex]);
  state.lastRotatedAt = new Date().toISOString();
  state.lastRotatedFrom = prevModel;
  state.lastRotatedTo = state.currentModel;
  state.lastRotationReason = reason;
  state.rotationCount += 1;

  process.env.DEFAULT_MODEL = state.currentModel;
  await persistState();

  log.warn(`[FreeModelRotation] rotated model ${prevModel} -> ${state.currentModel} (reason: ${reason}).`);
  return state.currentModel;
}

/** Record a detected quota/rate-limit error without rotating (for inspection). */
export async function recordQuotaError(error: unknown): Promise<void> {
  if (!state) return;
  state.lastErrorAt = new Date().toISOString();
  state.lastErrorMessage = error instanceof Error ? error.message : String(error);
  await persistState();
}

/** Reset rotation back to the primary model (index 0). */
export async function resetFreeModelRotation(): Promise<string> {
  if (!state) initFreeModelRotation();
  if (!state) return process.env.DEFAULT_MODEL || '';
  state.currentIndex = 0;
  state.currentModel = fullModelString(state.pool[0]);
  process.env.DEFAULT_MODEL = state.currentModel;
  await persistState();
  log.info(`[FreeModelRotation] reset to primary model ${state.currentModel}.`);
  return state.currentModel;
}

/** Return a snapshot of the rotation state for the status API. */
export function getFreeModelRotationState(): {
  active: boolean;
  currentModel: string;
  currentIndex: number;
  pool: string[];
  rotationCount: number;
  lastRotatedAt?: string;
  lastRotatedFrom?: string;
  lastRotatedTo?: string;
  lastRotationReason?: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
} {
  const active = isFreeRotationActive();
  return {
    active,
    currentModel: state?.currentModel ?? process.env.DEFAULT_MODEL ?? '',
    currentIndex: state?.currentIndex ?? 0,
    pool: state?.pool ?? poolFromEnv(),
    rotationCount: state?.rotationCount ?? 0,
    lastRotatedAt: state?.lastRotatedAt,
    lastRotatedFrom: state?.lastRotatedFrom,
    lastRotatedTo: state?.lastRotatedTo,
    lastRotationReason: state?.lastRotationReason,
    lastErrorAt: state?.lastErrorAt,
    lastErrorMessage: state?.lastErrorMessage,
  };
}

/**
 * Sentinel error thrown by the generation pipeline when a LLM call fails due
 * to an exhausted quota / rate limit. The job runner catches this, rotates to
 * the next free model, and re-runs the generation — removing the human from
 * the "swap the model string" loop.
 */
export class QuotaExhaustedError extends Error {
  /**
   * Explicitly NON-retryable. isRetryableGenerationError() honors this flag
   * first, so withGenerationRetry() re-throws immediately instead of hammering
   * the same exhausted model several times before we get a chance to rotate.
   */
  isRetryable = false;
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExhaustedError';
  }
}

/**
 * Detect whether an error represents an exhausted quota / rate limit — the
 * signal that we should rotate to another free model rather than fail.
 *
 * OpenRouter (and most OpenAI-compatible gateways) surface free-model
 * exhaustion as HTTP 429 (rate limit) or HTTP 402 (payment required, when the
 * free tier daily cap is hit), often with messages mentioning rate limit,
 * quota, daily limit, or the free tier.
 */
export function isQuotaOrRateLimitError(error: unknown): boolean {
  if (!error) return false;

  // Numeric HTTP status, found on a few common shapes.
  const status =
    (error as { statusCode?: number }).statusCode ??
    (error as { status?: number }).status ??
    undefined;

  if (status === 429) return true;
  if (status === 402) return true; // OpenRouter: free daily cap / credits

  // AI SDK APICallError exposes the raw response body.
  const responseBody =
    (error as { responseBody?: string }).responseBody ??
    (error as { body?: string }).body ??
    '';
  const message = error instanceof Error ? error.message : String(error);
  const combined = `${message}\n${typeof responseBody === 'string' ? responseBody : ''}`;

  const patterns = [
    /rate[\s_-]?limit/i,
    /too many requests/i,
    /quota/i,
    /daily limit/i,
    /daily cap/i,
    /free (model|tier|plan)/i,
    /exceeded/i,
    /429\b/,
    /402\b/,
    /model.*(unavailable|disabled).*free/i,
  ];
  if (patterns.some((re) => re.test(combined))) return true;

  return false;
}
