<template>
  <div class="score-summary-page">
    <h2 class="page-title">{{ title }}</h2>

    <!-- 页面展示区域 -->
    <div class="preview-table-wrapper">
      <div class="scrollable-table">
        <table class="preview-table">
          <thead>
            <tr>
              <th v-for="col in columnDefs" :key="col.prop">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableData" :key="row.id">
              <td>{{ row.deptName }}</td>
              <td>{{ row.originScore }}</td>
              <td>{{ row.coeffient }}</td>
              <td>{{ row.finalScore }}</td>

              <!-- ✅ 数据核查列 -->
              <td>
                <el-checkbox
                  :model-value="row.isChecked === 1"
                  @change="val => toggleCheck(row, val)"
                />
              </td>
            </tr>
          </tbody>
        </table>
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

    <!-- 导出按钮 -->
    <div class="export-button-bar">
      <el-button type="success" @click="exportDialogVisible = true">
        📄 导出为 PDF
      </el-button>
    </div>

    <!-- 弹窗预览（导出区域） -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出预览"
      width="90%"
      top="4vh"
    >
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
              <tr v-for="row in tableData" :key="row.id">
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
        <el-button type="primary" @click="handleConfirmExport">
          确认导出 PDF
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import dayjs from 'dayjs'
import html2pdf from 'html2pdf.js'

const title = `${dayjs().format('YYYY年MM月')}部门绩效考核得分汇总表`
const printArea = ref(null)
const exportDialogVisible = ref(false)

const columnDefs = [
  { prop: 'deptName', label: '部门名称' },
  { prop: 'originScore', label: '起始分值' },
  { prop: 'coeffient', label: '浮动系数' },
  { prop: 'finalScore', label: '最终得分' },
  { prop: 'isChecked', label: '数据核查' } // ✅ 替换备注列
]

const departments = ['海州分公司', '滨海分公司', '新浦分公司', '连云港本部']
const tableData = ref([])

for (let i = 1; i <= 40; i++) {
  tableData.value.push({
    id: i,
    deptId: i,
    deptName: departments[i % departments.length],
    originScore: 100.0,
    coeffient: (Math.random() * 0.4 + 0.8).toFixed(2),
    finalScore: Math.floor(Math.random() * 20 + 80),
    isChecked: i % 2 === 0 ? 1 : 0 // ✅ 初始核查状态
  })
}

function toggleCheck(row, val) {
  row.isChecked = val ? 1 : 0
}

const avgScore = computed(() => {
  if (!tableData.value.length) return '-'
  const total = tableData.value.reduce((sum, row) => sum + Number(row.finalScore), 0)
  return (total / tableData.value.length).toFixed(2)
})

function handleConfirmExport() {
  nextTick(() => {
    const el = printArea.value
    if (!el) return

    html2pdf()
      .set({
        margin: 10,
        filename: `${dayjs().format('YYYY年MM月')}部门绩效考核得分汇总表.pdf`,
        pagebreak: { mode: ['avoid-all'] },
        html2canvas: {
          scale: 1.0,
          backgroundColor: '#fff',
          useCORS: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      })
      .from(el)
      .save()
      .finally(() => {
        exportDialogVisible.value = false
      })
  })
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

/* ✅ 导出区域宽度限制为 A4 portrait 安全范围 */
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
  page-break-inside: avoid; /* ✅ 表格行避免被分页裁切 */
}

/* 平均分 + 审批栏样式 */
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

/* ✅ 弹窗预览区滚动容器 */
.scroll-wrapper {
  max-height: 80vh;
  overflow-y: auto;
}

.export-button-bar {
  margin-top: 24px;
  text-align: center;
}
</style>