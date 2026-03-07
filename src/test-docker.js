require('dotenv').config();
const { runCode } = require('./services/docker.service');
const logger = require('./utils/logger');
const path = require('path');
const fs = require('fs');

async function test() {
  const tests = [
    {
      language: 'python',
      code: 'print("Hello Python")\nimport sys\nprint(f"Stdin: {sys.stdin.read()}")',
      stdin: 'Python Stdin',
    },
  ];

  for (const t of tests) {
    logger.info(`Testing ${t.language}...`);
    try {
      const result = await runCode(
        t.language,
        t.code,
        t.stdin,
        (chunk) => console.log(`[${t.language} STDOUT]`, chunk.toString()),
        (chunk) => console.error(`[${t.language} STDERR]`, chunk.toString())
      );
      logger.info(`${t.language} Result: %o`, result);
    } catch (err) {
      logger.error(`${t.language} Test Failed:`, err);
    }
  }
}

// Make sure /tmp/jobs exists for testing if running locally on Windows
if (process.platform === 'win32') {
    if (!fs.existsSync('C:\\tmp\\jobs')) {
        fs.mkdirSync('C:\\tmp\\jobs', { recursive: true });
    }
}

test();
