import { describe, it, expect } from 'vitest';
import {
  calculateWeightedAverage,
  createInitialState,
} from '../../src/domain/utils.js';

describe('utils', () => {
  describe('calculateWeightedAverage', () => {
    it('should calculate weighted average for initial purchase', () => {
      const result = calculateWeightedAverage(0, 0, 100, 10);
      expect(result).toBe(10);
    });

    it('should calculate weighted average for additional purchase at same price', () => {
      const result = calculateWeightedAverage(100, 10, 100, 10);
      expect(result).toBe(10);
    });

    it('should calculate weighted average for additional purchase at higher price', () => {
      const result = calculateWeightedAverage(100, 10, 100, 20);
      expect(result).toBe(15);
    });

    it('should calculate weighted average for additional purchase at lower price', () => {
      const result = calculateWeightedAverage(100, 20, 100, 10);
      expect(result).toBe(15);
    });

    it('should calculate weighted average with different quantities', () => {
      const result = calculateWeightedAverage(100, 20, 50, 10);
      expect(result).toBeCloseTo(16.67, 2);
    });

    it('should handle zero total quantity', () => {
      const result = calculateWeightedAverage(0, 0, 0, 10);
      expect(result).toBe(0);
    });

    it('should calculate correctly with decimal prices', () => {
      const result = calculateWeightedAverage(100, 10.5, 100, 15.75);
      expect(result).toBe(13.125);
    });
  });

  describe('createInitialState', () => {
    it('should create initial state with all values at zero', () => {
      const state = createInitialState();
      expect(state).toEqual({
        quantity: 0,
        weightedAverage: 0,
        accumulatedLoss: 0,
      });
    });

    it('should create a new object each time', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });
});
