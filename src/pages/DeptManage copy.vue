<template>
  <div>
    <el-button type="primary" @click="openAddDialog">新增部门</el-button>
    <div v-loading="loading">
      <el-table :data="deptList" border style="margin-top: 20px">
        <el-table-column prop="deptName" label="部门名称" />
        <el-table-column label="考核项">
          <template #default="{ row }">
            <el-tooltip
              effect="dark"
              placement="top-start"
              :content="getTargetNames(row.targets).join('，')"
            >
              <span>
                {{
                  getTargetNames(row.targets).slice(0, 3).join('，') +
                  (getTargetNames(row.targets).length > 3 ? '…' : '')
                }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="editDept(row)">编辑</el-button>
            <el-button type="text" @click="deleteDepts(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑部门' : '新增部门'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="form.deptName" />
        </el-form-item>

        <el-form-item label="考核项">
          <div style="margin-bottom: 6px; color: #888; font-size: 13px;">
            可点击下方按钮选择考核项
          </div>

          <el-popover
            placement="bottom-start"
            :width="400"
            trigger="click"
            v-model:visible="popoverVisible"
          >
            <template #reference>
              <el-button plain style="margin-bottom: 8px;">选择考核项</el-button>
            </template>

            <div>
              <el-input
                v-model="searchText"
                placeholder="搜索考核项"
                clearable
                size="small"
                style="margin-bottom: 8px;"
              />

              <div style="max-height: 250px; overflow-y: auto;">
                <div v-for="t in filteredTargets" :key="t.id">
                  <el-tooltip placement="top" effect="dark" :show-after="200">
                    <template #content>
                      <div style="max-width: 300px; white-space: normal;">
                        <div><strong>计算公式：</strong>{{ t.description || '—' }}</div>
                        <div style="margin-top: 4px;"><strong>评分标准：</strong>{{ t.scoringMethod || '—' }}</div>
                      </div>
                    </template>

                    <div
                      @click="addTarget(t.id)"
                      :style="{
                        padding: '6px 10px',
                        cursor: form.targets.includes(String(t.id)) ? 'default' : 'pointer',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        background: form.targets.includes(String(t.id)) ? '#e0e0e0' : '#f7f8fa',
                        color: form.targets.includes(String(t.id)) ? '#888' : '#333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pointerEvents: form.targets.includes(String(t.id)) ? 'none' : 'auto'
                      }"
                    >
                      <div style="flex: 1;">
                        {{ t.name }}（{{ t.score ?? 0 }}分｜浮动{{ t.floating ?? 0 }}｜{{ t.deptName || '—' }}）
                      </div>
                      <div v-if="form.targets.includes(String(t.id))" style="color: #4caf50;">✓</div>
                    </div>
                  </el-tooltip>
                </div>
              </div>

              <el-button
                type="text"
                size="small"
                style="margin-top: 8px; float: right;"
                @click="popoverVisible = false"
              >
                关闭
              </el-button>
            </div>
          </el-popover>

          <div style="margin-top: 12px;">
            <span style="font-weight: bold; color: #666;">已选考核项：</span>
            <el-tag
              v-for="(id, index) in form.targets"
              :key="id"
              size="small"
              closable
              style="margin: 4px 6px 0 0;"
              @close="form.targets.splice(index, 1)"
            >
              {{ targetMap[id] || `#${id}` }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item v-if="isEdit">
              <el-button
                type="warning"
                plain
                @click="resetForm"
                icon="el-icon-refresh"
             >撤销所有修改
              </el-button>
            </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDeptList, addDept, updateDept, deleteDept } from '../api/dept'
import { getTargetList } from '../api/target'

/* --------------------------------------------
🌟 状态变量定义
-------------------------------------------- */
const loading = ref(false)                // 表格加载中
const deptList = ref([])                  // 部门数据列表
const targetList = ref([])                // 所有可选考核项列表
const targetMap = ref({})                 // 目标项 id ➝ name 映射
const searchText = ref('')                // 搜索关键词
const popoverVisible = ref(false)         // 下拉选择器显隐
const originalForm = ref(null)            // 编辑时原始数据备份

const form = ref({                        // 表单数据（新增/编辑）
  deptName: '',
  targets: []
})

const dialogVisible = ref(false)          // 弹窗显隐
const isEdit = ref(false)                 // 是否编辑模式
const currentDeptId = ref(null)           // 当前编辑的部门 ID

