import type { Operation, TaxResult, TradingState } from './models.js';
import { calculateWeightedAverage } from './utils.js';

const TAX_EXEMPTION_THRESHOLD = 20000;
const TAX_RATE = 0.2;

export function processBuy(
  state: TradingState,
  operation: Operation,
): TaxResult {
  state.weightedAverage = calculateWeightedAverage(
    state.quantity,
    state.weightedAverage,
    operation.quantity,
    operation['unit-cost'],
  );

  state.quantity += operation.quantity;

  return { tax: 0 };
}

export function processSell(
  state: TradingState,
  operation: Operation,
): TaxResult {
  const sellPrice = operation['unit-cost'];
  const quantity = operation.quantity;
  const operationValue = sellPrice * quantity;

  const profitOrLoss = (sellPrice - state.weightedAverage) * quantity;

  state.quantity -= quantity;

  if (profitOrLoss < 0) {
    state.accumulatedLoss += Math.abs(profitOrLoss);
    return { tax: 0 };
  }

  if (operationValue <= TAX_EXEMPTION_THRESHOLD) {
    return { tax: 0 };
  }

  let taxableProfit = profitOrLoss;

  if (state.accumulatedLoss > 0) {
    if (state.accumulatedLoss >= taxableProfit) {
      state.accumulatedLoss -= taxableProfit;
      taxableProfit = 0;
    } else {
      taxableProfit -= state.accumulatedLoss;
      state.accumulatedLoss = 0;
    }
  }

  const tax = taxableProfit * TAX_RATE;

  return { tax: Math.round(tax * 100) / 100 };
}
