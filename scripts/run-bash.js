/**
 * Cross-platform bash script runner for Windows, macOS, and Linux
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const scriptName = process.argv[2];
if (!scriptName) {
  console.error('Usage: node scripts/run-bash.js <script-name>');
  process.exit(1);
}

const scriptPath = path.resolve(__dirname, scriptName);

let bashCmd = 'bash';
if (process.platform === 'win32') {
  const candidates = [
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files\\Git\\usr\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      bashCmd = candidate;
      break;
    }
  }
}

const res = spawnSync(bashCmd, [scriptPath], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});

if (res.error) {
  console.error(`Failed to invoke bash (${bashCmd}):`, res.error);
  process.exit(1);
}
process.exit(res.status ?? 0);
