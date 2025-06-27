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