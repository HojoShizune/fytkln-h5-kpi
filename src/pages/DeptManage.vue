<template>
  <div>
    <el-button type="primary" @click="openAddDialog">新增部门</el-button>

    <div v-loading="loading">
      <el-table :data="deptList" border style="margin-top: 20px">
        <el-table-column prop="deptName" label="部门名称" />
        <!--<el-table-column label="考核项">
          <template #default="{ row }">
            <TargetListSummary :value="row.targets" :max="3" />
          </template>
        </el-table-column>-->
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="editDept(row)">编辑</el-button>
            <el-button type="text" @click="deleteDeptById(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑部门' : '新增部门'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="form.deptName" />
        </el-form-item>

        <el-form-item label="考核项">
          <TargetSelector v-model="form.targets" :target-list="targetList" />
        </el-form-item>

        <el-form-item v-if="isEdit">
          <el-button
            type="warning"
            plain
            @click="resetForm"
            icon="el-icon-refresh"
          >
            撤销所有修改
          </el-button>
        </el-form-item>
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
import { ElMessage } from 'element-plus'
import { getTargetList } from '../api/target'
import { getDeptList } from '../api/dept'
import { useDeptForm } from '../composables/useDeptForm'

// 🚀 引入组件
import TargetSelector from '../components/TargetSelector.vue'
import TargetListSummary from '../components/TargetListSummary.vue'

/* ✅ 表格加载 + 考核项数据 */
const loading = ref(false)
const deptList = ref([])
const targetList = ref([])

const fetchTargets = async () => {
  const res = await getTargetList({ searchStr: '', pageNum: 1, pageSize: 9999 })
  const raw = res?.data?.items || []
  const filtered = raw.map(item => ({
    id: String(item.id),
    name: item.target,
    score: item.score,
    floating: item.floating,
    deptName: item.deptName,
    description: item.description,
    scoringMethod: item.scoringMethod,
    year: item.year
  }))
  targetList.value = filtered
}

const fetchDepts = async () => {
  loading.value = true
  try {
    //const res = await getDeptList({ searchStr: '', pageNum: 1, pageSize: 9999 })//
    const res = await getDeptList()
    deptList.value = res.data || []
  } catch (err) {
    console.error('❌ 获取部门失败:', err)
    ElMessage.error('加载部门数据失败')
  } finally {
    loading.value = false
  }
}

const refreshAll = async () => {
  await fetchTargets()
  await fetchDepts()
}


/* ✅ 表单逻辑来自组合函数 */
const {
  form,
  isEdit,
  dialogVisible,
  openAddDialog,
  editDept,
  onSubmit,
  resetForm,
  deleteDeptById
} = useDeptForm({ onRefresh: refreshAll })

onMounted(async () => {
  await fetchTargets()
  await fetchDepts()
})
</script>