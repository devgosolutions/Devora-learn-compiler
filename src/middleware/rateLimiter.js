const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');

const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a minute',
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

const executionRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 requests per IP for /api/execute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Rate limit for code execution exceeded, please wait a bit',
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

module.exports = {
  globalRateLimiter,
  executionRateLimiter,
};
