<template>
  <div class="login-page">
    <div class="login-card">
      <h2>欢迎登录 KPI 考核管理系统</h2>
      <el-form :model="form" @keyup.enter="onLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="请输入账户" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" show-password placeholder="请输入密码" />
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
import { login, getRoleByToken } from '../api/user'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

const onLogin = async () => {
  loading.value = true

  try {
    // ✅ 登录接口（返回 token）
    const res = await login({
      username: form.username,
      password: form.password
    })

    if (res.code !== 0 || !res.data) {
      ElMessage.error(res.message || '账号或密码错误')
      return
    }

    const token = res.data
    localStorage.setItem('token', token)
    userStore.token = token // ✅ Pinia 中存储 token

    // ✅ 获取角色信息（通过 token）
    const roleRes = await getRoleByToken()
    const { roleId, roleName } = roleRes.data || {}

    if (typeof roleId === 'undefined') {
      ElMessage.error('未能识别用户角色，请稍后再试')
      return
    }

    // ✅ 完整存入 Pinia 状态
    userStore.login({
      username: roleName || form.username,
      token,
      roleId
    })

    ElMessage.success(`欢迎 ${roleName || form.username} 登录成功 🎉`)
    router.push('/home')
  } catch (err) {
    console.error('❌ 登录失败:', err)
    ElMessage.error(err.message || '登录异常，请稍后再试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #f0f2f5, #dde3ea);
}

.login-card {
  background: #fff;
  padding: 40px;
  width: 320px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); /* 更强阴影层次 */
  border: 1px solid #dcdfe6; /* 加细边框提升卡片可见性 */
  text-align: center;
}
</style>
