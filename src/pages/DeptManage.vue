<template>
  <div>
    <el-button type="primary" @click="openAddDialog">新增部门</el-button>

    <el-table :data="deptList" border style="margin-top: 20px">
      <el-table-column prop="deptName" label="部门名称" />
      <!--<el-table-column prop="leader" label="负责人" />
      <el-table-column prop="desc" label="描述" />-->
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="text" @click="editDept(row)">编辑</el-button>
          <el-button type="text" @click="deleteDept(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ✅ 弹窗：新增/编辑 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑部门' : '新增部门'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="form.deptName" />
        </el-form-item>
        <!--<el-form-item label="负责人">
          <el-input v-model="form.leader" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" type="textarea" />
        </el-form-item>-->
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// import your API module here
// import { getDeptList, addDept, updateDept, deleteDept } from '../api/dept'

const deptList = ref([])

const form = ref({
  deptName: '',
  leader: '',
  desc: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentDeptId = ref(null)

const fetchDepts = async () => {
  // const res = await getDeptList()
  // deptList.value = res.data || []
  deptList.value = [
    { id: 1, deptName: '技术部', leader: 'Alice', desc: '负责技术研发' },
    { id: 2, deptName: '市场部', leader: 'Bob', desc: '市场与推广' }
  ]
}

const openAddDialog = () => {
  isEdit.value = false
  form.value = { deptName: '', leader: '', desc: '' }
  dialogVisible.value = true
}

const editDept = (dept) => {
  isEdit.value = true
  currentDeptId.value = dept.id
  form.value = { ...dept }
  dialogVisible.value = true
}

const deleteDept = (dept) => {
  ElMessageBox.confirm(`确认删除部门【${dept.deptName}】吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    // await deleteDept(dept.id)
    ElMessage.success('已删除（模拟）')
    fetchDepts()
  })
}

const onSubmit = async () => {
  if (isEdit.value) {
    // await updateDept({ ...form.value, id: currentDeptId.value })
    ElMessage.success('更新成功（模拟）')
  } else {
    // await addDept(form.value)
    ElMessage.success('新增成功（模拟）')
  }
  dialogVisible.value = false
  fetchDepts()
}

onMounted(() => {
  fetchDepts()
})
</script>