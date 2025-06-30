<template>
  <el-dialog v-model="visible" title="编辑用户信息" @close="resetForm">
    <el-form :model="form">
      <el-form-item label="用户姓名">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.tel" />
      </el-form-item>

      <el-form-item label="角色">
        <el-select v-model="form.roleId" placeholder="请选择角色">
          <el-option
            v-for="role in roles"
            :key="role.roleId"         
            :label="role.roleName"     
            :value="role.roleId"       
          />
        </el-select>
      </el-form-item>

      <el-form-item label="部门">
        <el-select v-model="form.deptId" placeholder="请选择部门">
          <el-option
            v-for="dept in departments"
            :key="dept.deptId"
            :label="dept.deptName"
            :value="dept.deptId"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveUser">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { updateUserInfo } from '../api/user'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeptList } from '../api/dept' 

defineProps({ roles: Array })

const departments = ref([])

const emit = defineEmits(['updated']) // 👈 声明事件

const visible = ref(false)
const form = ref({
  name: '',
  phone: '',
  roleId: 0,
  deptId: null
})

const openDialog = (user) => {
  form.value.roleId = Number(user.roleId) // 👈 确保是数字
  form.value = {
    ...user,
    roleId: user.roleId ?? roles.find(r => r.name === user.roleName)?.id
  }
  visible.value = true
}



const resetForm = () => {
  form.value = {
    id: null,
    name: '',
    tel: '',
    roleId: 0,
    deptId: null
  }
}

const saveUser = async () => {
  try {
    const { id, name, tel, roleId, deptId } = form.value

    const payload = {
      id,
      name: name,      // ✅ name 来自 username
      tel: tel,          // ✅ tel 来自 phone
      roleId,
      deptId
    }
    
    console.log('📦 发送给后端的参数：', payload)

    await updateUserInfo(payload)

    ElMessage.success('用户信息已更新')
    emit('updated') // 👈 通知父组件
    visible.value = false
  } catch (error) {
    ElMessage.error('更新失败，请稍后重试')
    console.error('更新异常：', error)
  }
}

onMounted(async () => {
  const res = await getDeptList()
  departments.value = res.data || []
})

defineExpose({ openDialog })
</script>