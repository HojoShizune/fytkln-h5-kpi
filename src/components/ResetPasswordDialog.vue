<template>
  <el-dialog v-model="visible" title="重置密码确认" width="400px" :close-on-click-modal="false">
    <span>确认要将用户「{{ user?.name }}」的密码重置为默认密码吗？</span>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleReset">确认重置</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { resetPassword } from '../api/user'

const visible = ref(false)
const loading = ref(false)
const user = ref(null)
const emit = defineEmits(['deleted'])

const openDialog = (targetUser) => {
  user.value = targetUser
  visible.value = true
}

const handleReset = async () => {
  loading.value = true
  try {
    await resetPassword(user.value.id)
    emit('deleted') // ✅ 加上这一句
    visible.value = false
    ElMessageBox.alert(
      `已重置为默认密码：<strong>Unicom@123</strong>`,
      '重置成功',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '知道了',
        type: 'success'
      }
    )
  } catch (err) {
    ElMessage.error('重置失败，请稍后重试')
    console.error('❌ 重置失败：', err)
  } finally {
    loading.value = false
  }
}


defineExpose({ openDialog })
</script>