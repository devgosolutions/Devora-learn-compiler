const { codeExecutionQueue } = require('./queue.service');
const dockerService = require('./docker.service');
const socketService = require('./socket.service');
const Submission = require('../models/Submission');
const logger = require('../utils/logger');
const { LIMITS } = require('../config/constants');

const processJobs = () => {
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY) || 5;

  codeExecutionQueue.process(concurrency, async (job) => {
    const { jobId, language, code, stdin, socketId } = job.data;
    
    logger.info(`Starting job execution for ID: ${jobId}, language: ${language}`);
    
    // 1. Emit socket event job:started
    socketService.emitToJob(jobId, 'job:started', { jobId });

    // Mark as running in MongoDB
    await Submission.findOneAndUpdate({ jobId }, { status: 'running' });

    let stdout = '';
    let stderr = '';
    const onStdout = (chunk) => {
      const decodedChunk = chunk.toString();
      stdout += decodedChunk;
      socketService.emitToJob(jobId, 'job:stdout', { jobId, chunk: decodedChunk });
    };

    const onStderr = (chunk) => {
      const decodedChunk = chunk.toString();
      stderr += decodedChunk;
      socketService.emitToJob(jobId, 'job:stderr', { jobId, chunk: decodedChunk });
    };

    try {
      // 2. Call docker.service runCode()
      const result = await dockerService.runCode(language, code, stdin, onStdout, onStderr);

      // 4. On done → emit job:done
      socketService.emitToJob(jobId, 'job:done', {
        jobId,
        exitCode: result.exitCode,
        duration: result.duration,
      });

      // 5. Save result to MongoDB Submission model
      await Submission.findOneAndUpdate(
        { jobId },
        {
          stdout,
          stderr,
          exitCode: result.exitCode,
          duration: result.duration,
          status: 'done',
          completedAt: new Date(),
        }
      );

      return { success: true, ...result };
    } catch (error) {
      logger.error(`Job processing failed for ID: ${jobId}:`, error);

      // Handle failure
      const status = error.message.includes('timeout') ? 'timeout' : 'failed';
      
      socketService.emitToJob(jobId, 'job:failed', {
        jobId,
        error: error.message,
      });

      await Submission.findOneAndUpdate(
        { jobId },
        { 
          status,
          stderr: stderr + '\n' + error.message,
          completedAt: new Date(),
        }
      );

      throw error; // Let Bull handle retries if configured
    }
  });

  // Global listeners for failures
  codeExecutionQueue.on('failed', async (job, err) => {
    if (job.attemptsMade >= job.opts.attempts) {
      logger.error(`Job ${job.id} (ID: ${job.data.jobId}) permanently failed after all retries:`, err);
      // Already handled in process block for each job level, but can add more logic here.
    }
  });

  logger.info(`Worker service initialized with concurrency: ${concurrency}`);
};

module.exports = {
  processJobs,
};
