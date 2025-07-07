<template>
  <div class="bulk-export-wrapper">
    <el-button type="success" @click="handleExportAll" :loading="exporting">
      📦 一键导出全部部门打分 PDF
    </el-button>
    <div ref="printContainer" class="print-container" style="display: none;"></div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import html2pdf from 'html2pdf.js'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { fetchAssessmentList } from '../api/score'

// ✅ 正确引入 props（已修复）
const { deptList = [] } = defineProps()

const exporting = ref(false)
const printContainer = ref(null)

function formatRemark(text) {
  if (!text) return ''
  const maxPerLine = 18
  const result = []
  for (let i = 0; i < text.length; i += maxPerLine) {
    result.push(text.slice(i, i + maxPerLine))
  }
  return result.join('\n')
}

function renderDeptDom(deptName, scoreList) {
  const el = document.createElement('div')
  el.className = 'print-area'

  const title = document.createElement('h2')
  title.className = 'print-title'
  title.innerText = `${deptName}（${dayjs().format('YYYY年MM月')}）`
  el.appendChild(title)

  const table = document.createElement('table')
  table.className = 'print-table'

  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')
  ;['考核项', '分值', '浮动上限', '初始得分', '考核部门', '备注', '数据核查'].forEach(label => {
    const th = document.createElement('th')
    th.innerText = label
    headRow.appendChild(th)
  })
  thead.appendChild(headRow)
  table.appendChild(thead)

  const tbody = document.createElement('tbody')
  scoreList.forEach(row => {
    const tr = document.createElement('tr')
    const cols = [
      row.targetName,
      row.score,
      row.floating,
      row.originScore ?? '-',
      row.scoringDept,
      formatRemark(row.remark),
      row.isChecked === 1 ? '✅ 已核查' : '❗ 未核查'
    ]
    cols.forEach(text => {
      const td = document.createElement('td')
      td.innerText = text
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })

  const total = scoreList.reduce((sum, row) => sum + (parseFloat(row.originScore) || 0), 0)
  const totalRow = document.createElement('tr')
  totalRow.style.fontWeight = 'bold'
  totalRow.style.backgroundColor = '#f0f0f0'

  const td1 = document.createElement('td')
  td1.colSpan = 3
  td1.innerText = '总分'
  const td2 = document.createElement('td')
  td2.innerText = total.toFixed(2)
  const tdRest = document.createElement('td')
  tdRest.colSpan = 3
  tdRest.innerText = ''

  totalRow.appendChild(td1)
  totalRow.appendChild(td2)
  totalRow.appendChild(tdRest)
  tbody.appendChild(totalRow)

  table.appendChild(tbody)
  el.appendChild(table)

  return el
}

async function handleExportAll() {
  if (!printContainer.value) return
  exporting.value = true
  printContainer.value.innerHTML = ''

  for (const dept of deptList) {
    try {
      const res = await fetchAssessmentList(dept.deptId)
      const scoreList = Array.isArray(res.data) ? res.data : []
      const block = renderDeptDom(dept.deptName, scoreList)
      printContainer.value.appendChild(block)

      const divider = document.createElement('div')
      divider.className = 'pdf-page-break'
      printContainer.value.appendChild(divider)
    } catch (err) {
      console.error(`❌ 获取部门数据失败：${dept.deptName}`, err)
    }
  }

  nextTick(() => {
    html2pdf()
      .set({
        margin: 10,
        filename: `所有部门打分汇总_${dayjs().format('YYYYMMDD')}.pdf`,
        pagebreak: { mode: ['css', 'avoid-all'], before: '.pdf-page-break' },
        html2canvas: { scale: 1.0, backgroundColor: '#fff', useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(printContainer.value)
      .save()
      .then(() => {
        ElMessage.success('✅ 全部部门 PDF 导出成功')
      })
      .finally(() => {
        exporting.value = false
      })
  })
}
</script>

<style scoped>
.bulk-export-wrapper {
  margin-top: 16px;
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
  vertical-align: top;
  white-space: pre-wrap;
  word-break: break-word;
}

.pdf-page-break {
  page-break-before: always;
}
</style>
