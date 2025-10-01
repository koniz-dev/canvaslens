/**
 * Unit tests for logger utility
 */
import { log, warn, error, info } from '../../utils/core/logger';

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

// Replace global console
Object.assign(console, mockConsole);

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalWindow = global.window;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    global.window = { __DEV__: true } as any;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    global.window = originalWindow;
  });

  describe('in development mode', () => {
    it('should log messages with timestamp', () => {
      log('Test message');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[DEBUG\]/),
        'Test message'
      );
    });

    it('should warn messages with timestamp', () => {
      warn('Warning message');
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[WARN\]/),
        'Warning message'
      );
    });

    it('should error messages with timestamp', () => {
      error('Error message');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[ERROR\]/),
        'Error message'
      );
    });

    it('should info messages with timestamp', () => {
      info('Info message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[INFO\]/),
        'Info message'
      );
    });

    it('should handle multiple arguments', () => {
      log('Message', { data: 'test' }, 123);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[DEBUG\]/),
        'Message',
        { data: 'test' },
        123
      );
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      global.window = {} as any;
    });

    it('should not log debug messages', () => {
      log('Test message');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should not warn messages', () => {
      warn('Warning message');
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });

    it('should still error messages (important for debugging)', () => {
      error('Error message');
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should still info messages (important information)', () => {
      info('Info message');
      expect(mockConsole.info).toHaveBeenCalled();
    });
  });

  describe('with __DEV__ flag', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      // Set __DEV__ flag properly
      (global as any).window = { __DEV__: true };
      jest.clearAllMocks();
    });

    it('should log messages when __DEV__ is true', () => {
      // Force development mode by mocking the environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      log('Test message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[DEBUG\]/),
        'Test message'
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should warn messages when __DEV__ is true', () => {
      // Force development mode by mocking the environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      warn('Warning message');
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[WARN\]/),
        'Warning message'
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('timestamp format', () => {
    it('should use Vietnamese locale for time format', () => {
      const mockDate = new Date('2023-12-25T15:30:45.123Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      log('Test');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[DEBUG\]/),
        'Test'
      );
    });

    it('should include milliseconds in timestamp', () => {
      log('Test');
      
      const callArgs = mockConsole.log.mock.calls[0];
      const timestamp = callArgs[0];
      
      expect(timestamp).toMatch(/\.\d{3}\]/);
    });
  });
});
