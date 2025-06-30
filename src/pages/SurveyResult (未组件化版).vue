<template>
  <div class="survey-result-page">
    <h2>问卷结果查询</h2>

    <div class="controls">
      <!-- 账期选择 -->
      <el-date-picker
        v-model="period"
        type="month"
        placeholder="请选择账期"
        format="YYYY-MM"
        value-format="YYYY-MM"
        @change="onPeriodChange"
        style="width: 180px;"
      />

      <!-- 问卷选择 -->
      <el-select
        v-model="activeSurveyId"
        placeholder="请选择问卷"
        @change="onSurveySelect"
        :disabled="!surveyList.length"
        style="width: 360px;"
      >
        <el-option
          v-for="s in surveyList"
          :key="s.id"
          :label="s.title"
          :value="s.id"
        />
      </el-select>

      <!-- 一键核算按钮 -->
      <el-button type="primary" @click="computeScore">
        一键核算
      </el-button>
    </div>

    <el-alert v-if="loading" title="加载中，请稍候…" type="info" show-icon style="margin-bottom: 16px;" />
    <el-alert v-if="error" :title="error" type="error" show-icon style="margin-bottom: 16px;" />

    <div v-if="activeSurvey" class="result-section">
      <h3>问卷：《{{ activeSurvey.title }}》</h3>

      <div class="summary">
        <p>
          ✅ 已填写 <strong>{{ filledUsers.length }}</strong> 人 /
          共 <strong>{{ totalUsersCount }}</strong> 人
        </p>
        <p v-if="unfilledUsers.length" class="unfilled">
          ❗ 未填写用户：
          <el-tag
            v-for="(user, i) in unfilledUsers"
            :key="i"
            type="danger"
            style="margin-right: 4px;"
          >
            {{ user.username }}（{{ user.deptName }}）
          </el-tag>
        </p>
      </div>

      <el-table :data="resultList" border style="width:100%; margin-top:16px;">
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="deptName" label="部门" width="160" />
        <el-table-column prop="avgScore" label="总分" width="80" />
        <el-table-column label="是否已填写" width="100">
          <template #default="{ row }">
            <el-tag :type="row.answers.length ? 'success' : 'warning'">
              {{ row.answers.length ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(q, i) in questionList"
          :key="q.title"
          :label="q.title"
        >
          <template #default="{ row }">
            {{ row.answers[i] || '-' }}
          </template>
        </el-table-column>
      </el-table>

      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { fetchSurveyRecords, getCurrentMonth, submitSurveyCheck } from '../api/record'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const period = ref(null)
const loading = ref(false)
const error = ref('')
const allRecords = ref([])
const activeSurveyId = ref(null)
const activeSurvey = ref(null)
const questionList = ref([])
const resultList = ref([])

// 监听账期变化
async function onPeriodChange(val) {
  if (!val) return

  const formattedPeriod = dayjs(val).format('YYYY-MM')
  console.log('转换后的账期:', formattedPeriod)
  period.value = formattedPeriod

  loading.value = true
  error.value = ''
  activeSurveyId.value = null
  activeSurvey.value = null
  questionList.value = []
  resultList.value = []

  try {
    const records = await fetchSurveyRecords(formattedPeriod)
    console.log('获取到的问卷数据:', records) // 打印数据，看看是不是数组！！！

    if (!Array.isArray(records)) {
      throw new Error('返回的数据不是数组！！！')
    }

    allRecords.value = records // 赋值给 allRecords
    console.log('更新后的 allRecords:', allRecords.value) // 确保数据正确赋值！！！

  } catch (err) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

// 生成问卷列表
const surveyList = computed(() => {
  if (!Array.isArray(allRecords.value) || allRecords.value.length === 0) {
    console.warn('⚠️ allRecords.value 为空！！！')
    return []
  }

  const map = {}
  allRecords.value.forEach((r) => {
    if (r.surveyId && r.surveyName) { // 确保 surveyId 和 surveyName 存在！！！
      map[r.surveyId] = { id: r.surveyId, title: r.surveyName }
    }
  })

  console.log('生成的 surveyList:', Object.values(map)) // 打印数据，看看是否正确！！！
  return Object.values(map)
})

// 监听 `allRecords` 变化，检查数据是否正确
watch(allRecords, (newRecords) => {
  console.log('更新后的 allRecords:', newRecords)
  console.log('生成的 surveyList:', surveyList.value)
})

// 选择问卷
function onSurveySelect(id) {
  activeSurvey.value = surveyList.value.find((s) => s.id === id)
  if (!activeSurvey.value) return

  const records = allRecords.value.filter((r) => r.surveyId === id)

  questionList.value = parseQuestions(records.find(r => r.questions !== null)?.questions)

  resultList.value = records.map((r) => ({
    username: r.userName,
    deptName: r.deptName,
    avgScore: r.avgScore ?? '-',
    answers: parseAnswers(r.questions)
  }))
}

// 解析题目
function parseQuestions(questions) {
  if (!questions) return [] // 如果是 null，返回空数组
  if (typeof questions === 'string') { // 如果是字符串，解析 JSON
    try {
      return JSON.parse(questions)
    } catch (error) {
      console.error('❌ 解析 questions 失败:', error)
      return [] // 解析失败，返回空数组
    }
  }
  return Array.isArray(questions) ? questions : [] // 确保最终是数组
}

// 解析答案
function parseAnswers(questions) {
  const parsedQuestions = parseQuestions(questions)
  return parsedQuestions.map(q => q.choice) // 只提取用户选择的答案
}

// 计算未填写用户
const totalUsersCount = computed(() => resultList.value.length)
const filledUsers = computed(() => resultList.value.filter((r) => r.answers.length))
const unfilledUsers = computed(() => {
  if (!activeSurvey.value) return [] // 如果没有选中问卷，返回空数组！！！

  return allRecords.value
    .filter((r) => r.surveyId === activeSurvey.value.id && r.questions === null) // 只筛选当前选中的问卷！！！
    .map((r) => ({ username: r.userName, deptName: r.deptName }))
})

//计算未填写用户(全部问卷)
const allUnfilledUsers = computed(() => {
  return allRecords.value
    .filter((r) => r.questions === null) // 筛选所有问卷的未填写人员
    .map((r) => ({ username: r.userName, deptName: r.deptName, surveyName: r.surveyName }))
})

// 核算分数（模拟）
async function computeScore() {
  if (allUnfilledUsers.value.length) {
    return ElMessageBox.alert(
      `以下用户未填写问卷，无法核算：\n${allUnfilledUsers.value.map(u => `${u.username}（${u.deptName}） - ${u.surveyName}`).join('\n')}`,
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
</script>

<style scoped>
.survey-result-page {
  padding: 24px;
}
.controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.result-section {
  margin-top: 24px;
}
.summary {
  margin-bottom: 12px;
}
.unfilled {
  color: #f56c6c;
}
.action-bar {
  text-align: right;
  margin-top: 16px;
}
</style>