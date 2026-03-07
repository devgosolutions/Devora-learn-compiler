const Submission = require('../models/Submission');
const logger = require('../utils/logger');

const getJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const submission = await Submission.findOne({ jobId });

    if (!submission) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json(submission);
  } catch (error) {
    logger.error('Job Controller Error:', error);
    next(error);
  }
};

const getRecentSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 }).limit(10);
    return res.status(200).json(submissions);
  } catch (error) {
    logger.error('Recent Submissions Error:', error);
    next(error);
  }
};

module.exports = {
  getJobStatus,
  getRecentSubmissions,
};
