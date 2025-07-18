// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '', 
    username: '',
    roleId: '', // ✅ 默认普通用户
  }),
  actions: {
    login({ username, token, roleId }) {
      this.token = token
      this.username = username
      this.roleId = roleId
      
    },
    logout() {
      this.$reset()

      
    }
  },
  
})