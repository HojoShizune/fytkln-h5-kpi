<template>
  <el-card>
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchText"
        placeholder="输入问卷标题搜索"
        clearable
        style="width: 240px"
      />
      <el-button type="primary" @click="showCreate = true">
        + 新建问卷
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="paginatedList" border style="width:100%">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="deptName" label="部门" width="180" />
      <el-table-column prop="targetName" label="考核项" width="200" />

      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <!--点“查看”弹出信息编辑弹窗 -->
          <el-button
            size="small"
            type="info"
            @click="openInfoDialog(row)"
          >
            查看
          </el-button>

          <!-- 原“编辑”按钮：跳转到设计页 -->
          <el-button
            size="small"
            type="primary"
            @click="editSurvey(row)"
          >
            编辑
          </el-button>

          <el-button
            size="small"
            type="danger"
            @click="onDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="filteredList.length"
      v-model:current-page="currentPage"
      class="pager"
    />

    <!-- 弹窗：新建 -->
    <CreateSurveyDialog
      v-model="showCreate"
      @created="reload"
    />

    <!-- 弹窗：查看/编辑问卷信息 -->
    <CreateSurveyDialog
      v-model="showInfo"
      :edit-mode="true"
      :default-data="infoData"
      @updated="reload"
    />
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  getSurveyList,
  deleteSurvey as apiDelete
} from '../api/survey'
import CreateSurveyDialog from '../components/CreateSingleSurveyDialog.vue'

const router     = useRouter()
const showCreate = ref(false)
const showInfo   = ref(false)
const infoData   = ref({})      // 用来回填“查看”弹窗

const list       = ref([])
const searchText = ref('')
const currentPage= ref(1)
const pageSize   = 10

// 拉取列表
const reload = async () => {
  try {
    const res = await getSurveyList()
    list.value = res.data || []
  } catch {
    ElMessage.error('加载问卷失败')
  }
}
onMounted(reload)

// 过滤 & 分页
const filteredList  = computed(() =>
  list.value.filter(i =>
    i.title.toLowerCase().includes(searchText.value.trim().toLowerCase())
  )
)
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

// 打开“查看”弹窗（编辑问卷信息）
const openInfoDialog = (row) => {
  infoData.value = {
    id:       row.id,
    title:    row.title,
    deptId:   row.deptId,
    targetId: row.targetId
  }
  showInfo.value = true
}

// 原来的“编辑”按钮——跳转到设计页
const editSurvey = (row) => {
  router.push({ path: '/admin/questionnaire/design', query: { id: row.id } })
}

// 删除
const onDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除《${row.title}》？`,
    '提示',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  ).then(async () => {
    try {
      await apiDelete(row.id)
      list.value = list.value.filter(i => i.id !== row.id)
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
    }
  })
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pager {
  margin-top: 16px;
  text-align: right;
}
</style>