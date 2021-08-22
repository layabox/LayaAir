const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT_DIR = process.cwd();

if (fs.existsSync('build')) fs.rmdirSync('build', { recursive: true });
if (fs.existsSync('bin/tsc/layaAir')) fs.rmdirSync('bin/tsc/layaAir', { recursive: true });

process.chdir('src/publishTool');
cp.execSync('node index.js', { stdio: 'inherit' });

process.chdir(ROOT_DIR);
cp.execSync(`${path.join('node_modules', '.bin', 'gulp')} --cwd=src build`, { stdio: 'inherit' });