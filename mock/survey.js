// mock/survey.js
export const mockSurveyList = [
  {
    id: '1',
    title: '用户满意度调查',
    description: '请帮助我们改进服务',
    createTime: '2024-06-16'
  },
  {
    id: '2',
    title: '网站使用体验调研',
    description: '收集关于网站使用体验的反馈',
    createTime: '2024-06-15'
  }
]

export function fetchSurveyList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockSurveyList
      })
    }, 300) // 模拟网络延迟
  })
}

export function fetchSurveyDetail(id) {
  const survey = mockSurveyList.find(s => s.id === id)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (survey) {
        resolve({
          code: 200,
          data: {
            ...survey,
            questions: [
              { id: 'q1', type: 'radio', title: '你满意我们的服务吗？', options: ['满意', '一般', '不满意'] },
              { id: 'q2', type: 'text', title: '还有哪些建议？' }
            ]
          }
        })
      } else {
        reject({ code: 404, message: '未找到该问卷' })
      }
    }, 300)
  })
}