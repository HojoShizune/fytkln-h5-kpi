<template>
  <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="onRegister">
    <el-form-item prop="username">
      <el-input v-model="form.username" placeholder="用户名" />
    </el-form-item>
    <el-form-item prop="name">
      <el-input v-model="form.name" placeholder="账号" />
    </el-form-item>
    <el-form-item prop="tel">
      <el-input v-model="form.tel" placeholder="手机号" />
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="form.password" type="password" placeholder="密码" show-password />
    </el-form-item>
    <el-form-item prop="roleId">
      <el-select v-model="form.roleId" placeholder="选择角色">
        <el-option
          v-for="role in roles"
          :key="role.roleId"
          :label="role.roleName"
          :value="role.roleId"
        />
      </el-select>
    </el-form-item>
    <el-form-item prop="deptId">
      <el-select v-model="form.deptId" placeholder="选择部门">
        <el-option label="测试部门1" :value="1" />
        <el-option label="测试部门2" :value="2" />
        <el-option label="测试部门3" :value="3" />
        <!-- ✅ 实际部门列表可换为接口获取 -->
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="onRegister">注册</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { registerUser, getRoleList } from '../api/user'

const formRef = ref()
const loading = ref(false)
const roles = ref([])

const form = ref({
  username: '',
  name: '',
  tel: '',
  password: '',
  roleId: null,
  deptId: ''
})

// ✅ 校验规则：密码包含大小写和数字，且 ≥6 位
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  tel: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
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

const onRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await registerUser(form.value)
      if (res.code === 0) {
        ElMessage.success('注册成功！')
      } else {
        ElMessage.error(res.data.message || '注册失败，请检查输入！')
      }
    } catch (err) {
      ElMessage.error('请求失败，请检查网络！')
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
</script>