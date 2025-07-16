import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/kpi': {
        target: 'http://192.168.1.199:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/kpi/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['content-encoding']
            delete proxyRes.headers['transfer-encoding']
          })
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // 提高限制，避免警告
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ Vue 核心类库
          vue: ['vue', 'vue-router', 'pinia'],
          // ✅ UI库分离打包
          elementPlus: ['element-plus'],
          // ✅ 工具类库
          utils: ['dayjs', 'file-saver'],
          // ✅ PDF 打印 / 导出类库
          pdfUtils: ['html2pdf.js', 'html2canvas', 'jspdf']
        }
      }
    }
  }
})
