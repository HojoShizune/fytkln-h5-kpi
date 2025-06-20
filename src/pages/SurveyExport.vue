<template>
  <div class="survey-export">
    <el-form :inline="true" :model="filters" class="mb-4">
      <el-form-item label="时间段">
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          unlink-panels
        />
      </el-form-item>
    </el-form>

    <el-table
      ref="tableRef"
      :data="surveyList"
      border
      :row-key="row => row.id"
      :select-on-indeterminate="false"
      @selection-change="handleSelection"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="问卷标题" />
      <el-table-column prop="lastSubmittedAt" label="最新提交时间" width="180" />
    </el-table>

    <el-button
      class="mt-4"
      type="success"
      icon="Download"
      :disabled="!selectedSurvey || loading"
      :loading="loading"
      @click="exportSingle"
    >
      {{ loading ? '正在导出...' : '导出选中问卷结果' }}
    </el-button>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const tableRef = ref()
const filters = reactive({ dateRange: [] })
const selectedSurvey = ref(null)
const loading = ref(false)

// 模拟数据
const surveyList = ref([
  { id: 'q1', title: '客服满意度调查', lastSubmittedAt: '2024-06-25 18:30' },
  { id: 'q2', title: '平台可用性调研', lastSubmittedAt: '2024-06-26 12:10' },
  { id: 'q3', title: '功能使用反馈', lastSubmittedAt: '2024-06-27 09:45' }
])

const fakeResultMap = {
  q1: {
    questions: [
      { id: 1, title: '服务是否满意？' },
      { id: 2, title: '是否愿意再次使用？' }
    ],
    results: [
      { username: '张三', score: 85, answers: ['满意', '是'] },
      { username: '李四', score: 72, answers: ['一般', '不确定'] }
    ]
  },
  q2: {
    questions: [
      { id: 1, title: '平台是否流畅？' },
      { id: 2, title: '操作是否简洁？' }
    ],
    results: [
      { username: '王五', score: 90, answers: ['很流畅', '非常简洁'] }
    ]
  },
  q3: {
    questions: [
      { id: 1, title: '常用功能是？' },
      { id: 2, title: '改进建议？' }
    ],
    results: [
      { username: '小红', score: 95, answers: ['搜索', '暂无'] }
    ]
  }
}

const handleSelection = (rows) => {
  if (rows.length > 1) {
    const last = rows.at(-1)
    selectedSurvey.value = last
    nextTick(() => {
      surveyList.value.forEach(row => {
        tableRef.value.toggleRowSelection(row, row === last)
      })
    })
  } else {
    selectedSurvey.value = rows[0] || null
  }
}

const exportSingle = async () => {
  const survey = selectedSurvey.value
  const [start, end] = filters.dateRange || []
  const dateText = start && end
    ? `\n时间范围：${start} ～ ${end}`
    : '\n时间范围：全部记录'

  try {
    await ElMessageBox.confirm(
      `确定要导出以下问卷结果吗？\n\n问卷：《${survey.title}》${dateText}`,
      '确认导出',
      {
        confirmButtonText: '导出',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  loading.value = true
  try {
    const { questions, results } = fakeResultMap[survey.id] || {}

    const sheetData = results.map(r => {
      const row = { 用户: r.username, 总分: r.score }
      questions.forEach((q, i) => {
        row[q.title] = r.answers?.[i] || '-'
      })
      return row
    })

    const ws = XLSX.utils.json_to_sheet(sheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, survey.title.slice(0, 30))
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buffer]), `${survey.title}.xlsx`)
  } catch (err) {
    console.error('导出失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
</style>