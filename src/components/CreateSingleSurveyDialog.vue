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

      <el-form-item label="打分部门">
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
          v-model="form.targetId"
          :target-list="filteredTargetList"
        />
      </el-form-item>
    </el-form>

    <template #footer>
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
import TargetSelector from './SingleTargetSelector.vue'
import { getDeptList } from '../api/dept'
import { getTargetList, getTargetsByDept } from '../api/target'
import { addSurvey, updateSurvey } from '../api/survey'

const props = defineProps({
  modelValue: Boolean,
  editMode: { type: Boolean, default: false },
  defaultData: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'created', 'updated'])

const visible = ref(false)
const form = ref({ title: '', deptId: null, targetId: '' })
const initialForm = ref({})

const deptList = ref([])
const targetList = ref([])
const allowedTargetIds = ref([])

const filteredTargetList = computed(() => {
  return !form.value.deptId
    ? targetList.value
    : targetList.value.filter(t => allowedTargetIds.value.includes(t.id))
})

// 打开弹窗时初始化表单
watch(() => props.modelValue, val => {
  visible.value = val
  if (!val) return

  if (props.editMode && props.defaultData.id != null) {
    form.value = {
      title: props.defaultData.title,
      deptId: props.defaultData.deptId,
      targetId: String(props.defaultData.targetId)
    }
    loadAllowedTargetIds(props.defaultData.deptId)
  } else {
    form.value = { title: '', deptId: null, targetId: '' }
    allowedTargetIds.value = []
  }
  initialForm.value = JSON.parse(JSON.stringify(form.value))
})

const onClose = () => {
  emit('update:modelValue', false)
}

const loadOptions = async () => {
  try {
    const [dRes, tRes] = await Promise.all([
      getDeptList(),
      getTargetList({ searchStr: '', pageNum: 1, pageSize: 9999 })
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
  } catch {
    ElMessage.error('加载部门或考核项失败')
  }
}

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

watch(() => form.value.deptId, (newId, oldId) => {
  if (props.editMode && oldId != null && newId !== initialForm.value.deptId) {
    form.value.targetId = ''
  }
  loadAllowedTargetIds(newId)
})

onMounted(loadOptions)

const resetAll = () => {
  form.value = JSON.parse(JSON.stringify(initialForm.value))
  loadAllowedTargetIds(form.value.deptId)
}

const onConfirm = async () => {
  const { title, deptId, targetId } = form.value
  if (!title.trim()) return ElMessage.warning('标题不能为空')
  if (!deptId) return ElMessage.warning('请选择部门')
  if (!targetId) return ElMessage.warning('请选择考核项')

  const payload = {
    title,
    deptId,
    targetId: Number(targetId)
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
  } catch {
    ElMessage.error('提交失败，请稍后重试')
  }
}
</script>
