<template>
  <div class="survey-result-page">
    <h2>问卷结果查询</h2>

    <SurveyToolbar
      :period="period"
      :survey-list="surveyList"
      :active-survey-id="activeSurveyId"
      :loading="loading"
      @update:period="onPeriodChange"
      @update:activeSurveyId="onSurveySelect"
      @compute="computeScore"
    />

    <el-button
      type="success"
      icon="Download"
      :disabled="!activeSurvey || !period || loading"
     :loading="loading"
      style="margin-bottom: 16px;"
      @click="exportSurvey"
    >
      导出问卷
    </el-button>

    <el-alert
      v-if="loading"
      title="加载中，请稍候…"
      type="info"
      show-icon
      style="margin-bottom: 16px;"
    />
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      style="margin-bottom: 16px;"
    />

    <div v-if="activeSurvey" class="result-section">
      <h3>问卷：《{{ activeSurvey.title }}》</h3>

      <div class="summary">
        <p>
          ✅ 已填写 <strong>{{ filledUsers.length }}</strong> 人 /
          共 <strong>{{ totalUsersCount }}</strong> 人
        </p>
        <UnfilledUsersTag
          v-if="unfilledUsers.length"
          :users="unfilledUsers"
        />
      </div>

      <SurveyResultTable
        :result-list="resultList"
        :question-list="questionList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { fetchSurveyRecords, getCurrentMonth, submitSurveyCheck, exportSurveyExcel } from '../api/record'
import { parseQuestions, parseAnswers } from '../utils/survey-helpers'
import SurveyToolbar from '../components/SurveyToolbar.vue'
import SurveyResultTable from '../components/SurveyResultTable.vue'
import UnfilledUsersTag from '../components/UnfilledUsersTag.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveAs } from 'file-saver'

const period = ref(null)
const loading = ref(false)
const error = ref('')
const allRecords = ref([])
const activeSurveyId = ref(null)
const activeSurvey = ref(null)
const questionList = ref([])
const resultList = ref([])

async function onPeriodChange(val) {
  if (!val) return
  const formattedPeriod = dayjs(val).format('YYYY-MM')
  period.value = formattedPeriod

  loading.value = true
  error.value = ''
  activeSurveyId.value = null
  activeSurvey.value = null
  questionList.value = []
  resultList.value = []

  try {
    const records = await fetchSurveyRecords(formattedPeriod)
    if (!Array.isArray(records)) throw new Error('返回的数据不是数组！！！')
    allRecords.value = records
  } catch (err) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const surveyList = computed(() => {
  const map = {}
  allRecords.value.forEach(r => {
    if (r.surveyId && r.surveyName) {
      map[r.surveyId] = { id: r.surveyId, title: r.surveyName }
    }
  })
  return Object.values(map)
})

function onSurveySelect(id) {
  activeSurvey.value = surveyList.value.find(s => s.id === id)
  if (!activeSurvey.value) return

  const records = allRecords.value.filter(r => r.surveyId === id)
  questionList.value = parseQuestions(records.find(r => r.questions)?.questions)
  resultList.value = records.map(r => ({
    username: r.userName,
    deptName: r.deptName,
    avgScore: r.avgScore ?? '-',
    answers: parseAnswers(r.questions)
  }))
}

const totalUsersCount = computed(() => resultList.value.length)
const filledUsers = computed(() => resultList.value.filter(r => r.answers.length))
const unfilledUsers = computed(() => {
  if (!activeSurvey.value) return []
  return allRecords.value
    .filter(r => r.surveyId === activeSurvey.value.id && r.questions === null)
    .map(r => ({ username: r.userName, deptName: r.deptName }))
})

const allUnfilledUsers = computed(() =>
  allRecords.value
    .filter(r => r.questions === null)
    .map(r => ({
      username: r.userName,
      deptName: r.deptName,
      surveyName: r.surveyName
    }))
)

async function computeScore() {
  if (allUnfilledUsers.value.length) {
    return ElMessageBox.alert(
      `以下用户未填写问卷，无法核算：\n${allUnfilledUsers.value.map(
        u => `${u.username}（${u.deptName}） - ${u.surveyName}`
      ).join('\n')}`,
      '提示'
    )
  }

  try {
    loading.value = true
    const res = await submitSurveyCheck()
    if (res.code === 0) {
      ElMessage.success('✅ 核算成功！')
    } else {
      ElMessage.error(res.message || '❌ 核算失败，请稍后再试')
    }
  } catch (err) {
    ElMessage.error('❌ 核算请求异常，请检查网络或联系管理员')
  } finally {
    loading.value = false
  }
}

const exportSurvey = async () => {
  if (!period.value || !activeSurvey.value) {
    return ElMessage.warning('请先选择账期和问卷')
  }

  try {
    loading.value = true

    const params = {
      date: period.value,
      surveyId: Number(activeSurvey.value.id)
    }

    console.log('📤 导出请求参数:', params)

    const res = await exportSurveyExcel(params)

    console.log('📥 完整响应对象:', res)
    console.log('📦 响应类型:', Object.prototype.toString.call(res.data))
    console.log('📏 响应 Blob size (bytes):', res.data.size || '(无 size)')

    // 👉 可选：尝试先用浏览器打开文件验证是否能打开
    const debugUrl = window.URL.createObjectURL(res.data)
    console.log('🧪 临时预览链接:', debugUrl)
    window.open(debugUrl)

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const fileName = `${activeSurvey.value.title}_${period.value}.xlsx`
    saveAs(blob, fileName)

    ElMessage.success('🎉 导出成功！')
  } catch (err) {
    console.error('❌ 导出失败:', err)
    ElMessage.error('导出失败，请稍后再试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.survey-result-page {
  padding: 24px;
}
.result-section {
  margin-top: 24px;
}
.summary {
  margin-bottom: 12px;
}
</style>