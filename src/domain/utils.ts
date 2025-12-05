import type { TradingState } from './models.js';

export function calculateWeightedAverage(
  currentQuantity: number,
  currentAverage: number,
  purchaseQuantity: number,
  purchasePrice: number,
): number {
  const totalQuantity = currentQuantity + purchaseQuantity;

  if (totalQuantity === 0) {
    return 0;
  }

  const currentTotal = currentQuantity * currentAverage;
  const purchaseTotal = purchaseQuantity * purchasePrice;

  return (currentTotal + purchaseTotal) / totalQuantity;
}

export function createInitialState(): TradingState {
  return {
    quantity: 0,
    weightedAverage: 0,
    accumulatedLoss: 0,
  };
}