/* --------------------------------------------
📦 异步数据请求：考核项 + 部门列表
-------------------------------------------- */
const fetchTargets = async () => {
  const res = await getTargetList({ searchStr: '', pageNum: 1, pageSize: 9999 })
  const raw = res?.data?.items || []
  const filtered = raw.map(item => ({
    id: String(item.id),
    name: item.target,
    score: item.score,
    floating: item.floating,
    deptName: item.deptName,
    description: item.description,
    scoringMethod: item.scoringMethod
  }))
  targetList.value = filtered
  targetMap.value = Object.fromEntries(filtered.map(t => [t.id, t.name]))
}

const fetchDepts = async () => {
  loading.value = true
  try {
    const res = await getDeptList({ searchStr: '', pageNum: 1, pageSize: 9999 })
    deptList.value = res.data || []
  } catch (err) {
    console.error('❌ 获取部门失败:', err)
    ElMessage.error('加载部门数据失败')
  } finally {
    loading.value = false
  }
}

/* --------------------------------------------
🎯 搜索过滤逻辑（模糊匹配 name / deptName / 分数 / 浮动）
-------------------------------------------- */
const filteredTargets = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return targetList.value

  return targetList.value.filter(t => {
    const scoreStr = t.score != null ? `${t.score}分` : ''
    const floatStr = t.floating != null ? `浮动${t.floating}` : ''
    const fields = [t.name, t.deptName, scoreStr, floatStr]
    return fields.some(f =>
      f?.toLowerCase().includes(keyword)
    )
  })
})

/* --------------------------------------------
✨ 工具函数
-------------------------------------------- */

// 解析后台伪 JSON 字符串，返回 [{ id, name }]
const parseTargets = (raw) => {
  if (!raw || typeof raw !== 'string') return []
  try {
    const jsonStr = raw
      .replace(/([{,])\s*(\w+)=/g, '$1"$2":')
      .replace(/:([^,{}]+)/g, (_, val) => {
        const v = val.trim()
        return isNaN(v) ? `:"${v}"` : `:${v}`
      })
    return JSON.parse(jsonStr).map(t => ({ id: String(t.id), name: t.name }))
  } catch (err) {
    console.warn('❌ parseTargets 失败:', raw)
    return []
  }
}

// 获取考核项名称列表（用于表格 tooltip 展示）
const getTargetNames = (value) => {
  const list = parseTargets(value)
  return list.map(t => t.name).filter(Boolean)
}

/* --------------------------------------------
🧩 表单行为逻辑
-------------------------------------------- */

// 新增按钮点击，打开弹窗
const openAddDialog = () => {
  isEdit.value = false
  form.value = { deptName: '', targets: [] }
  dialogVisible.value = true
  searchText.value = ''
}

// 编辑按钮点击，载入数据并备份原始
const editDept = (dept) => {
  isEdit.value = true
  currentDeptId.value = dept.deptId
  const parsedTargets = parseTargets(dept.targets).map(t => t.id)
  form.value = {
    deptName: dept.deptName,
    targets: parsedTargets
  }
  originalForm.value = JSON.parse(JSON.stringify(form.value)) // 备份
  dialogVisible.value = true
  searchText.value = ''
}

// 表单提交（新增 or 更新）
const onSubmit = async () => {
  const payload = {
    deptName: form.value.deptName,
    targets: JSON.stringify(form.value.targets.map(Number))
  }

  try {
    if (isEdit.value) {
      await updateDept({ deptId: currentDeptId.value, ...payload })
      ElMessage.success('更新成功')
    } else {
      await addDept(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchDepts()
  } catch (err) {
    console.error('❌ 提交失败:', err)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 删除部门
const deleteDepts = async (dept) => {
  try {
    await ElMessageBox.confirm(`确认删除部门【${dept.deptName}】吗？`, '警告', { type: 'warning' })
    await deleteDept(dept.deptId)
    ElMessage.success('已删除')
    fetchDepts()
  } catch (err) {
    console.error('❌ 删除失败:', err)
    ElMessage.error('删除失败，请稍后重试')
  }
}

// 撤销所有修改（还原初始表单数据）
const resetForm = () => {
  if (originalForm.value) {
    form.value = JSON.parse(JSON.stringify(originalForm.value))
    ElMessage.info('已恢复至修改前状态')
  }
}

// 添加目标项（点击选项）
const addTarget = (id) => {
  const strId = String(id)
  if (!form.value.targets.includes(strId)) {
    form.value.targets.push(strId)
    searchText.value = ''
  }
}

/* --------------------------------------------
📦 挂载后初始化
-------------------------------------------- */
onMounted(async () => {
  await fetchTargets()
  await fetchDepts()
})
</script>

