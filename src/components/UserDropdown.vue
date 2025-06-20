<template>
  <el-dropdown @command="handleCommand" trigger="click">
    <span class="user-dropdown-trigger">
      <el-avatar :size="32" :src="avatarUrl">{{ username[0] || 'U' }}</el-avatar>
      <span class="username">{{ username || '未登录' }}</span>
      <el-icon><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="changePwd">修改密码</el-dropdown-item>
        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <ChangePasswordDialog ref="changePwdDialog" />
</template>

<script setup>
import { ref } from 'vue' 
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { computed, nextTick } from 'vue'
import ChangePasswordDialog from './ChangePasswordDialog.vue'


const router = useRouter()
const userStore = useUserStore()
const changePwdDialog = ref()
const username = computed(() => userStore.username || '未知用户')
const avatarUrl = computed(() => userStore.avatar || '')

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    ElMessage.success('退出成功')
    setTimeout(() => {
      router.push('/login')
      location.reload()
    }, 100)
  } else if (command === 'changePwd') {
    changePwdDialog.value.openDialog(userStore) // 👈 传当前用户信息
  }
}


</script>

<style scoped>
.user-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
}
.username {
  font-weight: 500;
}
</style>