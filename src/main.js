import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElIcons from '@element-plus/icons-vue'


import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

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