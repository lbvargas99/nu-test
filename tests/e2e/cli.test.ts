import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, '../../dist/index.js');

function runCLI(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [cliPath]);
    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      } else {
        resolve(output.trim());
      }
    });

    child.stdin.write(input);
    child.stdin.end();
  });
}

describe('E2E CLI Tests', () => {
  it('should process Case #1 (exemption)', async () => {
    const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]\n`;

    const output = await runCLI(input);

    expect(output).toBe('[{"tax":0},{"tax":0},{"tax":0}]');
  });

  it('should process Case #2 (profit and loss)', async () => {
    const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]\n`;

    const output = await runCLI(input);

    expect(output).toBe('[{"tax":0},{"tax":10000},{"tax":0}]');
  });

  it('should process Case #3 (loss deduction)', async () => {
    const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 3000}]\n`;

    const output = await runCLI(input);

    expect(output).toBe('[{"tax":0},{"tax":0},{"tax":1000}]');
  });

  it('should process multiple lines independently', async () => {
    const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]\n[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]\n`;

    const output = await runCLI(input);

    const lines = output.split('\n');
    expect(lines[0]).toBe('[{"tax":0},{"tax":0},{"tax":0}]');
    expect(lines[1]).toBe('[{"tax":0},{"tax":10000},{"tax":0}]');
  });

  it('should handle Case #9 (complex weighted average)', async () => {
    const input = `[{"operation": "buy", "unit-cost": 5000.00, "quantity": 10},{"operation": "sell", "unit-cost": 4000.00, "quantity": 5},{"operation": "buy", "unit-cost": 15000.00, "quantity": 5},{"operation": "buy", "unit-cost": 4000.00, "quantity": 2},{"operation": "buy", "unit-cost": 23000.00, "quantity": 2},{"operation": "sell", "unit-cost": 20000.00, "quantity": 1},{"operation": "sell", "unit-cost": 12000.00, "quantity": 10},{"operation": "sell", "unit-cost": 15000.00, "quantity": 3}]\n`;

    const output = await runCLI(input);

    expect(output).toBe(
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":1000},{"tax":2400}]',
    );
  });

  it('should terminate on empty line', async () => {
    const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]\n\n`;

    const output = await runCLI(input);

    expect(output).toBe('[{"tax":0}]');
  });
});
