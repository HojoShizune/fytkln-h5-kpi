// src/api/survey.js
import request from './request'

// 获取问卷列表
export const getSurveyList = () => {
  return request.get('/survey/list')
}

// 创建问卷
export const addSurvey = (data) => {
  return request.post('/survey/add', data)
}

// 更新问卷
export const updateSurvey = (data) => {
  return request.post('/survey/update', data)
}

// 删除问卷
export const deleteSurvey = (id) => {
  return request.post('/survey/delete', null, {
    params: { id }
  })
}

// 提交问卷答题

// 获取问卷题目列表
export const getQuestionList = (surveyId) => {
  return request.get('/question/list', {
    params: { surveyId }
  })
}

// 添加题目
export const addQuestion = (data) => {
  return request.post('/question/add', data)
}

// 更新题目
export const updateQuestion = (data) => {
  return request.post('/question/update', data)
}

//删除题目
export const deleteQuestion = (id) => {
  return request.post('/question/delete', null, { params: { id } })
}

//问卷提交
export const submitAnswer = (data) => {
  return request.post('/answer/add', data)
}

// 获取当前用户可填写的问卷 ID 列表
export const getSurveyToFillIds = () => {
  return request.get('/survey/surveyToFill')
}