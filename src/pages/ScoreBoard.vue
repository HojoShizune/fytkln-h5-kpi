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

    <div class="table-toolbar">
      <el-button type="success" size="small" @click="handleCheckAll">⚡ 一键核查</el-button>
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

        <el-table-column label="本月得分" :min-width="140">
          <template #default="scope">
            <el-link type="primary" @click="openScoreEditor(scope.row)">
              {{ localScoreMap[scope.row.id] ?? '点击填写' }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="考核部门" prop="scoringDept" :min-width="140" />
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

    <el-dialog v-model="scoreDialog.visible" title="填写本月得分" width="320px" @close="resetScoreInput">
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
          <el-table-column
            v-if="confirmDialog.success"
            label="本月得分"
          >
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const deptName = '海州分公司'
const currentMonth = dayjs().format('YYYY年MM月')

const tableData = ref([])
const localScoreMap = ref({})
const departments = ['财务部', '客服部', '人事部', '市场部', '运营部', '产品部']

for (let i = 1; i <= 100; i++) {
  const isChecked = i % 3 === 0 ? 0 : 1
  const targetName = `考核项 ${i}`
  const scoringDept = departments[i % departments.length]
  const score = Math.floor(Math.random() * 20 + 5)
  const floating = Math.random() < 0.4 ? 2 : 5

  tableData.value.push({
    id: i,
    deptName,
    targetName,
    score,
    floating,
    scoringDept,
    isChecked,
    description: `这是关于 ${targetName} 的计算说明`,
    scoringMethod: `这是 ${targetName} 的评分标准`
  })

  localScoreMap.value[i] = (Math.random() * 20 - 2).toFixed(2)
}

function toggleCheck(row, val) {
  row.isChecked = val ? 1 : 0
}

function getRowStyle({ row }) {
  return {
    backgroundColor: row.isChecked === 1 ? '#f0fdf4' : '#fff0f0'
  }
}

function tooltipContent(row) {
  return `评分标准：${row.scoringMethod}\n计算公式：${row.description}`
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
  justify-content: flex-end;
  margin-bottom: 8px;
}
.scrollable-table-wrapper {
  max-height: 480px;
  overflow-y: auto;
}
</style>