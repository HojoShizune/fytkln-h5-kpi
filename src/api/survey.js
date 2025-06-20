// src/api/survey.js
import request from './request'

// 获取问卷列表
export const getSurveyList = () => {
  return request.get('/survey/list')
}


// 获取问卷详情


// 创建问卷
export const addSurvey = (data) => {
  return request.post('/survey/add', data)
}

// 更新问卷


// 删除问卷
export const deleteSurvey = (id) => {
  return request.post('/survey/delete', null, {
    params: { id }
  })
}


// 提交问卷答题
