const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'python', 'rust', 'go', 'java'],
  },
  code: {
    type: String,
    required: true,
    maxlength: 65536,
  },
  stdin: {
    type: String,
    default: '',
    maxlength: 4096,
  },
  stdout: {
    type: String,
    default: '',
    maxlength: 102400, // 100KB
  },
  stderr: {
    type: String,
    default: '',
    maxlength: 102400, // 100KB
  },
  exitCode: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'done', 'failed', 'timeout'],
    default: 'queued',
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// TTL 30 days
SubmissionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Submission', SubmissionSchema);
