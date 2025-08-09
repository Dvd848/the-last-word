import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'], // or 'cjs'
  target: 'node20',
  sourcemap: true,
  clean: true,
  dts: true,
  tsconfig: './tsconfig.json',
  skipNodeModulesBundle: true,
  esbuildOptions(options) {
    options.alias = {
      '@shared': '../shared/src',
    };
  },
});
