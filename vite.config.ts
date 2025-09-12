import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import { extname, relative, resolve } from 'path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), libInjectCss(), dts({ include: ['lib'], tsconfigPath: resolve(__dirname, "tsconfig.lib.json"), })],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    },
    copyPublicDir: false,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      input: Object.fromEntries(
        glob.sync('lib/**/*.{ts,tsx}', {
          ignore: ["lib/**/*.d.ts"],
        }).map(file => [
          // 入口点的名称
          // lib/nested/foo.ts 变成 nested/foo
          relative(
            'lib',
            file.slice(0, file.length - extname(file).length)
          ),
          // 入口文件的绝对路径
          // lib/nested/foo.ts 变成 /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      }
    }
  },

})
