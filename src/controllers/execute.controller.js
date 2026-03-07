const { v4: uuidv4 } = require('uuid');
const Submission = require('../models/Submission');
const { addJob } = require('../services/queue.service');
const socketService = require('../services/socket.service');
const logger = require('../utils/logger');

const executeCode = async (req, res, next) => {
  try {
    const { code, language, stdin } = req.body;
    const socketId = req.headers['x-socket-id'];
    const jobId = uuidv4();

    logger.info(`New execution request for language ${language}, jobId: ${jobId}`);

    // Persist pending submission
    const submission = new Submission({
      jobId,
      language,
      code,
      stdin,
      status: 'queued',
    });
    await submission.save();

    // Add to queue
    await addJob({
      jobId,
      language,
      code,
      stdin,
      socketId,
    });

    // Emit queued event if socketId is provided and socket service is ready
    socketService.emitToJob(jobId, 'job:queued', { jobId, status: 'queued' });

    // 202: Accepted (Execution started asynchronously)
    return res.status(202).json({
      jobId,
      status: 'queued',
      message: 'Code execution started',
    });
  } catch (error) {
    logger.error('Execute Controller Error:', error);
    next(error);
  }
};

module.exports = {
  executeCode,
};
