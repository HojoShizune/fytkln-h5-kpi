<template>
  <div class="score-summary-page">
    <h2 class="page-title">{{ title }}</h2>

    <!-- ✅ 表格区域 -->
    <div class="preview-table-wrapper">
      <div class="scrollable-table">
        <div v-if="loading" class="loading-tip">⏳ 正在加载打分数据中...</div>
        <el-skeleton :loading="loading" animated>
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="col in columnDefs" :key="col.prop">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableData" :key="row.deptId">
                <td>
                  <el-link type="primary" @click="goToDeptScore(row.deptId)">
                    {{ row.deptName }}
                  </el-link>
                </td>
                <td>{{ row.originScore }}</td>
                <td>{{ row.coeffient }}</td>
                <td>{{ row.finalScore }}</td>
                <td>
                  <el-checkbox :model-value="row.isChecked === 1" disabled />
                </td>
              </tr>
            </tbody>
          </table>
        </el-skeleton>
      </div>

      <div class="summary-section">
        <div class="avg-row">平均分：{{ avgScore }}</div>
        <div class="sign-row">
          <span>审批人：</span>
          <span>审核人：</span>
          <span>制表人：</span>
        </div>
      </div>
    </div>

    <!-- ✅ 按钮操作区域 -->
    <div class="export-button-bar">
      <!-- 🔒 指标管理/审核人员（roleId != 2 显示） -->
      <el-button
        v-if="userStore.roleId !== 2 && userStore.roleId !== 3"
        type="primary"
        @click="templateDialogVisible = true"
      >
        导入/导出打分模板
      </el-button>

      <!-- 🔒 问卷评分人员不显示（roleId != 3） -->
      <el-button
        v-if="userStore.roleId !== 3"
        type="success"
        @click="excelDialogVisible = true"
      >
        导出 EXCEL
      </el-button>

      <!-- 🔒 KPI人员不可见（roleId != 4）且不是问卷员 -->
      <el-button
        v-if="userStore.roleId !== 4 && userStore.roleId !== 3"
        type="warning"
        @click="handleCalculate"
     >
        纪检考核项计算
      </el-button>

      <el-button
        v-if="userStore.roleId !== 4 && userStore.roleId !== 3"
        type="primary"
        @click="handleRenew"
      >
        数据提交
      </el-button>

      <el-button
        v-if="userStore.roleId !== 4 && userStore.roleId !== 3"
        type="primary"
        @click="openRemotePdf"
      >
        导出 PDF
      </el-button>
    </div>


    <!-- ✅ 模板弹窗 -->
    <el-dialog v-model="templateDialogVisible" title="打分模板操作" width="420px">
      <div class="button-group">
        <el-button type="primary" @click="triggerFileUpload">📥 导入打分模板</el-button>
        <input
          ref="uploadInput"
          type="file"
          accept=".xlsx,.xls"
          style="display: none"
          @change="handleFileUpload"
        />
        <el-button type="warning" @click="handleExportTemplate" :loading="loading">
           导出打分模板
        </el-button>
      </div>
    </el-dialog>

    <!-- ✅ 弹窗：纪检考核项计算 -->
    <el-dialog v-model="dialogCalculateVisible" title="提示" width="400px">
      <p>除了派驻纪检组以外，所有部门数据都已核查，是否继续进行纪检考核项计算？</p>
      <template #footer>
        <el-button @click="dialogCalculateVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmCalculate">确认执行</el-button>
      </template>
    </el-dialog>

    <!-- ✅ 弹窗：数据提交与重置 -->
    <el-dialog v-model="dialogRenewVisible" title="提示" width="400px">
      <p>所有部门数据都已核查，请确保已导出汇总表和各部门 PDF 打分表。</p>
      <p>提交与重置后不可再导出 PDF，是否继续？</p>
      <template #footer>
        <el-button @click="dialogRenewVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRenew">确认提交与重置</el-button>
      </template>
    </el-dialog>

    <!-- ✅ PDF / Excel 导出弹窗 -->
    <el-dialog v-model="excelDialogVisible" title="导出数据" width="420px">
      <div class="button-group">
        <button class="native-btn warning" @click="handleExportDetailExcel">
           导出所有部门考核明细
        </button>
        <button class="native-btn success" @click="handleExportSummaryExcel">
           导出部门得分汇总
        </button>
      </div>
    </el-dialog>

    <!-- ✅ 接入后端 PDF 预览组件 -->
    <RemotePdfViewer ref="remotePdfRef" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import dayjs from 'dayjs'
