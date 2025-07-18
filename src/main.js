import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

import './styles/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElIcons from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { useUserStore } from './store/user'
//import './assets/theme-vars.css'// //Element Plus 的组件暗黑模式适配(有大问题，弃用)//

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

console.log(router.currentRoute.value)

app.mount('#app')


Object.entries(ElIcons).forEach(([key, component]) => {
  app.component(key, component)
})
console.log(Object.keys(ElIcons))