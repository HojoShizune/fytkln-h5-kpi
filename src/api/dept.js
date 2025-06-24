// src/api/Dept.js 
import request from './request'

// 获取部门列表
export const getDeptList = () => {
  return request.get('/dept/list')
}

// 创建部门
export const addDept = (data) => {
  return request.post('/dept/add', data)
}

// 更新部门
export const updateDept = (data) => {
  return request.post('/dept/update', data)
}

// 删除部门
export const deleteDept = (deptId) => {
  return request.post('/dept/delete', null, {
    params: { deptId }
  })
  
}

