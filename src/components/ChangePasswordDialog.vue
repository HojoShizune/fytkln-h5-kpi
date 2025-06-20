<template>
  <el-dialog v-model="visible" title="修改密码" width="400px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="原密码">
        <el-input v-model="form.oldPassword" show-password />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="form.newPassword" show-password />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model="form.confirmPassword" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirm">下一步</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { updatePwd } from '../api/user'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const visible = ref(false)
const form = ref({
  userId: null,
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const openDialog = (user) => {
  form.value = {
    userId: user.id,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  visible.value = true
}

const pwdStrengthCheck = (password) => {
  const lengthOK = password.length >= 6
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasDigit = /\d/.test(password)

  return lengthOK && hasUpper && hasLower && hasDigit
}

const onConfirm = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    return ElMessage.error('两次输入的新密码不一致')
  } else if (!pwdStrengthCheck(form.value.newPassword)) {
    return ElMessage.error('新密码必须包含大写字母、小写字母和数字，且长度至少为6位')
  } else if (form.value.oldPassword === form.value.newPassword) {
    return ElMessage.error('新密码不能与原密码相同')
  }

  try {
    await ElMessageBox.confirm(
      `确定将密码从「${form.value.oldPassword}」修改为「${form.value.newPassword}」吗？`,
      '修改确认',
      {
        confirmButtonText: '确认修改',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await updatePwd({
      oldPwd: form.value.oldPassword,
      newPwd: form.value.newPassword,
      rePwd: form.value.confirmPassword
    })

    ElMessage.success('密码修改成功')
    userStore.logout()
    setTimeout(() => {
      router.push('/login')
      location.reload()
    }, 100)
    visible.value = false
  } catch (err) {
    ElMessage.error('密码修改失败')
    console.error('修改失败:', err)
  }
}

defineExpose({ openDialog })
</script>