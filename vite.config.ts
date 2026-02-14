import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'CalendarVuePlugin',
      formats: ['cjs'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      external: ['obsidian', 'electron', '@codemirror/autocomplete', '@codemirror/closebrackets', '@codemirror/collab', '@codemirror/commands', '@codemirror/comment', '@codemirror/fold', '@codemirror/gutter', '@codemirror/highlight', '@codemirror/history', '@codemirror/language', '@codemirror/lint', '@codemirror/matchbrackets', '@codemirror/panel', '@codemirror/rangeset', '@codemirror/rectangular-selection', '@codemirror/search', '@codemirror/state', '@codemirror/stream-parser', '@codemirror/text', '@codemirror/tooltip', '@codemirror/view', '@lezer/common', '@lezer/highlight', '@lezer/lr'],
      output: {
        entryFileNames: 'main.js',
        globals: {
          obsidian: 'obsidian'
        },
        assetFileNames: 'styles.[ext]'
      }
    },
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
