import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'test/**/*.test.ts',
  nodeResolve: true,
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2020',
      tsconfig: './tsconfig.json',
    }),
  ],
  coverage: true,
  coverageConfig: {
    threshold: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};
