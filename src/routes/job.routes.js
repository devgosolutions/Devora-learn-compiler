const express = require('express');
const router = express.Router();
const { getJobStatus, getRecentSubmissions } = require('../controllers/job.controller');

router.get('/:jobId', getJobStatus);
router.get('/history', getRecentSubmissions);

module.exports = router;
