import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  cache: true,
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: !isProduction,
      exports: 'named'
    }
  ],
  plugins: [
    nodeResolve({
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      sourceMap: !isProduction,
      outputToFilesystem: true
    }),
    // Minify for production builds
    ...(isProduction ? [
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          passes: 2,
          unsafe: false,
          unsafe_comps: false,
          unsafe_math: false,
          unsafe_methods: false,
          unsafe_proto: false,
          unsafe_regexp: false,
          unsafe_undefined: false
        },
        mangle: {
          toplevel: true,
          properties: false
        },
        format: {
          comments: false,
          preserve_annotations: false
        }
      })
    ] : [])
  ],
  external: [
    // Mark dependencies as external to avoid bundling them
    // Add any peer dependencies or external libraries here
  ]
};
