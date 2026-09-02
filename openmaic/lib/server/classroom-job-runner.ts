import { createLogger } from '@/lib/logger';
import { generateClassroom, type GenerateClassroomInput } from '@/lib/server/classroom-generation';
import {
  markClassroomGenerationJobFailed,
  markClassroomGenerationJobRunning,
  markClassroomGenerationJobSucceeded,
  updateClassroomGenerationJobProgress,
} from '@/lib/server/classroom-job-store';
import {
  isFreeRotationActive,
  QuotaExhaustedError,
  rotateFreeModel,
} from '@/lib/server/free-model-rotation';

const log = createLogger('ClassroomJob');
const runningJobs = new Map<string, Promise<void>>();

/** Maximum number of automatic model rotations before giving up on a job. */
const MAX_ROTATIONS_PER_JOB = 5;

export function runClassroomGenerationJob(
  jobId: string,
  input: GenerateClassroomInput,
  baseUrl: string,
): Promise<void> {
  const existing = runningJobs.get(jobId);
  if (existing) {
    return existing;
  }

  const jobPromise = (async () => {
    const rotationsUsed = { value: 0 };
    try {
      await markClassroomGenerationJobRunning(jobId);

      // Retry loop: if the configured free model's quota is exhausted, rotate
      // to the next candidate and re-run the whole generation with the new
      // DEFAULT_MODEL. This removes the need to manually swap the model string.
      while (true) {
        try {
          const result = await generateClassroom(input, {
            baseUrl,
            onProgress: async (progress) => {
              await updateClassroomGenerationJobProgress(jobId, progress);
            },
          });

          await markClassroomGenerationJobSucceeded(jobId, result);
          return;
        } catch (error) {
          if (
            isFreeRotationActive() &&
            rotationsUsed.value < MAX_ROTATIONS_PER_JOB &&
            error instanceof QuotaExhaustedError
          ) {
            rotationsUsed.value += 1;
            const next = await rotateFreeModel(
              error instanceof Error ? error.message : 'quota exhausted',
            );
            log.warn(
              `Classroom job ${jobId}: retrying generation with rotated model ${next} (rotation ${rotationsUsed.value}/${MAX_ROTATIONS_PER_JOB}).`,
            );
            // Re-mark running so the status API reflects the retry.
            await markClassroomGenerationJobRunning(jobId);
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`Classroom generation job ${jobId} failed:`, error);
      try {
        await markClassroomGenerationJobFailed(jobId, message);
      } catch (markFailedError) {
        log.error(`Failed to persist failed status for job ${jobId}:`, markFailedError);
      }
    } finally {
      runningJobs.delete(jobId);
    }
  })();

  runningJobs.set(jobId, jobPromise);
  return jobPromise;
}
