// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    username: '',
    roleId: 0 // ✅ 默认普通用户
  }),
  actions: {
    login({ username, token, roleId }) {
      this.token = token
      this.username = username
      this.roleId = roleId
      
    },
    logout() {
      this.$reset()

      localStorage.removeItem('token') 
      localStorage.removeItem('user') 
      localStorage.removeItem('roleId') 
    }
  },
  persist: {
    paths: ['token', 'username', 'roleId'] // 持久化字段
  }
})