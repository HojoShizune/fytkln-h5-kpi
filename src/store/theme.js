import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),
  actions: {
    toggleDarkMode() {
      document.documentElement.classList.toggle('dark', this.isDark)
    }
  }
})


