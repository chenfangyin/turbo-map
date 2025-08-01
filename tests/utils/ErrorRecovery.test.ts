import { ErrorRecoveryManager, ErrorType, RecoveryAction } from '../../src/turboMap/utils/ErrorRecovery';

describe('ErrorRecovery', () => {
  let errorRecovery: ErrorRecoveryManager;

  beforeEach(() => {
    errorRecovery = new ErrorRecoveryManager();
  });

  describe('Basic Error Recovery', () => {
    test('should handle successful operations', () => {
      const operation = jest.fn().mockReturnValue('success');
      const fallback = jest.fn().mockReturnValue('fallback');
      
      const result = errorRecovery.executeWithRecovery(
        operation,
        fallback,
        'test-operation',
        ErrorType.UNKNOWN
      );
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(fallback).not.toHaveBeenCalled();
    });

    test('should use fallback for failed operations', () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('Operation failed');
      });
      const fallback = jest.fn().mockReturnValue('fallback');
      
      const result = errorRecovery.executeWithRecovery(
        operation,
        fallback,
        'test-operation',
        ErrorType.UNKNOWN
      );
      
      expect(result).toBe('fallback');
      expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    test('should handle async operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const fallback = jest.fn().mockResolvedValue('fallback');
      
      const result = await errorRecovery.executeAsyncWithRecovery(
        operation,
        fallback,
        'test-operation',
        ErrorType.UNKNOWN
      );
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(fallback).not.toHaveBeenCalled();
    });

    test('should use fallback for failed async operations', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Async operation failed'));
      const fallback = jest.fn().mockResolvedValue('fallback');
      
      const result = await errorRecovery.executeAsyncWithRecovery(
        operation,
        fallback,
        'test-operation',
        ErrorType.UNKNOWN
      );
      
      expect(result).toBe('fallback');
      expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry
      expect(fallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle different error types', () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('Serialization error');
      });
      const fallback = jest.fn().mockReturnValue('fallback');
      
      const result = errorRecovery.executeWithRecovery(
        operation,
        fallback,
        'test-operation',
        ErrorType.SERIALIZATION
      );
      
      expect(result).toBe('fallback');
    });

    test('should track error statistics', () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const fallback = jest.fn().mockReturnValue('fallback');
      
      errorRecovery.executeWithRecovery(
        operation,
        fallback,
        'test-operation',
        ErrorType.UNKNOWN
      );
      
      const stats = errorRecovery.getStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byType[ErrorType.UNKNOWN]).toBeGreaterThan(0);
    });
  });

  describe('Recovery Policies', () => {
    test('should set and get policies', () => {
      const policy = {
        maxRetries: 3,
        retryDelay: 100,
        escalationThreshold: 5,
        fallbackMode: false
      };
      
      errorRecovery.setPolicy(ErrorType.SERIALIZATION, policy);
      const retrievedPolicy = errorRecovery.getPolicy(ErrorType.SERIALIZATION);
      
      expect(retrievedPolicy).toEqual(policy);
    });

    test('should handle fallback mode', () => {
      expect(errorRecovery.isInFallbackMode()).toBe(false);
      
      // Trigger fallback mode by causing many errors
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const fallback = jest.fn().mockReturnValue('fallback');
      
      for (let i = 0; i < 10; i++) {
        errorRecovery.executeWithRecovery(
          operation,
          fallback,
          'test-operation',
          ErrorType.UNKNOWN
        );
      }
      
      // After many errors, should be in fallback mode
      expect(errorRecovery.isInFallbackMode()).toBe(true);
    });
  });

  describe('Health Status', () => {
    test('should provide health status', () => {
      const health = errorRecovery.getHealthStatus();
      
      expect(health).toBeDefined();
      expect(health.healthy).toBeDefined();
      expect(health.errorRate).toBeDefined();
      expect(health.inFallbackMode).toBeDefined();
    });
  });
}); 
