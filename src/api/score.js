// src/api/score.js
import request from './request'

// ✅ 获取部门打分汇总列表（用于 ScoreBoard.vue）
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

// ✅ 上传模板文件（用于 ScoreBoard.vue）
export const uploadScoreTemplate = (formData) => {
  return request.post('/assessment/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    skipResponseInterceptor: true
  })
}

// ✅ 获取指定部门的指标列表（用于 ScoreSummary.vue）
export const fetchAssessmentList = (deptId) => {
  return request.get('/assessment/list', {
    params: { deptId }
  })
}

export function updateAssessmentCheck(payload) {
  return request.post('/assessment/check', payload)
}

export function updateAssessmentScore(payload) {
  return request.post('/assessment/update', payload)
}

// ✅ 下载所有部门考核明细
export function downloadAllDeptDetailFile() {
  return request.get('/assessment/exportDetail', {
    responseType: 'blob',
    skipResponseInterceptor: true
  })
}

// ✅ 下载部门得分汇总 Excel
export function downloadScoreSummaryFile() {
  return request.get('/assessment/exportSummary', {
    responseType: 'blob',
    skipResponseInterceptor: true
  })
}
