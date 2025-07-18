<template>
  <div>
    <!-- 新增按钮 -->
    <el-button type="primary" @click="openAddDialog">新增考核项</el-button>
    <el-button
        type="primary"
        @click="templateDialogVisible = true"
      >
        导入/下载考核项模板
    </el-button>


    <div style="margin-top: 12px; display: flex; align-items: center; color: #999; font-size: 13px;">
      <el-icon><InfoFilled /></el-icon>
      <el-text>
        排序和筛选仅作用于当前分页数据，不支持跨页或全文搜索。
      </el-text>
    </div>

    <!-- 数据表格 -->
    <el-table :data="targetList" border style="margin-top: 20px" v-loading="loading">
      <!-- 考核项名称列 -->
      <el-table-column
        prop="target"
        label="考核项名称"
        sortable
        :filters="targetFilters"
        :filter-method="filterHandler"
        filter-multiple="false"
      />
      <el-table-column
        prop="year"
        label="考核项年份"
        sortable
        :filters="yearFilters"
        :filter-method="filterHandler"
        filter-multiple="false"
        :formatter="(_, __, val) => val === '0' ? '' : val"
      />
      <!-- 分值列 -->
      <el-table-column
        prop="score"
        label="分值"
        width="120"
        sortable
        :filters="scoreFilters"
        :filter-method="filterHandler"
        filter-multiple="false"
        :formatter="(_, __, val) => isFinite(val) ? Number(val).toFixed(2) : '--'"
      />
      <!-- 浮动上限列 -->
      <el-table-column
        prop="floating"
        label="浮动上限"
        width="140"
        sortable
        :filters="floatingFilters"
        :filter-method="filterHandler"
        filter-multiple="false"
        :formatter="(_, __, val) => isFinite(val) ? Number(val).toFixed(2) : '--'"
      />
      <!-- 打分部门列 -->
      <el-table-column
        prop="deptName"
        label="打分部门"
        sortable
        :filters="deptFilters"
        :filter-method="filterHandler"
        filter-multiple="false"
      />
      <!-- 指标描述列，不参与筛选排序 -->
      <el-table-column label="指标描述">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :content="row.description">
            <span>
              {{
                (row.description || '').length > 20
                  ? row.description.slice(0, 20) + '...'
                  : (row.description || '')
              }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <!-- 评分标准列，不参与筛选排序 -->
      <el-table-column label="评分标准">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :content="row.scoringMethod">
            <span>
              {{
                (row.scoringMethod || '').length > 20
                  ? row.scoringMethod.slice(0, 20) + '...'
                  : (row.scoringMethod || '')
              }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="editTarget(row)">编辑</el-button>
          <el-button type="text" size="small" @click="deleteTargetById(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="margin-top: 20px; text-align: right;"
    ></el-pagination>

    <!-- 新增/编辑 弹窗 -->
    <el-dialog :title="isEdit ? '编辑考核项' : '新增考核项'" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="考核项名称">
          <el-input v-model="form.target" placeholder="请输入考核项名称" />
        </el-form-item>

        <el-form-item label="分值">
          <el-input-number v-model="form.score" :min="0" :step="0.1" :precision="2" />
        </el-form-item>

        <el-form-item label="浮动上限">
          <!-- 允许负数输入，例如 -5 -->
          <el-input-number v-model="form.floating" :min="-9999" :step="0.1" :precision="2" />
        </el-form-item>

        <el-form-item label="指标描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入指标描述" />
        </el-form-item>

        <el-form-item label="评分标准">
          <el-input v-model="form.scoringMethod" type="textarea" placeholder="请输入评分标准" />
        </el-form-item>

        <el-form-item label="打分部门">
          <el-select v-model="form.deptId" placeholder="请选择打分部门">
            <el-option
              v-for="dept in deptList"
              :key="dept.deptId"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- ✅ 模板弹窗 -->
    <el-dialog v-model="templateDialogVisible" title="考核项模板操作" width="420px">
      <div class="button-group">
        <el-button type="primary" @click="triggerFileUpload">上传考核项模板</el-button>
        <input
          ref="uploadInput"
          type="file"
          accept=".xlsx,.xls"
          style="display: none"
          @change="handleFileUpload"
        />
        <el-button type="warning" @click="handleExportTemplate" :loading="loading">
           下载考核项模板
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTargetList, addTarget, updateTarget, deleteTarget, importTargetList, exportTargetList } from '../api/target'
import { getDeptList } from '../api/dept'
import { InfoFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'

const templateDialogVisible = ref(false)
const uploadInput = ref(null)

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 数据和加载状态
const loading = ref(false)
const targetList = ref([])

// 部门列表（下拉菜单数据）
const deptList = ref([])

// 表单数据和弹窗状态
const form = ref({
  id: null,
  target: '',
  score: 0,
  floating: 0,
  description: '',
  scoringMethod: '',
  deptId: null
})
const originalForm = ref(null)
const isEdit = ref(false)
const dialogVisible = ref(false)

//上传excel
const dialogImportVisible = ref(false)
const selectedFile = ref(null)
const importing = ref(false)

// 获取考核项列表，传入分页参数和 searchStr
const fetchTargets = async () => {
  loading.value = true
  try {
    const params = {
      searchStr: '',
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getTargetList(params)
    targetList.value = res.data.items || []
    total.value = res.data.total || 0
  } catch (err) {
    console.error('❌ 获取考核项数据失败:', err)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page
  fetchTargets()
}
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchTargets()
}

// 获取部门列表，用于下拉选择
const fetchDepts = async () => {
  try {
    const res = await getDeptList()
    // 假设返回部门数组在 res.data 中
    deptList.value = res.data
  } catch (err) {
    console.error('❌ 获取部门数据失败:', err)
  }
}

// 新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  form.value = {
    id: null,
    target: '',
    score: 0,
    floating: 0,
    description: '',
    scoringMethod: '',
    deptId: null
  }
  dialogVisible.value = true
}

// 编辑弹窗，回填数据
const editTarget = (row) => {
  isEdit.value = true
  form.value = { ...row }
  originalForm.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

// 提交新增或更新操作
const onSubmit = async () => {
  if (!form.value.target || !form.value.target.trim()) {
    ElMessage.warning('考核项名称不能为空')
    return
  }
  if (form.value.score === null || form.value.score === undefined || isNaN(form.value.score)) {
    ElMessage.warning('请填写分值')
    return
  }
  if (form.value.floating === null || form.value.floating === undefined || isNaN(form.value.floating)) {
    ElMessage.warning('请填写浮动上限')
    return
  }
  if (!form.value.description || !form.value.description.trim()) {
    ElMessage.warning('请填写指标描述')
    return
  }
  if (!form.value.scoringMethod || !form.value.scoringMethod.trim()) {
    ElMessage.warning('请填写评分标准')
    return
  }
  if (!form.value.deptId) {
    ElMessage.warning('请选择打分部门')
    return
  }
  if (isEdit.value && JSON.stringify(form.value) === JSON.stringify(originalForm.value)) {
    dialogVisible.value = false
    ElMessage.info('没有任何修改，已关闭弹窗')
    return
  }
  const payload = {
    target: form.value.target,
    score: form.value.score,
    floating: form.value.floating,
    description: form.value.description,
    scoringMethod: form.value.scoringMethod,
    deptId: form.value.deptId
  }
  try {
    if (isEdit.value) {
      await updateTarget({ id: form.value.id, ...payload })
      ElMessage.success('更新成功')
    } else {
      await addTarget(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchTargets()
  } catch (err) {
    console.error('❌ 操作失败:', err)
    ElMessage.error('操作失败，请稍后再试')
  }
}

// 删除考核项
const deleteTargetById = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除考核项【${row.target}】吗？`, '警告', { type: 'warning' })
    await deleteTarget(row.id)
    ElMessage.success('删除成功')
    fetchTargets()
  } catch (err) {
    console.error('❌ 删除失败:', err)
    ElMessage.error('删除失败，请稍后再试')
  }
}

// 统一的筛选处理函数，对比 row 中对应属性与选项数值是否完全相等
const filterHandler = (value, row, column) => {
  const property = column.property
  if (!value || !property) return true
  return String(row[property]) === String(value)
}

// 下拉筛选数据（基于当前列表数据统计唯一值）
const targetFilters = computed(() => {
  const values = Array.from(new Set(targetList.value.map(item => item.target).filter(v => v != null)))
  return values.map(val => ({ text: val, value: val }))
})
const yearFilters = computed(() => {
  const values = Array.from(new Set(targetList.value.map(item => item.year).filter(v => v != null)))
  return values.map(val => ({ text: val, value: val }))
})
const scoreFilters = computed(() => {
  const values = Array.from(new Set(targetList.value.map(item => item.score)))
  return values.map(val => ({ text: Number(val).toFixed(2), value: val }))
})
const floatingFilters = computed(() => {
  const values = Array.from(new Set(targetList.value.map(item => item.floating)))
  return values.map(val => ({ text: Number(val).toFixed(2), value: val }))
})
const deptFilters = computed(() => {
  const values = Array.from(new Set(targetList.value.map(item => item.deptName).filter(v => v != null)))
  return values.map(val => ({ text: val, value: val }))
})

// ✅ 模板上传
function triggerFileUpload() {
  uploadInput.value?.click()
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await importTargetList(formData)
    const res = response?.data


    if (res?.code === 0) {
      ElMessage.success(res?.message || '✅ 模板上传成功')
      await fetchTargets()
    } else {
      console.error('❌ 后端返回错误:', res)
      ElMessage.error(res?.message || '上传失败，请稍后再试')
    }
  } catch (err) {
    console.error('❌ 上传异常:', err)
    ElMessage.error('上传失败，请稍后再试')
  } finally {
    loading.value = false
    uploadInput.value.value = ''
  }
}

// ✅ 模板下载
async function handleExportTemplate() {
  try {
    loading.value = true
    const res = await exportTargetList()
    saveAs(res.data, `考核项模板_${dayjs().format('YYYYMM')}.xlsx`)
    ElMessage.success('🎉 模板下载成功！')
  } catch (err) {
    console.error('❌ 模板下载失败:', err)
    ElMessage.error('下载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDepts()
  fetchTargets()
})
</script>

<style>
.button-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
}
</style>