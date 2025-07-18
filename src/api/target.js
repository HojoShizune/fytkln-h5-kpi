// src/api/target.js 
import request from './request'

// 获取部门列表
export const getTargetList = (params = {}) => {
  return request.get('/target/list', { params })
}


// 创建问卷
export const addTarget = (data) => {
  return request.post('/target/add', data)
}

// 更新问卷
export const updateTarget = (data) => {
  return request.post('/target/update', data)
}

// 删除问卷
export const deleteTarget = (id) => {
  return request.post('/target/delete', null, {
    params: { id }
  })
}

export const getTargetsByDept = (params) => {
  return request.get('/target/findByDept', { params })
}

// ✅ 批量导入考核项（Excel 文件）
export const importTargetList = (formData) => {
  return request.post('/target/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    skipResponseInterceptor: true
  })
}

export const exportTargetList = () => {
  return request.get('/target/export', {
    responseType: 'blob',
    skipResponseInterceptor: true
  })
}