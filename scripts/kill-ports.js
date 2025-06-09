const { execSync } = require('child_process');

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const command = `netstat -ano | findstr :${port}`;
      const output = execSync(command).toString();
      const lines = output.split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          try {
            execSync(`taskkill /F /PID ${pid}`);
            console.log(`Killed process ${pid} on port ${port}`);
          } catch (err) {
            console.error(`Failed to kill process ${pid} on port ${port}:`, err.message);
          }
        }
      }
    } else {
      const command = `lsof -i :${port} | grep LISTEN`;
      try {
        const output = execSync(command).toString();
        const lines = output.split('\n');
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 1) {
            const pid = parts[1];
            try {
              execSync(`kill -9 ${pid}`);
              console.log(`Killed process ${pid} on port ${port}`);
            } catch (err) {
              console.error(`Failed to kill process ${pid} on port ${port}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.log(`No process found on port ${port}`);
      }
    }
  } catch (err) {
    console.log(`No process found on port ${port}`);
  }
}

// Kill both ports
console.log('Killing processes on ports 3000 and 3001...');
killPort(3000);
killPort(3001);
console.log('Port cleanup completed'); 