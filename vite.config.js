import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,// ✅ 允许访问本机 IP
    port: 5173,// ✅ 使用默认端口 5173
    proxy: {
      '/api': {
        target: 'http://192.168.1.200:8080', // ✅ 代理到后端服务器
        changeOrigin: true, // ✅ 允许跨域
        rewrite: (path) => path.replace(/^\/api/, '') // ✅ 自动去掉 /api 前缀
      }
    }
  }
})