const axios = require('axios');
const io = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

const API_URL = 'http://localhost:5000/api/execute';
const SOCKET_URL = 'http://localhost:5000';

const testExec = async (language, code, stdin = '') => {
  console.log(`\n--- Testing ${language.toUpperCase()} ---`);
  
  const socket = io(SOCKET_URL);
  
  return new Promise((resolve) => {
    socket.on('connect', async () => {
      console.log('Socket connected:', socket.id);
      
      try {
        const response = await axios.post(API_URL, {
          language,
          code,
          stdin
        }, {
          headers: {
            'x-socket-id': socket.id
          }
        });

        const { jobId } = response.data;
        console.log('Job accepted:', jobId);
        
        socket.emit('join:job', jobId);

        socket.on('job:started', (data) => console.log('Job Started:', data.jobId));
        socket.on('job:stdout', (data) => process.stdout.write(`STDOUT: ${data.chunk}`));
        socket.on('job:stderr', (data) => process.stderr.write(`STDERR: ${data.chunk}`));
        socket.on('job:done', (data) => {
          console.log('\nJob Done:', data);
          socket.disconnect();
          resolve(data);
        });
        socket.on('job:failed', (data) => {
          console.error('\nJob Failed:', data);
          socket.disconnect();
          resolve(data);
        });

      } catch (err) {
        console.error('API Error:', err.response?.data || err.message);
        socket.disconnect();
        resolve(null);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
      resolve(null);
    });
  });
};

async function runTests() {
  const tests = [
    {
      language: 'python',
      code: 'name = input()\nprint(f"Hello, {name}!")',
      stdin: 'Python-User'
    },
    {
      language: 'cpp',
      code: '#include <iostream>\nusing namespace std;\nint main() {\n  string name;\n  cin >> name;\n  cout << "Hello, " << name << "!" << endl;\n  return 0;\n}',
      stdin: 'CPP-User'
    }
  ];

  for (const t of tests) {
    await testExec(t.language, t.code, t.stdin);
  }
}

// Need to install axios as well
// runTests();
