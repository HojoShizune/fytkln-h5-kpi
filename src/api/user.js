import request from './request.js'

// 获取用户信息
export function getUserInfo() {
  return request.get('/user/info')
}

// 用户登录
export function login(data) {
  return request.post('/user/login', JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' } // 确保 JSON 传输格式 //multipart/form-data
  })
}

// 用户注册
export function registerUser(data) {
  return request.post('/user/register', JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// 获取用户列表（无参数）
export function getUserList() {
  return request.get('/user/list')
}

// 更新用户信息接口
export function updateUserInfo(data) {
  return request.post('/user/updateInfo', data)
}

// 修改用户密码
export function updatePwd(data) {
  return request.post('/user/updatePwd', data)
}

// 重置用户密码
export function resetPassword(id) {
  return request.post('/user/reset', null, {
    params: { id } // ✅ 和 delete 接口一样，URL 传参
  })
}

// 删除用户（传入对象，通常包含账号或 ID）
export function deleteUser(id) {
  return request.post('/user/delete', null, {
    params: { id }
  })
}

// 获取用户角色列表
export function getRoleList() {
  return request.get('/user/role')
}