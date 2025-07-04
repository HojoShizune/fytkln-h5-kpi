<template>
  <div class="score-board-page">
    <div class="page-title">
      <h2>{{ deptName }} - {{ selectedPeriod }} 指标打分明细</h2>
      <el-button type="default" size="small" @click="goBack">🔙 返回汇总页</el-button>
    </div>

    <el-alert
      type="info"
      title="数据仅供展示，不可修改"
      show-icon
      :closable="false"
      class="alert-bar"
    />

    <div class="scrollable-table-wrapper">
      <el-table :data="tableData" border style="width: 100%;" table-layout="auto">
        <el-table-column prop="targetName" label="考核项" />
        <el-table-column prop="originScore" label="初始得分" />
        <el-table-column prop="coeffient" label="浮动系数" />
        <el-table-column prop="finalScore" label="最终得分" />
        <el-table-column label="核查">
          <template #default="scope">
            <el-checkbox :model-value="scope.row.isChecked === 1" disabled />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="summary-bar">
      <span>总分：</span>
      <strong>{{ totalScore }}</strong>
    </div>

    <div class="export-button-bar">
      <el-button type="primary" @click="exportDialogVisible = true">
        导出为 PDF
      </el-button>
    </div>

    <el-dialog v-model="exportDialogVisible" title="导出预览" width="90%" top="4vh">
      <div class="scroll-wrapper">
        <div ref="printArea" class="print-area">
          <h2 class="print-title">{{ deptName }}（{{ selectedPeriod }}）指标打分</h2>
          <table class="print-table">
            <thead>
              <tr>
                <th>考核项</th>
                <th>初始得分</th>
                <th>浮动系数</th>
                <th>最终得分</th>
                <th>是否核查</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in tableData" :key="idx">
                <td>{{ row.targetName }}</td>
                <td>{{ row.originScore }}</td>
                <td>{{ row.coeffient }}</td>
                <td>{{ row.finalScore }}</td>
                <td>{{ row.isChecked === 1 ? '✅ 已核查' : '❗ 未核查' }}</td>
              </tr>
              <tr>
                <td colspan="2">总分</td>
                <td colspan="3"><strong>{{ totalScore }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">导出 PDF</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import html2pdf from 'html2pdf.js'
import { ElMessage } from 'element-plus'
import { fetchHistory } from '../api/score'

const route = useRoute()
const router = useRouter()

const deptId = route.params.deptId
const selectedPeriod = route.query.date ?? new Date().toISOString().slice(0, 7)

const deptName = ref('')
const tableData = ref([])
const loading = ref(false)
const exportDialogVisible = ref(false)
const printArea = ref(null)

onMounted(() => {
  if (deptId) fetchDetail()
})

async function fetchDetail() {
  loading.value = true
  try {
    const res = await fetchHistory(deptId, selectedPeriod)
    tableData.value = Array.isArray(res.data) ? res.data : []
    if (tableData.value.length > 0) {
      deptName.value = tableData.value[0].deptName
    }
  } catch (err) {
    ElMessage.error('加载历史明细失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const totalScore = computed(() => {
  return tableData.value.reduce((sum, row) => sum + Number(row.finalScore || 0), 0).toFixed(2)
})

function goBack() {
  router.push({ path: '/scoring/history-score-board' })
}

function handleConfirmExport() {
  const el = printArea.value
  if (!el) return

  html2pdf()
    .set({
      margin: 10,
      filename: `${deptName.value}_指标打分_${selectedPeriod}.pdf`,
      pagebreak: { mode: ['avoid-all'] },
      html2canvas: { scale: 1.0, backgroundColor: '#fff', useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(el)
    .save()
    .finally(() => {
      exportDialogVisible.value = false
    })
}
</script>

<style scoped>
.score-board-page {
  padding: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.alert-bar {
  margin-bottom: 16px;
}

.scrollable-table-wrapper {
  max-height: 480px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.summary-bar {
  margin: 16px 0;
  font-size: 15px;
  text-align: left;
  color: #303133;
}
.summary-bar strong {
  font-size: 17px;
  color: #409EFF;
  margin-left: 4px;
}

.export-button-bar {
  text-align: center;
  margin-bottom: 24px;
}

.scroll-wrapper {
  max-height: 80vh;
  overflow-y: auto;
}

.print-area {
  max-width: 180mm;
  margin: 0 auto;
  padding: 16px;
  background-color: white;
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
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
