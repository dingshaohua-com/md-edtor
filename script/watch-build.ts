#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { watch } from 'chokidar';
import { resolve } from 'node:path';
import chalk from 'chalk';

const tsconfigPath = resolve('tsconfig.lib.json');

let debounceTimer: NodeJS.Timeout | null = null;

function run(cmd: string, args: string[]) {
  return new Promise<void>((ok, fail) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => (code === 0 ? ok() : fail()));
  });
}

async function build() {
  try {
    console.log(chalk.cyan('[TSC] 编译中...'));
    await run('tsc', ['-b', tsconfigPath]);

    console.log(chalk.magenta('[VITE] 构建中...'));
    await run('vite', ['build']);

    console.log(chalk.green('✅ 构建完成'));
  } catch {
    console.log(chalk.red('❌ 构建失败'));
  }
}

watch('lib', { ignoreInitial: true })
  .on('all', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(build, 300);
  });

console.log(chalk.blue('👀 监听 src 目录中...'));