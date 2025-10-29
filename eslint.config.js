import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Image: 'readonly',
        customElements: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        performance: 'readonly',
        // Node.js globals
        process: 'readonly',
        global: 'readonly',
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'unused-imports': unusedImports,
      'import': importPlugin,
    },
    rules: {
      // Unused imports detection
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // TypeScript specific unused variable detection
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Disable the base rule as it can report incorrect errors
      'no-unused-vars': 'off',

      // Additional rules for better code quality
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      
      // Allow console.log in development but warn in production
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      
      // Prevent unused function parameters
      '@typescript-eslint/no-unused-expressions': 'error',
      
      // Circular dependency detection
      'import/no-cycle': ['error', { 
        maxDepth: 10,
        ignoreExternal: true,
        allowUnsafeDynamicCyclicDependency: false
      }],
      
      // Prevent self-imports
      'import/no-self-import': 'error',
      
      // Prevent useless path segments
      'import/no-useless-path-segments': 'error',
      
      // Ensure consistent import order
      'import/order': ['warn', {
        'groups': [
          'builtin',
          'external', 
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'never',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],
      
      // Prevent duplicate imports
      'import/no-duplicates': 'error',
      
      // Ensure proper file extensions
      'import/extensions': ['error', 'ignorePackages', {
        'ts': 'never',
        'tsx': 'never',
        'js': 'never',
        'jsx': 'never'
      }],
    },
  },
  {
    // Allow console in logger files
    files: ['src/utils/core/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Allow console in test files
    files: ['src/__tests__/**/*.ts', 'src/__tests__/**/*.tsx'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Ignore patterns
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'src/__tests__/**',
    ],
  },
];
