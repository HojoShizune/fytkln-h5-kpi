<template>
  <div>
    <el-button type="primary" @click="openAddDialog">新增部门</el-button>

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
                <div
                  v-for="t in filteredTargets"
                  :key="t.id"
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
                  <span>{{ t.name }}</span>
                  <span v-if="form.targets.includes(String(t.id))" style="color: #4caf50;">✓</span>
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

const deptList = ref([])
const targetList = ref([])
const targetMap = ref({})
const searchText = ref('')
const popoverVisible = ref(false)

const form = ref({ deptName: '', targets: [] })
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentDeptId = ref(null)

const fetchTargets = async () => {
  const res = await getTargetList({ searchStr: '', pageNum: 1, pageSize: 9999 })
  const raw = res?.data?.items || []
  const filtered = raw.map(item => ({
    id: String(item.id),
    name: item.target
  }))
  targetList.value = filtered
  targetMap.value = Object.fromEntries(filtered.map(t => [t.id, t.name]))
}

const fetchDepts = async () => {
  const res = await getDeptList({ searchStr: '', pageNum: 1, pageSize: 9999 })
  deptList.value = res.data || []
}

// 解析伪 JSON 字符串
const parseTargets = (raw) => {
  if (!raw || typeof raw !== 'string') return []

  try {
    const jsonStr = raw
      .replace(/([{,])\s*(\w+)=/g, '$1"$2":') // name= ➝ "name":
      .replace(/:([^,{}]+)/g, (_, val) => {
        const v = val.trim()
        return isNaN(v) ? `:"${v}"` : `:${v}`
      })

    return JSON.parse(jsonStr).map(t => ({
      id: String(t.id),
      name: t.name
    }))
  } catch (err) {
    console.warn('❌ parseTargets 失败:', raw)
    return []
  }
}

const getTargetNames = (value) => {
  const list = parseTargets(value)
  return list.map(t => t.name).filter(Boolean)
}

const filteredTargets = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return targetList.value.filter(t =>
    t.name.toLowerCase().includes(keyword)
  )
})

const addTarget = (id) => {
  const strId = String(id)
  if (!form.value.targets.includes(strId)) {
    form.value.targets.push(strId)
    searchText.value = ''
  }
}

const openAddDialog = () => {
  isEdit.value = false
  form.value = { deptName: '', targets: [] }
  dialogVisible.value = true
  searchText.value = ''
}

const editDept = (dept) => {
  isEdit.value = true
  currentDeptId.value = dept.deptId
  form.value = {
    deptName: dept.deptName,
    targets: parseTargets(dept.targets).map(t => t.id)
  }
  dialogVisible.value = true
  searchText.value = ''
}

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

onMounted(async () => {
  await fetchTargets()
  await fetchDepts()
})
</script>

