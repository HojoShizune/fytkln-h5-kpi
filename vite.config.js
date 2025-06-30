import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.1.200:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),//正式环境去掉
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // ✅ 清除 content-encoding，防止 Vite dev server 对 gzip 流误操作
            delete proxyRes.headers['content-encoding']
    
            // ✅ 同时可删除 transfer-encoding 以防 chunked 编码被误解
            delete proxyRes.headers['transfer-encoding']
          })
        }
      }
    }
  }
})