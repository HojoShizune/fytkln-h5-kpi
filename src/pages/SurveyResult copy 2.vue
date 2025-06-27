<template>
  <div class="survey-result-page">
    <h2>问卷结果查询</h2>

    <div class="controls">
      <!-- 账期下拉 -->
      <el-select
        v-model="period"
        placeholder="请选择账期"
        @change="onPeriodChange"
        style="width: 120px;"
      >
        <el-option
          v-for="p in periodList"
          :key="p"
          :label="p"
          :value="p"
        />
      </el-select>

      <!-- 问卷下拉 -->
      <el-select
        v-model="activeSurveyId"
        placeholder="请选择问卷"
        @change="onSurveySelect"
        :disabled="!surveyList.length"
        style="width: 200px;"
      >
        <el-option
          v-for="s in surveyList"
          :key="s.id"
          :label="s.title"
          :value="s.id"
        />
      </el-select>
    </div>

    <!-- 结果展示 -->
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
            {{ user.username }}（{{ user.dept }}）
          </el-tag>
        </p>
      </div>

      <el-table
        :data="resultList"
        border
        style="width:100%; margin-top:16px;"
      >
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="dept" label="部门" width="120" />
        <el-table-column label="是否已填写" width="100">
          <template #default="{ row }">
            <el-tag :type="row.answers.length ? 'success' : 'warning'">
              {{ row.answers.length ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="总分" width="80" />
        <el-table-column
          v-for="(q, i) in questionList"
          :key="q.id"
          :label="q.title"
        >
          <template #default="{ row }">
            {{ row.answers[i] || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <div class="action-bar">
        <el-button type="primary" @click="computeScore">
          核算该问卷分数
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 虚拟数据：账期对应的问卷列表
const mockSurveyListByPeriod = {
  '2025-05': [
    { id: 'q1', title: '客服满意度调查' },
    { id: 'q2', title: '平台可用性调研' }
  ],
  '2025-06': [
    { id: 'q3', title: '功能设计反馈' }
  ]
}

// 虚拟数据：每份问卷的结果，包含用户及其部门
const mockResultMap = {
  q1: {
    allUsers: [
      { username: '张三', dept: '市场部' },
      { username: '李四', dept: '人事部' },
      { username: '赵六', dept: '财务部' }
    ],
    questions: [
      { id: 1, title: '服务是否满意？' },
      { id: 2, title: '是否会推荐我们？' }
    ],
    results: [
      { username: '张三', score: 88, answers: ['满意', '会'] },
      { username: '李四', score: 76, answers: ['一般', '不确定'] }
    ]
  },
  q2: {
    allUsers: [
      { username: '王五', dept: '技术部' },
      { username: '小明', dept: '运营部' }
    ],
    questions: [
      { id: 1, title: '平台是否稳定？' },
      { id: 2, title: '功能是否齐全？' }
    ],
    results: [
      { username: '王五', score: 91, answers: ['非常稳定', '比较齐全'] }
    ]
  },
  q3: {
    allUsers: [
      { username: '小红', dept: '设计部' }
    ],
    questions: [
      { id: 1, title: '设计是否美观？' },
      { id: 2, title: '是否符合预期？' }
    ],
    results: [
      { username: '小红', score: 96, answers: ['很好看', '完全符合'] }
    ]
  }
}

// 响应式状态
const period = ref(null)
const periodList = Object.keys(mockSurveyListByPeriod)
const surveyList = ref([])
const activeSurveyId = ref(null)
const activeSurvey = ref(null)
const questionList = ref([])
const resultList = ref([])
const answeredUsers = ref([])

// 计算属性
const totalUsersCount = computed(() =>
  (mockResultMap[activeSurvey.value?.id]?.allUsers || []).length
)
const filledUsers = computed(() => answeredUsers.value)
const unfilledUsers = computed(() => {
  const all = mockResultMap[activeSurvey.value?.id]?.allUsers || []
  return all.filter(u => !answeredUsers.value.includes(u.username))
})

// 选择账期
function onPeriodChange(val) {
  activeSurveyId.value = null
  activeSurvey.value = null
  questionList.value = []
  resultList.value = []
  answeredUsers.value = []
  surveyList.value = mockSurveyListByPeriod[val] || []
}

// 选择问卷
function onSurveySelect(id) {
  const survey = surveyList.value.find(s => s.id === id)
  if (!survey) return
  activeSurvey.value = survey

  const data = mockResultMap[id]
  if (!data) return

  questionList.value = data.questions

  // 构造结果行
  const resultMap = data.results.reduce((m, r) => {
    m[r.username] = r
    return m
  }, {})
  resultList.value = data.allUsers.map(user => {
    const r = resultMap[user.username]
    return {
      username: user.username,
      dept: user.dept,
      score: r?.score ?? '-',
      answers: r?.answers ?? []
    }
  })
  answeredUsers.value = data.results.map(r => r.username)
}

// 核算分数（模拟）
function computeScore() {
  if (!activeSurvey.value) return
  if (unfilledUsers.value.length) {
    return ElMessageBox.alert(
      `以下用户未填写，无法核算：\n${unfilledUsers.value
        .map(u => `${u.username}（${u.dept}）`)
        .join('、')}`,
      '提示'
    )
  }
  ElMessage.success('✅ 核算完成（模拟）')
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