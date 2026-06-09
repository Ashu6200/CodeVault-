import { execSync } from 'child_process';

const port = process.argv[2] || 5959;

try {
  console.log(`Checking port ${port}...`);
  const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
  const lines = stdout.split('\n');
  
  const pids = new Set();
  for (const line of lines) {
    const match = line.trim().match(/LISTENING\s+(\d+)/);
    if (match) {
      pids.add(match[1]);
    }
  }

  for (const pid of pids) {
    console.log(`Killing process ${pid} using port ${port}...`);
    try {
      execSync(`taskkill /F /PID ${pid}`);
      // Wait a bit for OS to release the port
      execSync('node -e "setTimeout(()=>{}, 200)"');
    } catch (e) {
      // Ignore if process already died
    }
  }
} catch (err) {
  // If findstr returns nothing, it throws. That means no process is using the port.
}
