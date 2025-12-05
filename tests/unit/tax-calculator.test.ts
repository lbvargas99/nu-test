import { describe, it, expect, beforeEach } from 'vitest';
import { processBuy, processSell } from '../../src/domain/tax-calculator.js';
import type { Operation, TradingState } from '../../src/domain/models.js';
import { createInitialState } from '../../src/domain/utils.js';

describe('tax-calculator', () => {
  let state: TradingState;

  beforeEach(() => {
    state = createInitialState();
  });

  describe('processBuy', () => {
    it('should return zero tax for buy operation', () => {
      const operation: Operation = {
        operation: 'buy',
        'unit-cost': 10,
        quantity: 100,
      };

      const result = processBuy(state, operation);
      expect(result.tax).toBe(0);
    });

    it('should update quantity after buy', () => {
      const operation: Operation = {
        operation: 'buy',
        'unit-cost': 10,
        quantity: 100,
      };

      processBuy(state, operation);
      expect(state.quantity).toBe(100);
    });

    it('should set weighted average on first buy', () => {
      const operation: Operation = {
        operation: 'buy',
        'unit-cost': 10,
        quantity: 100,
      };

      processBuy(state, operation);
      expect(state.weightedAverage).toBe(10);
    });

    it('should update weighted average on additional buy', () => {
      processBuy(state, { operation: 'buy', 'unit-cost': 10, quantity: 100 });
      processBuy(state, { operation: 'buy', 'unit-cost': 20, quantity: 100 });

      expect(state.quantity).toBe(200);
      expect(state.weightedAverage).toBe(15);
    });

    it('should not affect accumulated loss', () => {
      state.accumulatedLoss = 1000;
      processBuy(state, { operation: 'buy', 'unit-cost': 10, quantity: 100 });

      expect(state.accumulatedLoss).toBe(1000);
    });
  });

  describe('processSell', () => {
    beforeEach(() => {
      processBuy(state, { operation: 'buy', 'unit-cost': 10, quantity: 100 });
    });

    it('should return zero tax for sell operation <= 20000', () => {
      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 20,
        quantity: 50,
      };

      const result = processSell(state, operation);
      expect(result.tax).toBe(0);
    });

    it('should calculate tax for sell operation > 20000 with profit', () => {
      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 20,
        quantity: 5000,
      };

      const result = processSell(state, operation);

      expect(result.tax).toBe(10000);
    });

    it('should update quantity after sell', () => {
      processSell(state, { operation: 'sell', 'unit-cost': 15, quantity: 50 });
      expect(state.quantity).toBe(50);
    });

    it('should accumulate loss on sell with loss', () => {
      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 5,
        quantity: 50,
      };

      const result = processSell(state, operation);

      expect(result.tax).toBe(0);
      expect(state.accumulatedLoss).toBe(250);
    });

    it('should deduct accumulated loss from profit', () => {
      state.accumulatedLoss = 5000;

      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 20,
        quantity: 5000,
      };

      const result = processSell(state, operation);

      expect(result.tax).toBe(9000);
      expect(state.accumulatedLoss).toBe(0);
    });

    it('should handle accumulated loss greater than profit', () => {
      state.accumulatedLoss = 60000;

      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 20,
        quantity: 5000,
      };

      const result = processSell(state, operation);
      expect(result.tax).toBe(0);
      expect(state.accumulatedLoss).toBe(10000);
    });

    it('should NOT deduct loss if operation is exempt (<=20k)', () => {
      state.accumulatedLoss = 100;

      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 15,
        quantity: 100,
      };

      const result = processSell(state, operation);
      expect(result.tax).toBe(0);

      expect(state.accumulatedLoss).toBe(100);
    });

    it('should handle partial loss deduction', () => {
      state.accumulatedLoss = 3000;

      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 20,
        quantity: 5000,
      };

      const result = processSell(state, operation);

      expect(result.tax).toBe(9400);
      expect(state.accumulatedLoss).toBe(0);
    });

    it('should round tax to 2 decimal places', () => {
      state = createInitialState();
      processBuy(state, {
        operation: 'buy',
        'unit-cost': 10.53,
        quantity: 10000,
      });

      const operation: Operation = {
        operation: 'sell',
        'unit-cost': 15.78,
        quantity: 10000,
      };

      const result = processSell(state, operation);

      expect(result.tax).toBe(10500);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple buys and sells with loss accumulation', () => {
      processBuy(state, { operation: 'buy', 'unit-cost': 20, quantity: 10000 });
      expect(state.quantity).toBe(10000);
      expect(state.weightedAverage).toBe(20);

      const result1 = processSell(state, {
        operation: 'sell',
        'unit-cost': 10,
        quantity: 5000,
      });
      expect(result1.tax).toBe(0);
      expect(state.accumulatedLoss).toBe(50000);

      const result2 = processSell(state, {
        operation: 'sell',
        'unit-cost': 20,
        quantity: 5000,
      });

      expect(result2.tax).toBe(0);
    });

    it('should handle sell all then new buy', () => {
      state = createInitialState();
      processBuy(state, { operation: 'buy', 'unit-cost': 10, quantity: 100 });

      processSell(state, { operation: 'sell', 'unit-cost': 15, quantity: 100 });
      expect(state.quantity).toBe(0);

      processBuy(state, { operation: 'buy', 'unit-cost': 20, quantity: 50 });
      expect(state.quantity).toBe(50);
      expect(state.weightedAverage).toBe(20);
    });
  });
});
