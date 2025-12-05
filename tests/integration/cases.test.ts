import { describe, it, expect } from 'vitest';
import { processOperations } from '../../src/processor.js';
import type { Operation } from '../../src/domain/models.js';

describe('Integration Tests - Specification Cases', () => {
  describe('Case #1 - Sales with exemption', () => {
    it('should not charge tax on sales below R$ 20,000', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 100 },
        { operation: 'sell', 'unit-cost': 15.0, quantity: 50 },
        { operation: 'sell', 'unit-cost': 15.0, quantity: 50 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([{ tax: 0 }, { tax: 0 }, { tax: 0 }]);
    });
  });

  describe('Case #2 - Profit and loss', () => {
    it('should charge tax on profit > 20k and accumulate loss', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 20.0, quantity: 5000 },
        { operation: 'sell', 'unit-cost': 5.0, quantity: 5000 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([{ tax: 0 }, { tax: 10000 }, { tax: 0 }]);
    });
  });

  describe('Case #3 - Loss deduction', () => {
    it('should deduct accumulated loss from future profit', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 5.0, quantity: 5000 },
        { operation: 'sell', 'unit-cost': 20.0, quantity: 3000 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([{ tax: 0 }, { tax: 0 }, { tax: 1000 }]);
    });
  });

  describe('Case #4 - Weighted average (no profit)', () => {
    it('should calculate weighted average correctly with no profit', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
        { operation: 'buy', 'unit-cost': 25.0, quantity: 5000 },
        { operation: 'sell', 'unit-cost': 15.0, quantity: 10000 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([{ tax: 0 }, { tax: 0 }, { tax: 0 }]);
    });
  });

  describe('Case #5 - Weighted average with profit', () => {
    it('should calculate tax on profit after weighted average', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
        { operation: 'buy', 'unit-cost': 25.0, quantity: 5000 },
        { operation: 'sell', 'unit-cost': 15.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 25.0, quantity: 5000 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 10000 },
      ]);
    });
  });

  describe('Case #6 - Loss accumulation with exemption', () => {
    it('should accumulate loss even when operation <= 20k', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 2.0, quantity: 5000 },
        { operation: 'sell', 'unit-cost': 20.0, quantity: 2000 },
        { operation: 'sell', 'unit-cost': 20.0, quantity: 2000 },
        { operation: 'sell', 'unit-cost': 25.0, quantity: 1000 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 3000 },
      ]);
    });
  });

  describe('Case #7 - Multiple operations with new purchase', () => {
    it('should reset weighted average after selling all and buying new', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 2.0, quantity: 5000 },
        { operation: 'sell', 'unit-cost': 20.0, quantity: 2000 },
        { operation: 'sell', 'unit-cost': 20.0, quantity: 2000 },
        { operation: 'sell', 'unit-cost': 25.0, quantity: 1000 },
        { operation: 'buy', 'unit-cost': 20.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 15.0, quantity: 5000 },
        { operation: 'sell', 'unit-cost': 30.0, quantity: 4350 },
        { operation: 'sell', 'unit-cost': 30.0, quantity: 650 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 3000 },
        { tax: 0 },
        { tax: 0 },
        { tax: 3700 },
        { tax: 0 },
      ]);
    });
  });

  describe('Case #8 - Large profits', () => {
    it('should calculate tax on large profits correctly', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 50.0, quantity: 10000 },
        { operation: 'buy', 'unit-cost': 20.0, quantity: 10000 },
        { operation: 'sell', 'unit-cost': 50.0, quantity: 10000 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([
        { tax: 0 },
        { tax: 80000 },
        { tax: 0 },
        { tax: 60000 },
      ]);
    });
  });

  describe('Case #9 - Complex weighted average with exemption', () => {
    it('should handle complex scenario with multiple buys and exemptions', () => {
      const operations: Operation[] = [
        { operation: 'buy', 'unit-cost': 5000.0, quantity: 10 },
        { operation: 'sell', 'unit-cost': 4000.0, quantity: 5 },
        { operation: 'buy', 'unit-cost': 15000.0, quantity: 5 },
        { operation: 'buy', 'unit-cost': 4000.0, quantity: 2 },
        { operation: 'buy', 'unit-cost': 23000.0, quantity: 2 },
        { operation: 'sell', 'unit-cost': 20000.0, quantity: 1 },
        { operation: 'sell', 'unit-cost': 12000.0, quantity: 10 },
        { operation: 'sell', 'unit-cost': 15000.0, quantity: 3 },
      ];

      const result = processOperations(operations);

      expect(result).toEqual([
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 0 },
        { tax: 1000 },
        { tax: 2400 },
      ]);
    });
  });
});
