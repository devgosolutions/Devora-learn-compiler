const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { TIMEOUTS, LIMITS } = require('../config/constants');

const BASE_JOBS_DIR = process.env.JOBS_DIR || '/tmp/jobs';

const runCode = async (language, code, stdin, onStdout, onStderr) => {
  const jobId = uuidv4();
  const jobDir = path.resolve(BASE_JOBS_DIR, jobId);
  
  // File names based on language
  const fileNames = {
    cpp: 'main.cpp',
    python: 'main.py',
    rust: 'main.rs',
    go: 'main.go',
    java: 'Main.java',
  };

  const fileName = fileNames[language];
  const codePath = path.join(jobDir, fileName);
  const stdinPath = path.join(jobDir, 'stdin.txt');
  let stdoutSize = 0;
  let stderrSize = 0;

  try {
    // 1. Create temp dir
    await fs.mkdir(jobDir, { recursive: true });

    // 2. Write code
    await fs.writeFile(codePath, code);

    // 3. Write stdin if provided
    if (stdin) {
      await fs.writeFile(stdinPath, stdin);
    }

    const startTime = Date.now();
    const timeout = TIMEOUTS[language] || 10000;

    // 4. Docker command
    const args = [
      'run', '--rm',
      '--network', 'none',
      '--cpus', '1.0',
      '--memory', '256m',
      '--memory-swap', '256m',
      '--pids-limit', '50',
      '--read-only',
      '--tmpfs', '/tmp:rw,exec,size=64m',
      '--security-opt', 'no-new-privileges',
      '-u', '1000:1000',
      '-v', `${jobDir}:/code:ro`,
      `compiler-${language}`,
      '/bin/sh', '/run.sh'
    ];

    logger.info(`Starting execution for job: ${jobId}, language: ${language}`);

    const dockerProcess = spawn('docker', args);

    // Output buffering and streaming
    dockerProcess.stdout.on('data', (data) => {
      if (stdoutSize < LIMITS.MAX_OUTPUT_SIZE) {
        const remaining = LIMITS.MAX_OUTPUT_SIZE - stdoutSize;
        const chunk = data.slice(0, remaining);
        onStdout(chunk);
        stdoutSize += chunk.length;
      }
    });

    dockerProcess.stderr.on('data', (data) => {
      if (stderrSize < LIMITS.MAX_OUTPUT_SIZE) {
        const remaining = LIMITS.MAX_OUTPUT_SIZE - stderrSize;
        const chunk = data.slice(0, remaining);
        onStderr(chunk);
        stderrSize += chunk.length;
      }
    });

    // 5. Hard kill after timeout
    const timeoutHandle = setTimeout(() => {
      logger.warn(`Job ${jobId} timed out after ${timeout}ms. Killing container...`);
      dockerProcess.kill('SIGKILL');
      // Additional docker kill if necessary (container name tracking would be better)
      // Since --rm is used, killing the process should ideally clean up.
      // Better to use --name and 'docker kill' for absolute safety, but we'll stick to spawn pid for now.
    }, timeout);

    const result = await new Promise((resolve) => {
      dockerProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        const duration = Date.now() - startTime;
        resolve({ exitCode: code, duration });
      });

      dockerProcess.on('error', (err) => {
        logger.error(`Docker process error for job ${jobId}:`, err);
        clearTimeout(timeoutHandle);
        resolve({ exitCode: -1, duration: 0, error: err.message });
      });
    });

    return result;

  } catch (error) {
    logger.error(`Error in runCode Service for job ${jobId}:`, error);
    throw error;
  } finally {
    // 6. Cleanup temp dir
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
      logger.info(`Cleaned up job directory: ${jobDir}`);
    } catch (cleanupError) {
      logger.error(`Failed to cleanup job directory ${jobDir}:`, cleanupError);
    }
  }
};

module.exports = {
  runCode,
};
