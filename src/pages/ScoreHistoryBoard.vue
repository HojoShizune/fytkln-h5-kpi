<template>
  <div class="score-summary-page">
    <h2 class="page-title">{{ title }}</h2>

    <!-- ✅ 账期选择控件 -->
    <PeriodSelector
      :period="selectedPeriod"
      @update:period="handlePeriodChange"
    />


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

    <!-- ✅ PDF 导出弹窗 -->
    <div class="export-button-bar">
      <el-button type="primary" @click="exportDialogVisible = true">
        📄 导出为 PDF
      </el-button>
    </div>

    <el-dialog v-model="exportDialogVisible" title="导出预览" width="90%" top="4vh">
      <div class="scroll-wrapper">
        <div ref="printArea" class="print-area">
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
              <span>审批人：____________</span>
              <span>审核人：____________</span>
              <span>制表人：____________</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确认导出 PDF</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import PeriodSelector from '../components/PeriodSelector.vue'

import { fetchHistorySummary } from '../api/score'

const router = useRouter()

// ✅ 页面标题与状态
const selectedPeriod = ref(dayjs().subtract(1, 'month').format('YYYY-MM'))
const title = ref(`${dayjs(selectedPeriod.value).format('YYYY年MM月')}部门绩效考核得分汇总表`)
const tableData = ref([])
const loading = ref(false)
const exportDialogVisible = ref(false)
const printArea = ref(null)

// ✅ 表头定义（与 template 对应）
const columnDefs = [
  { prop: 'deptName', label: '部门名称' },
  { prop: 'originScore', label: '起始分值' },
  { prop: 'coeffient', label: '浮动系数' },
  { prop: 'finalScore', label: '最终得分' },
  { prop: 'isChecked', label: '数据核查' }
]

// ✅ 页面加载与账期变更
onMounted(() => {
  fetchTableData()
})

function handlePeriodChange(val) {
  selectedPeriod.value = val
  title.value = `${dayjs(val).format('YYYY年MM月')}部门绩效考核得分汇总表`
  fetchTableData()
}

// ✅ 请求历史汇总数据
async function fetchTableData() {
  loading.value = true
  try {
    const res = await fetchHistorySummary(selectedPeriod.value)
    tableData.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ 获取历史汇总失败:', err)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ✅ 跳转至部门明细页
function goToDeptScore(deptId) {
  router.push({
    name: 'ScoreHistorySummary',
    params: { deptId: String(deptId) },
    query: { date: selectedPeriod.value }
  })
}

// ✅ 平均分计算
const avgScore = computed(() => {
  if (!tableData.value.length) return '-'
  const total = tableData.value.reduce((sum, row) => sum + Number(row.finalScore || 0), 0)
  return (total / tableData.value.length).toFixed(2)
})

// ✅ 导出 PDF 操作
function handleConfirmExport() {
  nextTick(() => {
    const el = printArea.value
    if (!el) return

    html2pdf()
      .set({
        margin: 10,
        filename: `历史得分汇总_${selectedPeriod.value}.pdf`,
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
</script>

<style>
.score-summary-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--el-bg-color); /* ✅ 支持暗黑 */
  color: var(--el-text-color-primary);   /* ✅ 字体颜色 */
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);   /* ✅ 字体颜色适配 */
}

.preview-table-wrapper {
  margin-top: 32px;
  width: 100%;
  max-width: 1000px;
  border: 1px solid var(--el-border-color); /* ✅ 替换亮灰 */
  padding: 24px;
  background-color: var(--el-bg-color);     /* ✅ 背景适配 */
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
  background-color: var(--el-bg-color);     /* ✅ 表格背景 */
  color: var(--el-text-color-primary);      /* ✅ 表格文字色 */
}

.preview-table th,
.preview-table td {
  border: 1px solid var(--el-border-color); /* ✅ 表格边框色 */
  padding: 6px 10px;
}

.loading-tip {
  text-align: center;
  margin: 12px 0;
  color: var(--el-text-color-secondary);    /* ✅ 提示色适配 */
}

/* ✅ 打印区域（保持亮色用于 PDF，不动） */
.print-area {
  max-width: 180mm;
  margin: 0 auto;
  padding: 16px;
  background: white;
  color: black;
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
  color: black;
  background-color: white;
}

.print-table tr,
.print-table tbody {
  page-break-inside: avoid;
}

/* ✅ 平均分 + 审批栏样式 */
.summary-section {
  font-size: 14px;
  margin-top: 12px;
  color: var(--el-text-color-primary); /* ✅ 文字色适配 */
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

/* ✅ 导出按钮区域 */
.export-button-bar {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>

