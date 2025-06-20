<template>
  <div class="login-page">
    <div class="login-card">
      <h2>欢迎登录 🧭 FYTKLN</h2>
      <el-form :model="form" @keyup.enter="onLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="请输入账户" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <!--<el-select v-model="form.roleId" placeholder="请选择角色">
            <el-option label="管理员" :value="1" />
            <el-option label="普通用户" :value="0" />
          </el-select>-->
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/user'
import { useUserStore } from '../store/user'


const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  roleId: '' // 或者默认 'user'
})
const loading = ref(false)

const onLogin = async () => {
  try {
    console.log('🔄 发送登录请求:', JSON.stringify({ username: form.username, password: form.password })) // ✅ 发送数据
    
    const res = await login({ username: form.username, password: form.password }) // ✅ 发送 JSON 请求
    console.log('🌍 服务器响应:', res) // ✅ 打印返回数据

    if (res.code === 0) {  // ✅ 确保后端返回 `code: 0` 表示成功
      console.log('✅ 登录成功，Token:', res.data) // ✅ 解析出的 Token
      
      userStore.login({
        username: form.username,     // 👈 或者从 token 解析出来
        roleId: 0,                   // 👈 临时默认普通用户（看你实际业务）
        token: res.data              // ✅ 这是实际返回的字符串
      })
      //userStore.token = res.data // ✅ 存储 token 到 Pinia
      localStorage.setItem('token', res.data) // ✅ 存储 token 到本地，避免刷新后丢失
      
      ElMessage.success('登录成功！')
      router.push('/home') // ✅ 进入主页
    } else {
      console.warn('⚠️ 登录失败:', res.message) // ✅ 打印后端错误信息
      ElMessage.error(res.message || '账号或密码错误')
    }
  } catch (err) {
    console.error('❌ 登录请求错误:', err) // ✅ 打印捕获的错误信息
    ElMessage.error(`登录失败: ${err.message}`)
  }
}

</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-card {
  background: #fff;
  padding: 40px;
  width: 320px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
}
</style>