const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/execute.controller');
const { executeValidator } = require('../middleware/validator');
const { executionRateLimiter } = require('../middleware/rateLimiter');

router.post('/execute', executionRateLimiter, executeValidator, executeCode);

module.exports = router;
