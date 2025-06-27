<template>
  <el-dialog
    v-model="visible"
    :title="editMode ? '编辑问卷' : '新建问卷'"
    width="500px"
    @close="onClose"
  >
    <el-form :model="form" label-width="90px">
      <el-form-item label="问卷标题">
        <el-input
          v-model="form.title"
          placeholder="请输入问卷标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="所属部门">
        <el-select v-model="form.deptId" placeholder="请选择部门">
          <el-option
            v-for="d in deptList"
            :key="d.deptId"
            :label="d.deptName"
            :value="d.deptId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="考核项">
        <TargetSelector
          v-model="form.targetIds"
          :target-list="filteredTargetList"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <!-- 撤销按钮，仅编辑模式下可见 -->
      <el-button
        v-if="editMode"
        @click="resetAll"
      >
        撤销所有修改
      </el-button>

      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirm">
        {{ editMode ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import TargetSelector from './TargetSelector.vue'
import { getDeptList } from '../api/dept'
import { getTargetList, getTargetsByDept } from '../api/target'
import { addSurvey, updateSurvey } from '../api/survey'

// props & emits
const props = defineProps({
  modelValue: Boolean,
  editMode: { type: Boolean, default: false },
  defaultData: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'created', 'updated'])

// 表单可视 & 数据
const visible = ref(false)
const form = ref({ title: '', deptId: null, targetIds: [] })

// 存初始状态，用于撤销
const initialForm = ref({})

// 下拉数据
const deptList = ref([])
const targetList = ref([])
const allowedTargetIds = ref([])

// 筛选后供 TargetSelector 使用的列表
const filteredTargetList = computed(() => {
  return !form.value.deptId
    ? targetList.value
    : targetList.value.filter(t => allowedTargetIds.value.includes(t.id))
})

// 打开或关闭弹窗
watch(() => props.modelValue, val => {
  visible.value = val
  if (!val) return

  if (props.editMode && props.defaultData.id != null) {
    // 编辑模式：回填
    form.value = {
      title: props.defaultData.title,
      deptId: props.defaultData.deptId,
      targetIds: [ String(props.defaultData.targetId) ]
    }
    // 预加载该部门可选考核项
    loadAllowedTargetIds(props.defaultData.deptId)
  } else {
    // 新建模式：清空
    form.value = { title: '', deptId: null, targetIds: [] }
    allowedTargetIds.value = []
  }
  // 克隆一份初始表单，用作撤销
  initialForm.value = JSON.parse(JSON.stringify(form.value))
})

// 关闭时通知父组件
const onClose = () => {
  emit('update:modelValue', false)
}

// 加载部门和全量考核项
const loadOptions = async () => {
  try {
    const [dRes, tRes] = await Promise.all([
      getDeptList(),
      getTargetList({ searchStr:'', pageNum:1, pageSize:9999 })
    ])
    deptList.value = dRes.data || []
    targetList.value = (tRes.data?.items || []).map(i => ({
      ...i,
      id: String(i.id),
      name: i.target,
      score: i.score,
      floating: i.floating,
      deptName: i.deptName
    }))
  } catch (e) {
    console.error(e)
    ElMessage.error('加载部门或考核项失败')
  }
}

// 根据部门ID拉取该部门绑定的考核项对象，再提取ID
const loadAllowedTargetIds = async deptId => {
  if (!deptId) {
    allowedTargetIds.value = []
    return
  }
  try {
    const res = await getTargetsByDept({ deptId })
    allowedTargetIds.value = (res.data || []).map(x => String(x.id))
  } catch {
    allowedTargetIds.value = []
  }
}

// 部门切换时：清空已选考核项 + 重新拉取允许列表
watch(() => form.value.deptId, (newId, oldId) => {
  // 仅当用户手动变更部门，才清空 targetIds
  if (props.editMode && oldId != null && newId !== initialForm.value.deptId) {
    form.value.targetIds = []
  }
  loadAllowedTargetIds(newId)
})

onMounted(loadOptions)

// 撤销至最初状态
const resetAll = () => {
  form.value = JSON.parse(JSON.stringify(initialForm.value))
  // 重新加载 allowedTargetIds 以保证列表正确
  loadAllowedTargetIds(form.value.deptId)
}

// 提交新建或更新
const onConfirm = async () => {
  const { title, deptId, targetIds } = form.value
  if (!title.trim())    return ElMessage.warning('标题不能为空')
  if (!deptId)          return ElMessage.warning('请选择部门')
  if (!targetIds.length) return ElMessage.warning('请选择考核项')

  const payload = {
    title,
    deptId,
    targetId: Number(targetIds[0])
  }
  try {
    let res
    if (props.editMode && props.defaultData.id != null) {
      res = await updateSurvey({ id: props.defaultData.id, ...payload })
    } else {
      res = await addSurvey(payload)
    }
    if (res.code === 0) {
      ElMessage.success(props.editMode ? '更新成功' : '创建成功')
      emit(props.editMode ? 'updated' : 'created')
      visible.value = false
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('提交失败，请稍后重试')
  }
}
</script>