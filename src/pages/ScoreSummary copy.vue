<template>
  <div class="score-board-page">
    <div class="page-title">
      <h2>
        指标打分（{{ deptName }}，{{ currentMonth }}）
        <el-tooltip content="当前月份系统自动生成，无需填写" placement="right">
          <el-icon style="margin-left: 6px; color: #909399;"><Clock /></el-icon>
        </el-tooltip>
      </h2>
      <el-button type="info" plain size="small" @click="goBack">🔙 返回汇总页</el-button>
    </div>

    <el-alert
      type="info"
      show-icon
      class="alert-bar"
      :closable="false"
      title="✅ 绿色代表数据已核查；❗红色代表数据待核查。点击本月得分填写分值"
    />

    <div class="table-toolbar">
      <el-checkbox v-model="checkAllStatus" @change="handleToggleAllCheck">
        🔘 全部勾选为已核查
      </el-checkbox>
      <el-button type="success" size="small" @click="handleCheckAll">⚡ 一键核查</el-button>
      <el-button type="warning" size="small" @click="submitScoreDialog.visible = true">
        📬 提交得分和备注
      </el-button>
      <el-button type="primary" size="small" @click="exportDialogVisible = true">📄 导出 PDF</el-button>
    </div>

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

        <el-table-column label="初始得分" :min-width="130">
          <template #default="scope">
            <el-input-number
              :model-value="parseFloat(localScoreMap[getRowKey(scope.row, scope.$index)])"
              @update:model-value="val => localScoreMap[getRowKey(scope.row, scope.$index)] = val"
              :min="-999"
              :max="999"
              :step="0.1"
              :precision="2"
              size="small"
              class="score-input"
            />
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

    <div class="summary-bar">
      <span>总分：</span>
      <strong>{{ totalScore }}</strong>
    </div>

    <!-- ✅ 备注弹窗 -->
    <el-dialog v-model="remarkDialog.visible" title="填写备注" width="420px">
      <el-input type="textarea" rows="4" v-model="remarkDialog.input" placeholder="请输入备注内容" />
      <template #footer>
        <el-button @click="remarkDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitRemark">确认</el-button>
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
          <el-table-column v-if="confirmDialog.success" label="初始得分">
            <template #default="scope">
              {{ localScoreMap[getRowKey(scope.row, scope.$index)] ?? '-' }}
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

    <!-- ✅ 确认提交得分弹窗 -->
    <el-dialog
      v-model="submitScoreDialog.visible"
      title="确认提交得分"
      width="480px"
    >
      <p style="margin-bottom: 12px;">
        是否确认提交当前填写的所有初始得分和备注内容？
      </p>
      <template #footer>
        <el-button @click="submitScoreDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitModifiedScores">确认提交</el-button>
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
                <th>初始得分</th>
                <th>考核部门</th>
                <th>备注</th>
                <th>数据核查</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in tableData" :key="row.id ?? idx">
                <td>{{ row.targetName }}</td>
                <td>{{ row.score }}</td>
                <td>{{ row.floating }}</td>
                <td>{{ localScoreMap[getRowKey(row, idx)] ?? '-' }}</td>
                <td>{{ row.scoringDept }}</td>
                <td style="white-space: pre-wrap;">{{ formatRemark(row.remark) }}</td>
                <td>{{ row.isChecked === 1 ? '✅ 已核查' : '❗ 未核查' }}</td>
              </tr>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import html2pdf from 'html2pdf.js'
import { Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchAssessmentList, updateAssessmentCheck, updateAssessmentScore } from '../api/score'

const route = useRoute()
const router = useRouter()

const deptId = route.params.deptId
const deptName = ref('')
const currentMonth = dayjs().format('YYYY年MM月')

const submitScoreDialog = ref({ visible: false })
const tableData = ref([])
const localScoreMap = ref({})
const printArea = ref(null)
const exportDialogVisible = ref(false)
const checkAllStatus = ref(false)

// ✅ 每行唯一 key 生成器
const getRowKey = (row, index) => String(row.id ?? index)

onMounted(() => {
  if (deptId) loadAssessmentList(deptId)
})

async function loadAssessmentList(id) {
  try {
    const res = await fetchAssessmentList(id)
    const data = Array.isArray(res.data) ? res.data : []
    tableData.value = data

    if (data.length > 0) {
      deptName.value = data[0].deptName ?? '未知部门'
    }

    localScoreMap.value = {}
    data.forEach((row, idx) => {
      const key = getRowKey(row, idx)
      localScoreMap.value[key] =
        row.originScore !== undefined && row.originScore !== null
          ? parseFloat(row.originScore).toFixed(2)
          : ''
    })
  } catch (err) {
    console.error('❌ 获取打分项失败:', err)
    ElMessage.error('加载失败，请稍后再试')
  }
}

const totalScore = computed(() => {
  const values = Object.values(localScoreMap.value)
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v))
  return values.reduce((sum, v) => sum + v, 0).toFixed(2)
})

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

async function submitModifiedScores() {
  const payload = tableData.value.map((row, idx) => {
    const key = getRowKey(row, idx)
    return {
      deptId: row.deptId,
      targetId: row.targetId ?? row.id,
      originScore: parseFloat(localScoreMap.value[key]) || 0,
      remark: row.remark ?? ''
    }
  })

  try {
    await updateAssessmentScore(payload)
    ElMessage.success('✅ 初始得分已成功提交')
    submitScoreDialog.value.visible = false
  } catch (err) {
    console.error('❌ 初始得分提交失败:', err)
    ElMessage.error('提交失败，请稍后再试')
  }
}

async function confirmSuccess() {
  const payload = tableData.value.map(row => ({
    deptId: row.deptId,
    targetId: row.targetId ?? row.id,
    isChecked: row.isChecked
  }))

  try {
    await updateAssessmentCheck(payload)
    ElMessage.success('✅ 核查状态已成功提交')
    confirmDialog.value.visible = false
  } catch (err) {
    console.error('❌ 核查提交失败:', err)
    ElMessage.error('提交失败，请稍后重试')
  }
}


function handleConfirmExport() {
  const el = printArea.value
  if (!el) return

  html2pdf()
    .set({
      margin: 10,
      filename: `${currentMonth}_${deptName.value}_部门指标打分.pdf`,
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

function formatRemark(text) {
  if (!text) return ''
  const maxPerLine = 18
  const result = []
  for (let i = 0; i < text.length; i += maxPerLine) {
    result.push(text.slice(i, i + maxPerLine))
  }
  return result.join('\n')
}

function goBack() {
  router.push({ path: '/scoring/score-board' })
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

/* ✅ 紧凑得分输入框 */
.score-input {
  width: 90px;
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

.print-table tr:last-child {
  background-color: #f0f0f0;
  font-weight: bold;
}

.print-table tr,
.print-table tbody {
  page-break-inside: avoid;
}
</style>