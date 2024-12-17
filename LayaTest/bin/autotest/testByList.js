import {execSync} from 'child_process';
import fs from 'fs';

import path from 'path';

const testListFile = process.argv[2];

if (!testListFile) {
  console.error('Please provide a test list file');
  process.exit(1);
}

// 读取文件内容，分割成数组，并过滤掉空行
let testFiles = fs.readFileSync(testListFile, 'utf-8')
  .split('\n')
  .filter(Boolean)
  .map(file => file.trim());

// 确保所有文件名以 .js 结尾
testFiles = testFiles.map(file => {
  if (!file.endsWith('.js')) {
    return file + '.js';
  }
  return file;
});

// 构建命令
const command = `node autotest.js ${testFiles.join(' ')}`;

// 执行命令
try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Error executing tests:', error);
  process.exit(1);
}