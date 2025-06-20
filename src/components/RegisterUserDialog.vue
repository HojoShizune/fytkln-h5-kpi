<template>
  <el-dialog v-model="visible" title="注册用户" width="500px" @close="resetForm">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item prop="username" label="用户姓名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item prop="name" label="账号">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item prop="tel" label="手机号">
        <el-input v-model="form.tel" />
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-form-item prop="roleId" label="角色">
        <el-select v-model="form.roleId" placeholder="选择角色">
          <el-option
            v-for="role in roles"
            :key="role.roleId"
            :label="role.roleName"
            :value="role.roleId"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="deptId" label="部门">
        <el-select v-model="form.deptId" placeholder="选择部门">
          <el-option label="测试部门1" :value="1" />
          <el-option label="测试部门2" :value="2" />
          <el-option label="测试部门3" :value="3" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onRegister">注册</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import { registerUser, getRoleList } from '../api/user'

const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const roles = ref([])

const form = ref({
  username: '',
  name: '',
  tel: '',
  password: '',
  roleId: null,
  deptId: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  tel: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式不正确',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
      message: '密码需包含大小写字母和数字，且不少于6位',
      trigger: 'blur'
    }
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }]
}

const openDialog = () => {
  visible.value = true
}

const resetForm = () => {
  form.value = {
    username: '',
    name: '',
    tel: '',
    password: '',
    roleId: null,
    deptId: ''
  }
}

const emit = defineEmits(['registered'])

const onRegister = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await registerUser(form.value)
      if (res.code === 0) {
        ElMessage.success('注册成功！')
        visible.value = false
        emit('registered') // 👈 通知父组件刷新列表
      } else {
        ElMessage.error(res.message || '注册失败！')
      }
    } catch (err) {
      ElMessage.error('网络错误，请稍后重试')
      console.error('注册失败:', err)
    } finally {
      loading.value = false
    }
  })
}

onMounted(async () => {
  const res = await getRoleList()
  roles.value = res.data || []
})

defineExpose({ openDialog })
</script>