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

    <!-- ✅ 操作按钮 -->
    <div class="export-button-bar">
      <el-button type="primary" @click="templateDialogVisible = true">
        📁 导入/导出打分模板
      </el-button>
      <el-button type="success" @click="excelDialogVisible = true">
        📤 导出 PDF / EXCEL
      </el-button>
      <el-button type="warning" @click="handleCalculate">
        🧮 纪检考核项计算
      </el-button>
      <el-button type="primary" @click="handleRenew">
        🧾 数据提交与重置
      </el-button>

      <!-- 完整导出所有 PDF -->
      <CompletePdfExporter :title="title" />
    </div>

    <!-- … 其他弹窗保持不变 … -->

    <!-- ✅ 隐藏的“汇总表”容器，用于 CompletePdfExporter 抓取 -->
    <div id="score-board-preview" style="display: none;">
      <h2 class="print-title">{{ title }}</h2>
      <table class="print-table">
        <thead>
          <tr>
            <th v-for="col in columnDefs" :key="col.prop">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.deptId">
            <td>{{ row.deptName }}</td>
            <td>{{ row.originScore }}</td>
            <td>{{ row.coeffient }}</td>
            <td>{{ row.finalScore }}</td>
            <td>{{ row.isChecked === 1 ? '✅ 已核查' : '❗ 未核查' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="summary-section">
        <div class="avg-row">平均分：{{ avgScore }}</div>
        <div class="sign-row">
          <span>审批人：</span>
          <span>审核人：</span>
          <span>制表人：</span>
        </div>
      </div>
    </div>

    <!-- ✅ 隐藏的“各部门详情”容器，用于 CompletePdfExporter 抓取 -->
    <div id="score-summary-preview" style="display: none;">
      <div
        v-for="dept in tableData"
        :key="dept.deptId"
        class="print-area"
      >
        <h2 class="print-title">{{ dept.deptName }}（{{ title }}）</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>考核项</th>
              <th>分值</th>
              <th>浮动上限</th>
              <th>初始得分</th>
              <th>考核部门</th>
              <th>备注</th>
              <th>数据核查</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in assessmentMap[dept.deptId]"
              :key="row.id ?? idx"
            >
              <td>{{ row.targetName }}</td>
              <td>{{ row.score }}</td>
              <td>{{ row.floating }}</td>
              <td>{{ row.originScore ?? '-' }}</td>
              <td>{{ row.scoringDept }}</td>
              <td style="white-space: pre-wrap;">{{ row.remark ?? '' }}</td>
              <td>{{ row.isChecked === 1 ? '✅ 已核查' : '❗ 未核查' }}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #f0f0f0;">
              <td colspan="3">总分</td>
              <td>{{ getTotal(assessmentMap[dept.deptId]) }}</td>
              <td colspan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus'
import CompletePdfExporter from '../components/CompletePdfExporter.vue'
import {
  fetchScoreSummary,
  fetchAssessmentList,
  uploadScoreTemplate,
  downloadScoreTemplateFile,
  downloadAllDeptDetailFile,
  downloadScoreSummaryFile,
  calculateAssessment,
  renewAssessment
} from '../api/score'

const router = useRouter()

const title = `${dayjs().format('YYYY年MM月')}部门绩效考核得分汇总表`
const columnDefs = [
  { prop: 'deptName', label: '部门名称' },
  { prop: 'originScore', label: '起始分值' },
  { prop: 'coeffient', label: '浮动系数' },
  { prop: 'finalScore', label: '最终得分' },
  { prop: 'isChecked', label: '数据核查' }
]

const tableData = ref([])
const assessmentMap = ref({})
const loading = ref(false)

const exportDialogVisible = ref(false)
const templateDialogVisible = ref(false)
const excelDialogVisible = ref(false)
const dialogCalculateVisible = ref(false)
const dialogRenewVisible = ref(false)
const uploadInput = ref(null)

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

async function fetchAllDepartmentDetails() {
  const result = {}
  for (const dept of tableData.value) {
    try {
      const res = await fetchAssessmentList(dept.deptId)
      result[dept.deptId] = res.data || []
    } catch {
      result[dept.deptId] = []
    }
  }
  assessmentMap.value = result
}

onMounted(fetchTableData)

const avgScore = computed(() => {
  if (!tableData.value.length) return '-'
  const total = tableData.value.reduce((sum, row) => sum + Number(row.finalScore), 0)
  return (total / tableData.value.length).toFixed(2)
})

function goToDeptScore(deptId) {
  router.push({ name: 'ScoreSummary', params: { deptId } })
}

function triggerFileUpload() {
  uploadInput.value?.click()
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  loading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    await uploadScoreTemplate(form)
    ElMessage.success('✅ 模板上传成功')
    fetchTableData()
  } catch {
    ElMessage.error('上传失败')
  } finally {
    loading.value = false
    uploadInput.value.value = ''
  }
}

async function handleExportTemplate() {
  loading.value = true
  try {
    const res = await downloadScoreTemplateFile()
    saveAs(res.data, `打分模板_${dayjs().format('YYYYMM')}.xlsx`)
    ElMessage.success('模板下载成功')
  } catch {
    ElMessage.error('下载失败')
  } finally {
    loading.value = false
  }
}

async function handleExportDetailExcel() {
  loading.value = true
  try {
    const res = await downloadAllDeptDetailFile()
    saveAs(res.data, `所有部门考核明细_${dayjs().format('YYYYMMDD')}.xlsx`)
    ElMessage.success('明细导出成功')
  } catch {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

async function handleExportSummaryExcel() {
  loading.value = true
  try {
    const res = await downloadScoreSummaryFile()
    saveAs(res.data, `部门得分汇总_${dayjs().format('YYYYMMDD')}.xlsx`)
    ElMessage.success('汇总导出成功')
  } catch {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

function handleCalculate() {
  const others = tableData.value.filter(r => r.deptName !== '派驻纪检组')
  const valid = others.length && others.every(r => r.isChecked === 1)
  if (!valid) {
    ElMessage.warning('非纪检组数据未全部核查')
    return
  }
  dialogCalculateVisible.value = true
}

async function confirmCalculate() {
  try {
    await calculateAssessment()
    ElMessage.success('纪检计算成功')
    fetchTableData()
  } catch {
    ElMessage.error('计算失败')
  } finally {
    dialogCalculateVisible.value = false
  }
}

function handleRenew() {
  const valid = tableData.value.length && tableData.value.every(r => r.isChecked === 1)
  if (!valid) {
    ElMessage.warning('所有部门需核查后才可提交与重置')
    return
  }
  dialogRenewVisible.value = true
}

async function confirmRenew() {
  try {
    await renewAssessment()
    ElMessage.success('提交与重置成功')
    fetchTableData()
  } catch {
  } finally {
    dialogRenewVisible.value = false
  }
}

function getTotal(list) {
  return Array.isArray(list)
    ? list.reduce((s, r) => s + Number(r.originScore || 0), 0).toFixed(2)
    : '0.00'
}
</script>

<style scoped>
.score-summary-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

.preview-table-wrapper {
  margin-top: 32px;
  width: 100%;
  max-width: 1000px;
  border: 1px solid #dcdfe6;
  padding: 24px;
  background-color: white;
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
}

.preview-table th,
.preview-table td {
  border: 1px solid #dcdfe6;
  padding: 6px 10px;
}

/* ✅ 打印区域样式（A4 页面适配） */
.print-area {
  max-width: 180mm;
  margin: 0 auto;
  padding: 16px;
  background: white;
}

.print-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 12px;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 13px;
}

.print-table th,
.print-table td {
  border: 1px solid #dcdfe6;
  padding: 4px 6px;
}

.print-table tr,
.print-table tbody {
  page-break-inside: avoid;
}

/* ✅ 平均分 + 审批栏样式 */
.summary-section {
  font-size: 14px;
  margin-top: 12px;
}

.avg-row {
  font-weight: bold;
  margin-bottom: 6px;
}

.sign-row {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px dashed #ccc;
}

/* ✅ 导出按钮区域样式 */
.export-button-bar {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

/* ✅ 弹窗预览容器滚动控制 */
.scroll-wrapper {
  max-height: 80vh;
  overflow-y: auto;
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: stretch; /* ✅ 所有按钮填满同样宽度 */
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
  color: #fff;
  background-color: #67c23a;
  border-color: #67c23a;
}
.native-btn.success:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

/* ✅ warning 风格对应 el-button type="warning" */
.native-btn.warning {
  color: #fff;
  background-color: #e6a23c;
  border-color: #e6a23c;
}
.native-btn.warning:hover {
  background-color: #ebb563;
  border-color: #ebb563;
}

/* ✅ primary 风格（若有） */
.native-btn.primary {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}
.native-btn.primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.action-button-bar {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}
</style>