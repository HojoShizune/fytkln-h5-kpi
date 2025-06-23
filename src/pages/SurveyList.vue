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
import { getSurveyList } from '../api/survey'

const router = useRouter()
const surveyList = ref([])

const loadSurveys = async () => {
  try {
    const res = await getSurveyList()
    surveyList.value = res.data || []
    sessionStorage.setItem('surveyList', JSON.stringify(surveyList.value))
  } catch (err) {
    console.error('❌ 加载问卷失败:', err)
  }
}

onMounted(() => {
  loadSurveys()
})

const goTo = (id) => {
  router.push(`/survey/${id}`)
}
</script>

<style scoped>
.survey-list {
  max-width: 900px;
  margin: auto;
  padding: 24px;
}
</style>