import type { Operation, TaxResult } from './domain/models.js';
import { processBuy, processSell } from './domain/tax-calculator.js';
import { createInitialState } from './domain/utils.js';

export function processOperations(operations: Operation[]): TaxResult[] {
  const state = createInitialState();
  const results: TaxResult[] = [];

  for (const operation of operations) {
    let result: TaxResult;

    if (operation.operation === 'buy') {
      result = processBuy(state, operation);
    } else {
      result = processSell(state, operation);
    }

    results.push(result);
  }

  return results;
}
