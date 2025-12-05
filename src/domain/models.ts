export interface Operation {
  operation: 'buy' | 'sell';
  'unit-cost': number;
  quantity: number;
}

export interface TaxResult {
  tax: number;
}

export interface TradingState {
  quantity: number;
  weightedAverage: number;
  accumulatedLoss: number;
}
