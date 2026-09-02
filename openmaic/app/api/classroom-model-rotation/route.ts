import { type NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';
import {
  getFreeModelRotationState,
  initFreeModelRotation,
  isFreeRotationActive,
  isFreeModelPoolEmpty,
  resetFreeModelRotation,
  rotateFreeModel,
} from '@/lib/server/free-model-rotation';

const log = createLogger('ClassroomModelRotation API');

export const dynamic = 'force-dynamic';

/**
 * GET /api/classroom-model-rotation
 * Returns the current rotation status: whether it's active, the current model,
 * the candidate pool, and the most recent rotation / quota-error events.
 */
export async function GET(_req: NextRequest) {
  try {
    initFreeModelRotation();
    const state = getFreeModelRotationState();
    return apiSuccess({
      ...state,
      poolSize: state.pool.length,
    });
  } catch (error) {
    log.error('Failed to read model-rotation state:', error);
    return apiError(
      'INTERNAL_ERROR',
      500,
      'Failed to read model-rotation state',
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * POST /api/classroom-model-rotation
 * Body: { action: 'rotate' | 'reset' }
 *   - rotate: immediately advance to the next free model (e.g. manual trigger).
 *   - reset:  reset back to the primary (index 0) free model.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string };
    const action = body.action;

    if (action === 'reset') {
      const model = await resetFreeModelRotation();
      return apiSuccess({ action: 'reset', currentModel: model });
    }

    if (action === 'rotate' || !action) {
      if (!isFreeRotationActive()) {
        return apiError(
          'PROVIDER_DISABLED',
          409,
          'Free-model rotation is not active. Set DEFAULT_MODEL to a free OpenRouter model, or set FREE_MODEL_ROTATION_ENABLED=true.',
        );
      }
      if (isFreeModelPoolEmpty()) {
        return apiError('INVALID_REQUEST', 409, 'Free-model pool is empty.');
      }
      const model = await rotateFreeModel('manual trigger via API');
      return apiSuccess({ action: 'rotate', currentModel: model });
    }

    return apiError('INVALID_REQUEST', 400, `Unknown action: ${action}`);
  } catch (error) {
    log.error('Failed to update model-rotation state:', error);
    return apiError(
      'INTERNAL_ERROR',
      500,
      'Failed to update model-rotation state',
      error instanceof Error ? error.message : String(error),
    );
  }
}
