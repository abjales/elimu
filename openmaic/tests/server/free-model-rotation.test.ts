/**
 * Tests for the free-model auto-rotation layer.
 *
 * These exercise the pure logic of lib/server/free-model-rotation.ts without
 * needing the full Next.js runtime: quota/rate-limit detection, activation
 * gating, rotation advancing DEFAULT_MODEL, and persistence.
 *
 * The module is a process singleton (it mutates process.env.DEFAULT_MODEL and
 * caches an `init()` guard). To keep tests isolated we bust the module cache
 * and dynamically re-import it per case, plus back up/restore the relevant env
 * vars and the on-disk state file.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import { existsSync, unlinkSync, readFileSync } from 'fs';

const STATE_FILE = path.join(process.cwd(), 'data', 'model-rotation.json');

const ENVS_TO_STASH = [
  'DEFAULT_MODEL',
  'FREE_MODEL_ROTATION_ENABLED',
  'FREE_MODEL_POOL',
  'FREE_MODEL_ROTATION_DAILY_RESET',
];

type RotationModule = typeof import('@/lib/server/free-model-rotation');

async function freshRotationModule(): Promise<RotationModule> {
  vi.resetModules();
  return (await import('@/lib/server/free-model-rotation')) as RotationModule;
}

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = {};
  for (const k of ENVS_TO_STASH) savedEnv[k] = process.env[k];
  if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE);
});

afterEach(() => {
  for (const k of ENVS_TO_STASH) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE);
});

describe('isQuotaOrRateLimitError', () => {
  it('detects HTTP 429', async () => {
    const m = await freshRotationModule();
    expect(m.isQuotaOrRateLimitError({ status: 429 })).toBe(true);
    expect(m.isQuotaOrRateLimitError({ statusCode: 429 })).toBe(true);
  });

  it('detects HTTP 402 (OpenRouter free cap)', async () => {
    const m = await freshRotationModule();
    expect(m.isQuotaOrRateLimitError({ status: 402 })).toBe(true);
  });

  it('detects rate-limit / quota messages', async () => {
    const m = await freshRotationModule();
    expect(m.isQuotaOrRateLimitError(new Error('Rate limit exceeded'))).toBe(true);
    expect(m.isQuotaOrRateLimitError(new Error('You have exceeded your free daily limit'))).toBe(true);
    expect(
      m.isQuotaOrRateLimitError({ responseBody: '{"error":{"message":"rate limit reached"}}' }),
    ).toBe(true);
  });

  it('ignores unrelated errors', async () => {
    const m = await freshRotationModule();
    expect(m.isQuotaOrRateLimitError(new Error('invalid json in response'))).toBe(false);
    expect(m.isQuotaOrRateLimitError(new Error('ECONNRESET'))).toBe(false);
    expect(m.isQuotaOrRateLimitError(null)).toBe(false);
  });
});

describe('QuotaExhaustedError', () => {
  it('is non-retryable so generation retries escape early', async () => {
    const m = await freshRotationModule();
    const err = new m.QuotaExhaustedError('free quota hit');
    expect(err.isRetryable).toBe(false);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('rotation activation + behavior', () => {
  it('auto-activates when DEFAULT_MODEL is a free OpenRouter model', async () => {
    const m = await freshRotationModule();
    process.env.DEFAULT_MODEL = 'openrouter:nvidia/nemotron-3-ultra-550b-a55b:free';
    delete process.env.FREE_MODEL_ROTATION_ENABLED;
    delete process.env.FREE_MODEL_POOL;

    m.initFreeModelRotation();
    expect(m.isFreeRotationActive()).toBe(true);
    const st = m.getFreeModelRotationState();
    // Primary of the default pool (tencent/hy3:free was discontinued on OpenRouter).
    expect(st.currentModel).toBe('openrouter:nvidia/nemotron-3-ultra-550b-a55b:free');
    expect(st.pool.length).toBeGreaterThan(1);
  });

  it('does not activate for a non-free model', async () => {
    const m = await freshRotationModule();
    process.env.DEFAULT_MODEL = 'openai:gpt-5.5';
    delete process.env.FREE_MODEL_ROTATION_ENABLED;
    m.initFreeModelRotation();
    expect(m.isFreeRotationActive()).toBe(false);
  });

  it('explicit disable overrides auto-activation', async () => {
    const m = await freshRotationModule();
    process.env.DEFAULT_MODEL = 'openrouter:tencent/hy3:free';
    process.env.FREE_MODEL_ROTATION_ENABLED = 'false';
    m.initFreeModelRotation();
    expect(m.isFreeRotationActive()).toBe(false);
  });

  it('rotates to the next model and advances DEFAULT_MODEL', async () => {
    const m = await freshRotationModule();
    process.env.DEFAULT_MODEL = 'openrouter:tencent/hy3:free';
    delete process.env.FREE_MODEL_ROTATION_ENABLED;
    process.env.FREE_MODEL_POOL =
      'tencent/hy3:free,nvidia/nemotron-3-ultra-550b-a55b:free,google/gemma-4-26b-it:free';

    m.initFreeModelRotation();
    expect(m.getFreeModelRotationState().currentModel).toBe('openrouter:tencent/hy3:free');

    const next = await m.rotateFreeModel('test rate limit');
    expect(next).toBe('openrouter:nvidia/nemotron-3-ultra-550b-a55b:free');
    expect(process.env.DEFAULT_MODEL).toBe(next);
    expect(m.getFreeModelRotationState().currentModel).toBe(next);
    expect(m.getFreeModelRotationState().rotationCount).toBe(1);
    expect(m.getFreeModelRotationState().lastRotationReason).toBe('test rate limit');
  });

  it('wraps around the pool after exhausting it', async () => {
    const m = await freshRotationModule();
    process.env.DEFAULT_MODEL = 'openrouter:tencent/hy3:free';
    delete process.env.FREE_MODEL_ROTATION_ENABLED;
    process.env.FREE_MODEL_POOL =
      'tencent/hy3:free,nvidia/nemotron-3-ultra-550b-a55b:free,google/gemma-4-26b-it:free';

    m.initFreeModelRotation(); // daily reset → starts at index 0
    const poolSize = m.getFreeModelRotationState().pool.length;

    let last: string | undefined;
    for (let i = 0; i < poolSize; i += 1) last = await m.rotateFreeModel('wrap test');
    // After rotating poolSize times we wrap back to the primary (index 0).
    expect(last).toBe('openrouter:tencent/hy3:free');
  });

  it('persists rotation state to disk', async () => {
    const m = await freshRotationModule();
    process.env.DEFAULT_MODEL = 'openrouter:tencent/hy3:free';
    delete process.env.FREE_MODEL_ROTATION_ENABLED;
    process.env.FREE_MODEL_POOL = 'tencent/hy3:free,nvidia/nemotron-3-ultra-550b-a55b:free';

    m.initFreeModelRotation();
    await m.rotateFreeModel('persist test');
    expect(existsSync(STATE_FILE)).toBe(true);
    const parsed = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    expect(parsed.currentModel).toBe('openrouter:nvidia/nemotron-3-ultra-550b-a55b:free');
  });

  it('resets back to the primary model', async () => {
    const m = await freshRotationModule();
    process.env.DEFAULT_MODEL = 'openrouter:tencent/hy3:free';
    delete process.env.FREE_MODEL_ROTATION_ENABLED;
    process.env.FREE_MODEL_POOL = 'tencent/hy3:free,nvidia/nemotron-3-ultra-550b-a55b:free';

    m.initFreeModelRotation();
    await m.rotateFreeModel('first');
    const reset = await m.resetFreeModelRotation();
    expect(reset).toBe('openrouter:tencent/hy3:free');
    expect(process.env.DEFAULT_MODEL).toBe('openrouter:tencent/hy3:free');
  });

  it('reports pool emptiness', async () => {
    const m = await freshRotationModule();
    expect(m.isFreeModelPoolEmpty()).toBe(false);
  });
});
