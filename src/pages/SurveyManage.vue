<template>
  <el-card>
    <!-- 顶部：搜索框 + 新建按钮 -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <el-input
        v-model="searchText"
        placeholder="输入问卷标题搜索"
        clearable
        style="width: 240px"
      />
      <el-button type="primary" @click="showCreateDialog = true">+ 新建问卷</el-button>
    </div>

    <!-- 问卷表格 -->
    <el-table :data="paginatedSurveyList" border style="width: 100%">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="name" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="viewSurvey(row)">查看</el-button>
          <el-button size="small" type="primary" @click="editSurvey(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteSurvey(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="filteredSurveyList.length"
      v-model:current-page="currentPage"
      style="margin-top: 16px; text-align: right"
    />
  </el-card>

  <CreateSurveyDialog
    v-model="showCreateDialog"
    @created="loadSurveys"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getSurveyList } from '../api/survey'
import { deleteSurvey as deleteSurveyApi } from '../api/survey'
import CreateSurveyDialog from '../components/CreateSurveyDialog.vue'

const showCreateDialog = ref(false)
const router = useRouter()
const surveyList = ref([])
const searchText = ref('')

const currentPage = ref(1)
const pageSize = 5

const loadSurveys = async () => {
  try {
    const res = await getSurveyList()
    console.log('✅ 后端返回数据:', res.data)
    surveyList.value = res.data || []
    // ✅ 保存列表到 sessionStorage，用于编辑页自动填充标题等
    sessionStorage.setItem('surveyList', JSON.stringify(res.data))
  } catch (err) {
    ElMessage.error('加载问卷失败')
    console.error('❌ 获取问卷失败:', err)
  }
}


onMounted(() => {
  loadSurveys()
})

// 模糊搜索过滤
const filteredSurveyList = computed(() =>
  surveyList.value.filter(item =>
    item.title.toLowerCase().includes(searchText.value.trim().toLowerCase())
  )
)

// 分页
const paginatedSurveyList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSurveyList.value.slice(start, start + pageSize)
})

// 新建问卷跳转
const goCreateSurvey = () => {
  router.push('/manage/design')
}

// 操作按钮
const viewSurvey = (survey) => {
  ElMessage.info(`查看问卷《${survey.title}》（功能预留）`)
}
const editSurvey = (survey) => {
  router.push({ path: '/manage/design', query: { id: survey.id } })
}
const deleteSurvey = (survey) => {
  ElMessageBox.confirm(`是否确认删除问卷《${survey.title}》？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteSurveyApi(survey.id)
      surveyList.value = surveyList.value.filter(s => s.id !== survey.id)
      ElMessage.success('问卷已删除 ✅')
    } catch (err) {
      console.error('❌ 删除失败:', err)
      ElMessage.error('删除已失败，请稍后重试')
    }
  })
}
</script>