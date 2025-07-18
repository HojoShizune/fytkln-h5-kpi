<template>
  <el-button type="primary" style="margin-bottom: 16px;" @click="openRegisterDialog">
    新增用户
  </el-button>

  <el-table :data="users" border style="width: 100%">
    <el-table-column prop="name" label="用户姓名" />
    <el-table-column prop="username" label="账号" width="150" />
    <el-table-column prop="tel" label="手机号" />
    <el-table-column prop="deptName" label="部门" />
    <el-table-column label="角色">
      <template #default="{ row }">
        {{ row.roleName || '未知角色' }}
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="{ row }">
        <!-- TODO: v3.x 替换为 type="link" -->
        <el-button type="text" @click="editUser(row)">编辑</el-button>
        <el-button type="text" @click="resetPassword(row)">重置密码</el-button>
        <el-button type="text" @click="deleteUser(row)">删除</el-button>
        
      </template>
    </el-table-column>
  </el-table>
  
  <EditUserDialog
    ref="editDialog"
    :roles="roles"
    @updated="fetchUsers"
  />
  <ResetPasswordDialog ref="resetPwdDialog" @updated="fetchUsers" />
  <ConfirmDeleteUser ref="confirmDeleteDialog" @deleted="fetchUsers" />
  <RegisterUserDialog ref="registerDialog" @registered="fetchUsers" />

</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import EditUserDialog from '../components/EditUserDialog.vue'
import { getUserList } from '../api/user'
import { onMounted } from 'vue'
import ConfirmDeleteUser from '../components/ConfirmDeleteUser.vue'
import ResetPasswordDialog from '../components/ResetPasswordDialog.vue'
import { getRoleList } from '../api/user'
import { useUserStore } from '../store/user'
import RegisterUserDialog from '../components/RegisterUserDialog.vue'



const resetPwdDialog = ref()
const confirmDeleteDialog = ref()
const users = ref([])
const changePwdDialog = ref()
const editDialog = ref()
const roleMap = ref({})
const roles = ref([])
const userStore = useUserStore()
const registerDialog = ref()


const fallbackUsers = ref([
  { account: 'alice01', username: 'Alice', phone: '123456789', deptId:'1' , deptName:'测试部门1', roleId: 0 , roleName: "普通用户", },
  { account: 'bob99', username: 'Bob', phone: '987654321', deptId:'2' , deptName:'测试部门2', roleId: 1 , roleName: "管理员" },
  { account: 'charlie', username: 'Charlie', phone: '555555555', deptId:'3' , deptName:'测试部门3', roleId: 0 , roleName: "普通用户" },
  { account: 'dave', username: 'Dave', phone: '666666666', deptId:'4' , deptName:'测试部门4', roleId: 1 , roleName: "管理员" }
])

const fetchUsers = async () => {
  try {
    const res = await getUserList()
    users.value = res.data?.items || []
  } catch (e) {
    console.warn('⚠️ 接口获取失败，使用本地模拟数据')
    users.value = fallbackUsers
   
  }
}

const fetchRoles = async () => {
  const res = await getRoleList()
  roles.value = res.data || []
}

onMounted(() => {
  fetchUsers()
  fetchRoles() // 👈 加上它
})

const editUser = (user) => {
  const isOthermana = user.username !== userStore.username
  const isAdmin = user.roleId 

  if (isOthermana & isAdmin === 1) {
    ElMessage.warning('管理员不能重置其他管理员的信息')
    return
  }

  editDialog.value.openDialog(user) // ✅ 触发弹窗
}

const deleteUser = (user) => {
  const isOthermana = user.username !== userStore.username
  const isSelf = user.username === userStore.username
  const isAdmin = user.roleId 

  if (isOthermana & isAdmin === 1) {
    ElMessage.warning('管理员不能删除其他管理员的账号')
    return
  }
  if (isSelf & isAdmin === 1) {
    ElMessage.warning('管理员不能删除自己的账号')
    return
  }
  confirmDeleteDialog.value.openDialog(user) // 传入 user 包含 id
}

// 重置密码
const resetPassword = (user) => {
  const isSelf = user.username === userStore.username
  const isAdmin = user.roleId 

  console.log('user.username =', user.username)
  console.log('userStore.username =', userStore.username)

  if (isSelf) {
    ElMessage.warning('管理员不能重置自己的密码')
    return
  }

  if (isAdmin === 1) {
    ElMessage.warning('管理员不能重置其他管理员密码')
    return
  }

  resetPwdDialog.value.openDialog(user)
}


const openRegisterDialog = () => {
  registerDialog.value.openDialog()
}

</script>