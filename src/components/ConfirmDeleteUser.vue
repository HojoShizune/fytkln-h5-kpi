<template>
  <el-dialog v-model="visible" title="删除确认" width="360px" :close-on-click-modal="false">
    <span>确定要删除用户「{{ user?.name || user?.username }}」吗？</span>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleDelete">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { deleteUser as deleteUserApi } from '../api/user'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const user = ref(null)

const emit = defineEmits(['deleted'])

function openDialog(targetUser) {
  user.value = targetUser
  visible.value = true
}

async function handleDelete() {
  try {
    console.log('🧪 正准备删除用户：', user.value)
    await deleteUserApi(user.value.id)
    ElMessage.success(`已删除用户：${user.value.name || user.value.username}`)
    emit('deleted')
  } catch (e) {
    ElMessage.error('删除失败')
  } finally {
    visible.value = false
  }
}

defineExpose({ openDialog })
</script>