import html2pdf from 'html2pdf.js'
import { useRouter } from 'vue-router'
import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus'
import CompletePdfExporter from '../components/CompletePdfExporter.vue'
import {
  fetchScoreSummary,
  uploadScoreTemplate,
  downloadScoreTemplateFile,
  downloadAllDeptDetailFile,
  downloadScoreSummaryFile,
  calculateAssessment,
  renewAssessment,
  fetchAssessmentList
} from '../api/score'
import RemotePdfViewer from '../components/RemotePdfViewer.vue' 
import { useUserStore } from '../store/user'

// ✅ 页面标题
const title = `${dayjs().subtract(1, 'month').format('YYYY年MM月')}部门绩效考核得分汇总表`

// ✅ 响应式变量
const tableData = ref([])
const printArea = ref(null)
const uploadInput = ref(null)
const loading = ref(false)
const userStore = useUserStore()

const assessmentMap = ref({})
const remotePdfRef = ref(null)

const exportDialogVisible = ref(false)
const templateDialogVisible = ref(false)
const excelDialogVisible = ref(false)

const dialogCalculateVisible = ref(false)
const dialogRenewVisible = ref(false)

// ✅ 表格列定义
const columnDefs = [
  { prop: 'deptName', label: '部门名称' },
  { prop: 'originScore', label: '起始分值' },
  { prop: 'coeffient', label: '浮动系数' },
  { prop: 'finalScore', label: '最终得分' },
  { prop: 'isChecked', label: '数据核查' }
]

// ✅ 页面加载获取数据
onMounted(() => {
  fetchTableData()
  console.log('当前角色 roleId:', userStore.roleId)
})

// ✅ 路由跳转
const router = useRouter()
function goToDeptScore(deptId) {
  router.push({ name: 'ScoreSummary', params: { deptId } })
}

function getTotal(list) {
  return Array.isArray(list)
    ? list.reduce((sum, row) => sum + Number(row.originScore || 0), 0).toFixed(2)
    : '0.00'
}

function openRemotePdf() {
  remotePdfRef.value?.open()
}

async function fetchAllDepartmentDetails() {
  const result = {}

  for (const dept of tableData.value) {
    try {
      const res = await fetchAssessmentList(dept.deptId)
      result[dept.deptId] = res.data || []
    } catch (err) {
      console.error(`❌ 获取 ${dept.deptName} 的打分详情失败`, err)
      result[dept.deptId] = []
    }
  }

  assessmentMap.value = result
  console.log('评分详情加载情况:', assessmentMap.value)

}

// ✅ 加载打分数据（带 loading 控制）
async function fetchTableData() {
  loading.value = true
  try {
    const res = await fetchScoreSummary()
    tableData.value = Array.isArray(res.data.data) ? res.data.data : []
    await fetchAllDepartmentDetails()
  } catch (err) {
    console.error('❌ 获取打分数据失败:', err)
  } finally {
    loading.value = false
  }
}



