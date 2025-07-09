// src/api/score.js
import request from './request'

// ✅ 获取当前部门得分汇总列表（用于 ScoreBoard.vue）
export function fetchScoreSummary() {
  return request({
    url: '/assessment/collectByDept',
    method: 'get'
  })
}

// ✅ 下载打分模板（Excel 文件）
export const downloadScoreTemplateFile = () => {
  return request.get('/assessment/example', {
    responseType: 'blob',
    skipResponseInterceptor: true
  })
}

// ✅ 上传打分模板文件（用于 ScoreBoard.vue）
export const uploadScoreTemplate = (formData) => {
  return request.post('/assessment/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    skipResponseInterceptor: true
  })
}

// ✅ 获取当前部门指标列表（用于 ScoreSummary.vue）
export const fetchAssessmentList = (deptId) => {
  return request.get('/assessment/list', {
    params: { deptId }
  })
}

// ✅ 更新指标核查状态（用于 ScoreSummary.vue）
export function updateAssessmentCheck(payload) {
  return request.post('/assessment/check', payload)
}

// ✅ 更新指标初始得分（用于 ScoreSummary.vue）
export function updateAssessmentScore(payload) {
  return request.post('/assessment/update', payload)
}

// ✅ 导出所有部门明细
export function downloadAllDeptDetailFile() {
  return request.get('/assessment/exportDetail', {
    responseType: 'blob',
    skipResponseInterceptor: true
  })
}

// ✅ 导出部门汇总表
export function downloadScoreSummaryFile() {
  return request.get('/assessment/exportSummary', {
    responseType: 'blob',
    skipResponseInterceptor: true
  })
}

// ✅ 纪检考核项计算
export function calculateAssessment() {
  return request.post('/assessment/calculate')
}

// ✅ 数据提交与重置
export function renewAssessment() {
  return request.post('/assessment/submit')
}

/** ✅ 获取历史汇总（ScoreHistoryBoard.vue 使用） */
export function fetchHistorySummary(date) {
  return request.get('/assessment/historySummary', {
    params: { date }
  })
}

/** ✅ 获取部门历史明细（ScoreHistorySummary.vue 使用） */
export function fetchHistory(deptId, date) {
  return request.get('/assessment/history', {
    params: { deptId, date }
  })
}

// ✅ 下载后端整合生成的 PDF 文件（用于 RemotePdfViewer.vue）
export function downloadCompletePdfFile() {
  return request.get('/assessment/exportAll', {
    responseType: 'blob',
    skipResponseInterceptor: true
  })
}
