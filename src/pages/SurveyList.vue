<template>
  <div class="survey-list">
    <h2>可填写的问卷列表</h2>
    <el-table :data="surveyList" border style="margin-top: 16px;">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="goTo(row.id)">填写</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSurveyList, getSurveyToFillIds } from '../api/survey'
import { getUserFilledSurveys } from '../api/record'
import { ElMessage } from 'element-plus'

const router = useRouter()
const surveyList = ref([])
const filledSurveyIds = ref([])
const fillableSurveyIds = ref([]) // 当前用户允许填写的问卷ID列表

const loadFillableIds = async () => {
  try {
    const res = await getSurveyToFillIds()
    fillableSurveyIds.value = res.data || []
    console.log('✅ 可填写问卷ID:', fillableSurveyIds.value)
  } catch (err) {
    console.error('❌ 获取可填写问卷ID失败:', err)
    ElMessage.error('无法获取您可填写的问卷列表')
  }
}

const loadSurveys = async () => {
  try {
    const res = await getSurveyList()
    const rawList = res.data || []

    // ✅ 仅保留当前用户允许填写的问卷
    const filtered = rawList.filter(item =>
      fillableSurveyIds.value.includes(item.id)
    )

    surveyList.value = filtered
    sessionStorage.setItem('surveyList', JSON.stringify(filtered))
  } catch (err) {
    console.error('❌ 加载问卷失败:', err)
    ElMessage.error('获取问卷列表失败')
  }
}

onMounted(async () => {
  await loadFillableIds()
  await loadSurveys()
  await loadFilledSurveys()
})

const loadFilledSurveys = async () => {
  const res = await getUserFilledSurveys()
  const filled = Array.isArray(res) ? res.filter(r => r.surveyId !== null) : []
  filledSurveyIds.value = filled.map(r => r.surveyId)
  console.log('✅ 已填写问卷ID列表:', filledSurveyIds.value)
}

const goTo = (surveyId) => {
  if (filledSurveyIds.value.includes(surveyId)) {
    ElMessage.info('您本月已填写过该问卷')
    return
  }
  router.push(`/survey/${surveyId}`)
}
</script>

<style scoped>
.survey-list {
  max-width: 900px;
  margin: auto;
  padding: 24px;
}
</style>