export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true
    }]
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/index.ts',
    '!src/types/**', // Exclude type definitions from coverage
    '!src/utils/image/loader.ts', // Complex image loading utilities
    '!src/utils/performance/render-optimizer.ts', // Performance optimization utilities
    '!src/utils/performance/viewport-culling.ts' // Viewport culling utilities
  ],
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  // NOTE: thresholds temporarily relaxed during the v2 refactor (Phases 2–6).
  // Phase 7 will restore branches/lines to 80 once the architecture has settled
  // and the new tests for plugin/store/bus paths land.
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  verbose: true
};