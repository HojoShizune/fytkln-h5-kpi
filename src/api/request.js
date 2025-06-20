// src/api/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/',
  timeout: 10000
})

// ✅ 请求拦截器：自动附加 token
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `${token}`
      console.log('📦 请求头信息:', config.headers)
    }

    // 设置默认请求头格式（后端是 application/json 时建议加上）
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// ✅ 响应拦截器：统一处理后端返回
service.interceptors.response.use(
  response => {
    const res = response.data
    console.log('🌍 接收到后端响应:', res)

    // 🔎 判断请求是否成功（你可以根据后端实际返回字段调整）
    if (res.code !== 0 && res.success !== true) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  error => {
    // ✅ 错误统一弹窗反馈
    console.error('❌ 网络请求失败:', error)
    ElMessage.error(error.response?.data?.message || '网络请求异常')
    return Promise.reject(error)
  }
)

export default service