import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'umd'],
      name: 'LitGrid',
      fileName: (format) => `lit-grid.${format}.js`
    },
    rollupOptions: {
      external: ['lit'],
      output: {
        globals: {
          lit: 'Lit'
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false
      }
    }
  },
  server: {
    port: 3000,
    open: '/demo/index.html'
  }
});
