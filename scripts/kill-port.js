const { exec } = require('child_process');
const port = process.argv[2] || 5000;

const command = process.platform === 'win32'
  ? `netstat -ano | findstr :${port}`
  : `lsof -i :${port} | grep LISTEN`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.log(`No process found on port ${port}`);
    process.exit(0);
  }

  if (process.platform === 'win32') {
    const lines = stdout.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 4) {
        const pid = parts[parts.length - 1];
        exec(`taskkill /F /PID ${pid}`, (err) => {
          if (err) {
            console.error(`Failed to kill process ${pid}:`, err);
          } else {
            console.log(`Killed process ${pid} on port ${port}`);
          }
        });
      }
    }
  } else {
    const lines = stdout.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 1) {
        const pid = parts[1];
        exec(`kill -9 ${pid}`, (err) => {
          if (err) {
            console.error(`Failed to kill process ${pid}:`, err);
          } else {
            console.log(`Killed process ${pid} on port ${port}`);
          }
        });
      }
    }
  }
}); 