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
import { useRouter } from 'vue-router'
const router = useRouter()

const surveyList = [
  { id: 'gwy2025', title: '2025 年工会工作满意度调查问卷', createdAt: '2025-06-01' },
  { id: 'culture', title: '企业文化满意度调研', createdAt: '2025-06-15' },
  { id: 'wellness', title: '职工关怀计划反馈', createdAt: '2025-06-20' }
]

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