// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: sessionStorage.getItem('token') || '',
    username: sessionStorage.getItem('username') || '',
    roleId: sessionStorage.getItem('roleId') || '',
  }),
  actions: {
    login({ username, token, roleId }) {
      this.token = token
      this.username = username
      this.roleId = roleId
      // 存到 sessionStorage
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('username', username)
      sessionStorage.setItem('roleId', roleId)     
    },
    logout() {
      this.$reset()
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      sessionStorage.removeItem('roleId')
    }
  },
  
})