import { describe, expect, it, vi, beforeEach } from 'vitest';
import { makeQuotaAwareAICall } from '@/lib/server/classroom-generation';
import {
  QuotaExhaustedError,
} from '@/lib/server/free-model-rotation';
import type { AICallFn } from '@/lib/generation/pipeline-types';

// makeQuotaAwareAICall reads isFreeRotationActive() at call time, which is
// driven by process.env.DEFAULT_MODEL. We stub it so the test is deterministic
// regardless of the host's real config.
vi.mock('@/lib/server/free-model-rotation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    isFreeRotationActive: () => isFreeRotationActiveStub(),
  };
});

let _active = false;
function isFreeRotationActiveStub(): boolean {
  return _active;
}

const okCall: AICallFn = async () => '{"outlines":[]}';

describe('makeQuotaAwareAICall', () => {
  beforeEach(() => {
    _active = false;
    vi.clearAllMocks();
  });

  it('passes through unchanged when rotation is inactive', async () => {
    _active = false;
    const wrapped = makeQuotaAwareAICall(okCall);
    await expect(wrapped('s', 'u')).resolves.toBe('{"outlines":[]}');
  });

  it('passes through a valid response when rotation is active', async () => {
    _active = true;
    const wrapped = makeQuotaAwareAICall(okCall);
    await expect(wrapped('s', 'u')).resolves.toBe('{"outlines":[]}');
  });

  it('normalizes an empty successful response into QuotaExhaustedError when rotation is active', async () => {
    _active = true;
    const wrapped = makeQuotaAwareAICall(async () => '   ');
    await expect(wrapped('s', 'u')).rejects.toBeInstanceOf(QuotaExhaustedError);
  });

  it('normalizes a null response into QuotaExhaustedError when rotation is active', async () => {
    _active = true;
    const wrapped = makeQuotaAwareAICall(async () => null as unknown as string);
    await expect(wrapped('s', 'u')).rejects.toBeInstanceOf(QuotaExhaustedError);
  });

  it('does NOT throw on empty response when rotation is inactive (original behavior)', async () => {
    _active = false;
    const wrapped = makeQuotaAwareAICall(async () => '');
    await expect(wrapped('s', 'u')).resolves.toBe('');
  });

  it('normalizes a detected quota/rate-limit error into QuotaExhaustedError', async () => {
    _active = true;
    const quotaErr = Object.assign(new Error('rate limit exceeded'), {
      statusCode: 429,
    });
    const wrapped = makeQuotaAwareAICall(async () => {
      throw quotaErr;
    });
    const err = await wrapped('s', 'u').catch((e) => e);
    expect(err).toBeInstanceOf(QuotaExhaustedError);
  });

  it('re-throws non-quota errors unchanged', async () => {
    _active = true;
    const other = new Error('something broke');
    const wrapped = makeQuotaAwareAICall(async () => {
      throw other;
    });
    await expect(wrapped('s', 'u')).rejects.toThrow('something broke');
  });
});