// ✅ 平均分计算
const avgScore = computed(() => {
  if (!tableData.value.length) return '-'
  const total = tableData.value.reduce((sum, row) => sum + Number(row.finalScore), 0)
  return (total / tableData.value.length).toFixed(2)
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

    await uploadScoreTemplate(formData)
    ElMessage.success('✅ 模板上传成功')
    fetchTableData()
  } catch (err) {
    console.error('❌ 模板上传失败:', err)
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
    const res = await downloadScoreTemplateFile()
    saveAs(res.data, `打分模板_${dayjs().format('YYYYMM')}.xlsx`)
    ElMessage.success('🎉 模板下载成功！')
  } catch (err) {
    console.error('❌ 模板下载失败:', err)
    ElMessage.error('下载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ✅ PDF 导出
function handleConfirmExport() {
  nextTick(() => {
    const el = printArea.value
    if (!el) return

    html2pdf()
      .set({
        margin: 10,
        filename: `${title}.pdf`,
        pagebreak: { mode: ['avoid-all'] },
        html2canvas: { scale: 1.0, backgroundColor: '#fff', useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(el)
      .save()
      .finally(() => {
        exportDialogVisible.value = false
      })
  })
}

// ✅ 导出 Excel - 明细
async function handleExportDetailExcel() {
  try {
    loading.value = true
    const res = await downloadAllDeptDetailFile()
    saveAs(res.data, `所有部门考核明细_${dayjs().format('YYYYMMDD')}.xlsx`)
    ElMessage.success('✅ 明细已成功导出')
  } catch (err) {
    console.error('❌ 导出明细失败:', err)
    ElMessage.error('导出失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// ✅ 导出 Excel - 汇总
async function handleExportSummaryExcel() {
  try {
    loading.value = true
    const res = await downloadScoreSummaryFile()
    saveAs(res.data, `部门得分汇总_${dayjs().format('YYYYMMDD')}.xlsx`)
    ElMessage.success('✅ 汇总已成功导出')
  } catch (err) {
    console.error('❌ 导出汇总失败:', err)
    ElMessage.error('导出失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// ✅ 纪检考核项点击按钮（条件提示）
function handleCalculate() {
  const others = tableData.value.filter(row => row.deptName !== '派驻纪检组')
  const valid = others.length > 0 && others.every(row => Number(row.isChecked) === 1)

  if (!valid) {
    ElMessage.warning('❗ 非纪检组数据未全部核查，暂不可计算')
    return
  }

  dialogCalculateVisible.value = true
}

// ✅ 数据提交与重置点击按钮（条件提示）
function handleRenew() {
  const valid = tableData.value.length > 0 && tableData.value.every(row => Number(row.isChecked) === 1)

  if (!valid) {
    ElMessage.warning('❗ 所有部门数据需核查完毕后才可提交与重置')
    return
  }

  dialogRenewVisible.value = true
}

// ✅ 执行纪检考核项计算
async function confirmCalculate() {
  try {
    await calculateAssessment()
    ElMessage.success('✅ 纪检考核项计算成功')
  } catch (err) {
    console.error('❌ 纪检计算失败:', err)
    ElMessage.error('计算失败，请稍后再试')
  } finally {
    dialogCalculateVisible.value = false
    fetchTableData()
  }
}

// ✅ 执行数据提交与重置
async function confirmRenew() {
  try {
    await renewAssessment()
    ElMessage.success('✅ 数据提交与重置成功')
  } finally {
    dialogRenewVisible.value = false
    fetchTableData()
  }
}
</script>

<style>
.score-summary-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--el-bg-color); /* ✅ 支持暗黑背景 */
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--el-text-color-primary); /* ✅ 适配字体颜色 */
}

.preview-table-wrapper {
  margin-top: 32px;
  width: 100%;
  max-width: 1000px;
  border: 1px solid var(--el-border-color); /* ✅ 替换亮色边框 */
  padding: 24px;
  background-color: var(--el-bg-color);      /* ✅ 背景适配 */
  color: var(--el-text-color-primary);       /* ✅ 文字色适配 */
}

.scrollable-table {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-primary);       /* ✅ 表格文字色 */
  background-color: var(--el-bg-color);      /* ✅ 表格背景色 */
}

.preview-table th,
.preview-table td {
  border: 1px solid var(--el-border-color);  /* ✅ 替换表格边框色 */
  padding: 6px 10px;
}

/* ✅ 平均分 + 审批栏样式 */
.summary-section {
  font-size: 14px;
  margin-top: 12px;
  color: var(--el-text-color-primary);       /* ✅ 审批文字颜色 */
}

.avg-row {
  font-weight: bold;
  margin-bottom: 6px;
}

.sign-row {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px dashed var(--el-border-color); /* ✅ 替换虚线颜色 */
}

/* ✅ 导出按钮区域样式 */
.export-button-bar {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
}

/* ✅ 通用原生按钮风格 */
.native-btn {
  display: inline-block;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid transparent;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
  user-select: none;
}

/* ✅ success 风格对应 el-button type="success" */
.native-btn.success {
  color: var(--el-button-text-color, #fff);                 /* ✅ 适配字体色 */
  background-color: var(--el-color-success);               /* ✅ 成功背景色 */
  border-color: var(--el-color-success);                   /* ✅ 成功边框色 */
}
.native-btn.success:hover {
  background-color: var(--el-color-success-light);         /* ✅ hover 效果 */
  border-color: var(--el-color-success-light);
}

/* ✅ warning 风格按钮（可扩展） */
.native-btn.warning {
  color: var(--el-button-text-color, #fff);
  background-color: var(--el-color-warning);
  border-color: var(--el-color-warning);
}
.native-btn.warning:hover {
  background-color: var(--el-color-warning-light);
  border-color: var(--el-color-warning-light);
}

/* ✅ 加载提示适配字体颜色 */
.loading-tip {
  color: var(--el-text-color-secondary);
}
</style>

