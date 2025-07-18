import axios from 'axios'//若上线后可写死正式地址，就注释掉
import { ElMessage } from 'element-plus'
import router from '../router/index'


const baseApi = `${window.location.origin}${import.meta.env.VITE_APP_BASE_API}`

const service = axios.create({
  baseURL: baseApi,
  //baseURL: import.meta.env.VITE_APP_BASE_API || '/', // ✅ 开发环境、生产环境都可走代理，记得改.env.production
  //baseURL: 'https://your-internal-server.com/api', // ✅ 或上线后可写死正式地址，然后删掉config
  timeout: 10000
})

// ✅ 请求拦截器：附加 token
service.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `${token}`
    }

    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'

    return config
  },
  error => Promise.reject(error)
)

// ✅ 响应拦截器（可被跳过）
service.interceptors.response.use(
  response => {
    if (response.config.skipResponseInterceptor) {
      // 🔍 跳过拦截器，直接返回原始响应对象
      return response
    }

    const res = response.data
    if (res.code !== 0) {
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || 'Error'))
      }
    return res
  },
  error => {
    const status = error.response?.status
    const message = error.response?.data?.message || '网络请求异常'

    console.log('a',router)

    if (status === 401) {
      ElMessage.error('用户信息过期，请重新登录')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      sessionStorage.removeItem('roleId')
      setTimeout(() => {
        location.reload()// 回退页面
      }, 3000)
      return Promise.reject(new Error('请重新登录'))
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }

)

export default service