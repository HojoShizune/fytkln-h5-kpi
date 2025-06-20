<template>
  <div class="survey-result-page">
    <!-- 问卷列表 已废弃 -->
    <!--<el-table :data="surveyList" border highlight-current-row @row-click="loadResult">
      <el-table-column prop="title" label="问卷标题" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column prop="status" label="状态" width="100" />
    </el-table>-->

    <!-- 问卷选择下拉列表 -->
    <el-select
      v-model="activeSurveyId"
      placeholder="请选择问卷"
      @change="onSurveySelect"
      style="width: 300px; margin-bottom: 16px;"
    >
      <el-option
        v-for="survey in surveyList"
        :key="survey.id"
        :label="survey.title"
        :value="survey.id"
      />
    </el-select>

    <!-- 当前问卷结果 -->
    <div v-if="resultList.length || activeSurvey" class="mt-6">
      <h3>问卷结果：《{{ activeSurvey?.title || '（未选择问卷）' }}》</h3>

      <!-- 汇总信息 -->
      <div style="margin: 12px 0;">
        <p>
          ✅ 已填写 <strong>{{ filledUsers.length }}</strong> 人 /
          共 <strong>{{ totalUsers.length }}</strong> 人
        </p>
        <p v-if="unfilledUsers.length" style="color: red;">
          ❗未填写用户：
          <span v-for="(name, i) in unfilledUsers" :key="i">
            {{ name }}<span v-if="i < unfilledUsers.length - 1">、</span>
          </span>
        </p>
      </div>

      <!-- 表格展示 -->
      <el-table :data="resultList" border style="margin-top: 12px;">
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column label="本月是否已填写" width="100">
          <template #default="{ row }">
            {{ row.answers && row.answers.length ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="总分" width="80" />
        <el-table-column
          v-for="(q, i) in questionList"
          :key="q.id"
          :label="q.title"
        >
          <template #default="{ row }">
            {{ row.answers?.[i] || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'


// 问卷列表
const surveyList = ref([
  { id: 'q1', title: '客服满意度调查', createdAt: '2024-06-01', status: '已结束' },
  { id: 'q2', title: '平台可用性调研', createdAt: '2024-06-05', status: '进行中' },
  { id: 'q3', title: '功能设计反馈', createdAt: '2024-06-10', status: '已结束' }
])

// 每份问卷数据，包括题目、结果、全体应答者
const mockResultMap = {
  q1: {
    allUsers: ['张三', '李四', '赵六'],
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
    allUsers: ['王五', '小明'],
    questions: [
      { id: 1, title: '平台是否稳定？' },
      { id: 2, title: '功能是否齐全？' }
    ],
    results: [
      { username: '王五', score: 91, answers: ['非常稳定', '比较齐全'] }
    ]
  },
  q3: {
    allUsers: ['小红'],
    questions: [
      { id: 1, title: '设计是否美观？' },
      { id: 2, title: '是否符合预期？' }
    ],
    results: [
      { username: '小红', score: 96, answers: ['很好看', '完全符合'] }
    ]
  }
}

// 状态变量
const activeSurveyId = ref(null)
const activeSurvey = ref(null)
const questionList = ref([])
const resultList = ref([])

// 选择问卷时触发
const onSurveySelect = (id) => {
  const survey = surveyList.value.find(s => s.id === id)
  if (!survey) return
  activeSurvey.value = survey
  loadResult(survey)
}

// 加载某份问卷结果
const loadResult = (row) => {
  const data = mockResultMap[row.id]
  if (!data) return

  activeSurvey.value = row
  questionList.value = data.questions

  // 构造结果：所有用户
  const filledMap = data.results.reduce((map, r) => {
    map[r.username] = r
    return map
  }, {})

  resultList.value = data.allUsers.map(name => {
    return filledMap[name] || { username: name, score: '-', answers: [] }
  })

  // ✅ 正确设置 answeredUsers
  answeredUsers.value = data.results.map(r => r.username)
}

/*const loadResult = row => {
  const data = mockResultMap[row.id]
  if (!data) return
  activeSurvey.value = row
  questionList.value = data.questions
  resultList.value = data.results
}*/

// 汇总字段
const answeredUsers = ref([])
const filledUsers = computed(() => answeredUsers.value)
const totalUsers = computed(() => mockResultMap[activeSurvey.value?.id]?.allUsers || [])
const unfilledUsers = computed(() =>
  totalUsers.value.filter(name => !filledUsers.value.includes(name))
)
</script>

<style scoped>
.mt-6 {
  margin-top: 24px;
}
</style>