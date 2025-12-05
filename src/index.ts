import * as readline from 'readline';
import { processOperations } from './processor.js';
import type { Operation } from './domain/models.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line: string) => {
  if (line.trim() === '') {
    rl.close();
    return;
  }

  try {
    const operations: Operation[] = JSON.parse(line);
    const results = processOperations(operations);
    console.log(JSON.stringify(results));
  } catch {
    process.exit(1);
  }
});
