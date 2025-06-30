// src/api/record.js
import request from './request'


// 获取问卷数据（根据账期决定请求哪个接口）
export const fetchSurveyRecords = async (period) => {
  try {
    let response
    if (period === getCurrentMonth()) {
      response = await request.get('/record/allgradeinfo')
    } else {
      response = await request.get('/record/list', { params: { date: period } })
    }

    console.log('接口返回完整数据:', response.data) // 打印完整数据！！！

    if (!response.data) {
      console.warn('⚠️ response.data 为空！！！')
      return []
    }

    if (!Array.isArray(response.data)) {
      console.warn('⚠️ response.data 不是数组，返回空数组！！！')
      return []
    }

    console.log('最终解析后的问卷数据:', response.data) // 确保数据是数组！！！

    return response.data
  } catch (error) {
    console.error('❌ 获取问卷数据失败:', error)
    return [] // 失败时返回空数组，避免 undefined
  }
}

// 获取当前年月 (YYYY-MM)
export const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear() // 获取当前年份
  const month = String(now.getMonth() + 1).padStart(2, '0') // 获取当前月份，补零
  const currentMonth = `${year}-${month}`
  console.log('当前月份:', currentMonth) // 确保返回的是 "2025-06" 这样的格式
  return currentMonth
}

// 提交核算请求（无参数）
export const submitSurveyCheck = async () => {
  try {
    const res = await request.post('/record/submit') // ✅ 无需参数
    return res
  } catch (error) {
    console.error('❌ 提交核算失败:', error)
    throw error
  }
}

// 获取当前用户已填写的问卷记录
export const getUserFilledSurveys = async () => {
  try {
    const res = await request.get('/record/singlegradeinfo')
    return res.data || []
  } catch (error) {
    console.error('❌ 获取用户填写记录失败:', error)
    return []
  }
}

// GET record/export，导出问卷Excel（返回 base64）
export const exportSurveyExcel = (params) => {
  return request.get('/record/export', {
    responseType: 'blob',
    skipResponseInterceptor: true,
    params
  })
}
// 注意：这里的 `skipResponseInterceptor` 是为了跳过响应拦截器，直接返回原始 Blob 对象