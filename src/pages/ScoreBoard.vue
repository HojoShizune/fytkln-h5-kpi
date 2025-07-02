<template>
  <div class="score-board-page">
    <h2 class="page-title">
      指标打分（{{ deptName }}，{{ currentMonth }}）
      <el-tooltip content="当前月份系统自动生成，无需填写" placement="right">
        <el-icon style="margin-left: 6px; color: #909399;"><Clock /></el-icon>
      </el-tooltip>
    </h2>

    <el-alert
      type="info"
      show-icon
      class="alert-bar"
      :closable="false"
      title="✅ 绿色代表数据已核查；❗红色代表数据待核查。点击本月得分填写分值"
    />

    <!-- ✅ 工具栏：全选勾选 + 核查 + PDF -->
    <div class="table-toolbar">
      <el-checkbox v-model="checkAllStatus" @change="handleToggleAllCheck">
        🔘 全部勾选为已核查
      </el-checkbox>
      <el-button type="success" size="small" @click="handleCheckAll">⚡ 一键核查</el-button>
      <el-button type="primary" size="small" @click="exportDialogVisible = true">📄 导出 PDF</el-button>
    </div>

    <!-- ✅ 表格内容 -->
    <div class="scrollable-table-wrapper">
      <el-table
        :data="tableData"
        border
        style="width: 100%;"
        table-layout="auto"
        :row-style="getRowStyle"
        height="100%"
      >
        <el-table-column label="考核项" :min-width="200">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top">
              <template #content>
                <div>
                  <div>评分标准：{{ scope.row.scoringMethod }}</div>
                  <div>计算公式：{{ scope.row.description }}</div>
                </div>
              </template>
              <span style="cursor: help; text-decoration: dotted underline;">
                {{ scope.row.targetName }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="分值" prop="score" :min-width="80" />
        <el-table-column label="浮动上限" prop="floating" :min-width="100" />

        <el-table-column label="本月得分" :min-width="140">
          <template #default="scope">
            <el-link type="primary" @click="openScoreEditor(scope.row)">
              {{ localScoreMap[scope.row.id] ?? '点击填写' }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="考核部门" prop="scoringDept" :min-width="140" />

        <el-table-column label="备注" :min-width="140">
          <template #default="scope">
            <el-link type="info" @click="openRemarkEditor(scope.row)">
              {{ scope.row.remark || '点击填写' }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="数据核查" :min-width="120">
          <template #default="scope">
            <el-checkbox
              :model-value="scope.row.isChecked === 1"
              @change="val => toggleCheck(scope.row, val)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ✅ 总分展示区域 -->
    <div class="summary-bar">
      <span>总分：</span>
      <strong>{{ totalScore }}</strong>
    </div>

    <!-- ✅ 弹窗们 -->
    <el-dialog v-model="remarkDialog.visible" title="填写备注" width="420px">
      <el-input type="textarea" rows="4" v-model="remarkDialog.input" placeholder="请输入备注内容" />
      <template #footer>
        <el-button @click="remarkDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitRemark">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="scoreDialog.visible"
      title="填写本月得分"
      width="320px"
      @close="resetScoreInput"
    >
      <el-form>
        <el-form-item label="得分（可为负）">
          <el-input v-model="scoreDialog.input" placeholder="请输入得分" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scoreDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitScore">确定</el-button>
      </template>
    </el-dialog>

    <!-- ✅ 核查确认弹窗 -->
    <el-dialog
      v-model="confirmDialog.visible"
      :title="confirmDialog.success ? '✅ 已核查项确认' : '❗ 未核查项提示'"
      width="600px"
    >
      <el-scrollbar max-height="260px">
        <el-table
          v-if="confirmDialog.items.length"
          :data="confirmDialog.items"
          border
          size="small"
          style="width: 100%; margin-bottom: 12px;"
        >
          <el-table-column prop="targetName" label="考核项" />
          <el-table-column v-if="confirmDialog.success" label="本月得分">
            <template #default="scope">
              {{ localScoreMap[scope.row.id] ?? '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="scoringDept" label="考核部门" />
        </el-table>
        <p v-if="!confirmDialog.success" style="color: #e6a23c;">
          共 {{ confirmDialog.items.length }} 项未核查，无法提交。
        </p>
      </el-scrollbar>
      <template #footer>
        <el-button @click="confirmDialog.visible = false">关闭</el-button>
        <el-button
          v-if="confirmDialog.success"
          type="success"
          @click="confirmSuccess"
        >确认核查</el-button>
      </template>
    </el-dialog>

    <!-- ✅ 导出 PDF 弹窗 -->
    <el-dialog v-model="exportDialogVisible" title="导出预览" width="90%" top="4vh">
      <div class="scroll-wrapper">
        <div ref="printArea" class="print-area">
          <h2 class="print-title">{{ deptName }}（{{ currentMonth }}）</h2>

          <table class="print-table">
            <thead>
              <tr>
                <th>考核项</th>
                <th>分值</th>
                <th>浮动上限</th>
                <th>本月得分</th>
                <th>考核部门</th>
                <th>备注</th>
                <th>数据核查</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableData" :key="row.id">
                <td>{{ row.targetName }}</td>
                <td>{{ row.score }}</td>
                <td>{{ row.floating }}</td>
                <td>{{ localScoreMap[row.id] ?? '-' }}</td>
                <td>{{ row.scoringDept }}</td>
                <td style="white-space: pre-wrap;">{{ formatRemark(row.remark) }}</td>
                <td>{{ row.isChecked === 1 ? '✅ 已核查' : '❗ 未核查' }}</td>
              </tr>

              <!-- ✅ 打印总分行 -->
              <tr style="font-weight: bold; background-color: #f0f0f0;">
                <td colspan="3">总分</td>
                <td>{{ totalScore }}</td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>
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
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import html2pdf from 'html2pdf.js'
import { Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const deptName = '海州分公司'
const currentMonth = dayjs().format('YYYY年MM月')

const tableData = ref([])
const localScoreMap = ref({})
const printArea = ref(null)
const exportDialogVisible = ref(false)
const checkAllStatus = ref(false)

const departments = ['财务部', '客服部', '人事部', '市场部', '运营部', '产品部']

for (let i = 1; i <= 100; i++) {
  const isChecked = i % 3 === 0 ? 0 : 1
  const targetName = `考核项 ${i}`
  const scoringDept = departments[i % departments.length]
  const score = Math.floor(Math.random() * 20 + 5)
  const floating = Math.random() < 0.4 ? 2 : 5
  const remark = ''

  tableData.value.push({
    id: i,
    deptName,
    targetName,
    score,
    floating,
    scoringDept,
    isChecked,
    description: `这是关于 ${targetName} 的计算说明`,
    scoringMethod: `这是 ${targetName} 的评分标准`,
    remark
  })

  localScoreMap.value[i] = (Math.random() * 20 - 2).toFixed(2)
}

// ✅ 总分计算
const totalScore = computed(() => {
  const valid = Object.values(localScoreMap)
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v))
  return valid.reduce((acc, cur) => acc + cur, 0).toFixed(2)
})

// ✅ 批量勾选处理
function handleToggleAllCheck(val) {
  checkAllStatus.value = val
  tableData.value.forEach(row => {
    row.isChecked = val ? 1 : 0
  })
}

function toggleCheck(row, val) {
  row.isChecked = val ? 1 : 0
}

function getRowStyle({ row }) {
  return {
    backgroundColor: row.isChecked === 1 ? '#f0fdf4' : '#fff0f0'
  }
}

const scoreDialog = ref({
  visible: false,
  targetId: null,
  input: ''
})

function openScoreEditor(row) {
  scoreDialog.value.visible = true
  scoreDialog.value.targetId = row.id
  scoreDialog.value.input = localScoreMap.value[row.id] ?? ''
}

function submitScore() {
  const raw = scoreDialog.value.input
  const val = parseFloat(raw)
  if (isNaN(val)) {
    ElMessage.error('请输入有效数字')
    return
  }
  localScoreMap.value[scoreDialog.value.targetId] = val.toFixed(2)
  scoreDialog.value.visible = false
}

function resetScoreInput() {
  scoreDialog.value = { visible: false, targetId: null, input: '' }
}

const remarkDialog = ref({
  visible: false,
  targetRow: null,
  input: ''
})

function openRemarkEditor(row) {
  remarkDialog.value.visible = true
  remarkDialog.value.targetRow = row
  remarkDialog.value.input = row.remark
}

function submitRemark() {
  remarkDialog.value.targetRow.remark = remarkDialog.value.input.trim()
  remarkDialog.value.visible = false
}

// ✅ 一键核查弹窗逻辑
const confirmDialog = ref({
  visible: false,
  success: false,
  items: []
})

function handleCheckAll() {
  const unchecked = tableData.value.filter(item => item.isChecked !== 1)
  const checked = tableData.value.filter(item => item.isChecked === 1)
  confirmDialog.value.success = unchecked.length === 0
  confirmDialog.value.items = confirmDialog.value.success ? checked : unchecked
  confirmDialog.value.visible = true
}

function confirmSuccess() {
  ElMessage.success('✅ 所有考核项已核查成功！')
  confirmDialog.value.visible = false
}

// ✅ PDF 导出逻辑
function handleConfirmExport() {
  const el = printArea.value
  if (!el) return

  html2pdf()
    .set({
      margin: 10,
      filename: `${currentMonth}_${deptName}_部门指标打分.pdf`,
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
}

// ✅ 打印用备注格式化
function formatRemark(text) {
  if (!text) return ''
  const maxPerLine = 18
  const result = []
  for (let i = 0; i < text.length; i += maxPerLine) {
    result.push(text.slice(i, i + maxPerLine))
  }
  return result.join('\n')
}
</script>

<style scoped>
.score-board-page {
  padding: 24px 0;
}

.page-title {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.alert-bar {
  margin-bottom: 16px;
}

/* ✅ 工具栏：复选框 + 按钮一排对齐 */
.table-toolbar {
  display: flex;
  justify-content: right;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
  flex-wrap: wrap;
}

.scrollable-table-wrapper {
  max-height: 480px;
  overflow-y: auto;
}

/* ✅ 页面下方总分展示 */
.summary-bar {
  margin-top: 12px;
  text-align: left;
  font-size: 15px;
  padding-right: 12px;
  color: #303133;
}
.summary-bar strong {
  font-size: 17px;
  color: #409EFF;
  margin-left: 4px;
}

/* ✅ 导出弹窗内容区域 */
.scroll-wrapper {
  max-height: 80vh;
  overflow-y: auto;
}

/* ✅ 打印区域容器 */
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

/* ✅ 打印表格样式 */
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

/* ✅ 打印页尾总分样式 */
.print-table tr:last-child {
  background-color: #f0f0f0;
  font-weight: bold;
}

/* ✅ 打印防断页 */
.print-table tr,
.print-table tbody {
  page-break-inside: avoid;
}
</style>