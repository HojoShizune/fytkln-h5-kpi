<template>
  <el-dialog v-model="visible" title="新建问卷" width="500px" @close="handleClose">
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
            v-for="dept in deptList"
            :key="dept.deptId"
            :label="dept.deptName"
            :value="dept.deptId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="考核项">
        <TargetSelector
          v-model="form.targetIds"
          :target-list="targetList"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeptList } from '../api/dept'
import { getTargetList } from '../api/target'
import { addSurvey } from '../api/survey'

// 复用组件 ✅
import TargetSelector from './TargetSelector.vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'created'])

const visible = ref(false)
const form = ref({
  title: '',
  deptId: null,
  targetIds: []
})

const deptList = ref([])
const targetList = ref([])

watch(() => props.modelValue, val => {
  visible.value = val
  if (val) {
    form.value = {
      title: '',
      deptId: null,
      targetIds: []
    }
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const loadOptions = async () => {
  try {
    const [deptRes, targetRes] = await Promise.all([
      getDeptList(),
      getTargetList({ searchStr: '', pageNum: '1', pageSize: '9999' })
    ])
    deptList.value = deptRes.data || []

    // 🔧 映射出 name 字段供 TargetSelector 正确显示标题
    targetList.value = (targetRes.data?.items || []).map(item => ({
      ...item,
      id: String(item.id), 
      name: item.target
    }))

  } catch (err) {
    ElMessage.error('加载部门或考核项失败')
    console.error(err)
  }
}


onMounted(loadOptions)

const handleConfirm = async () => {
  const { title, deptId, targetIds } = form.value
  if (!title.trim()) {
    ElMessage.warning('问卷标题不能为空')
    return
  }
  if (!deptId) {
    ElMessage.warning('请选择所属部门')
    return
  }
  if (!targetIds.length) {
    ElMessage.warning('请至少选择一个考核项')
    return
  }

  try {
    const res = await addSurvey({
      title,
      deptId,
      targetId: Array.isArray(targetIds) ? Number(targetIds[0]) : Number(targetIds)
    })
    if (res?.code === 0) {
      ElMessage.success('问卷创建成功 ✅')
      emit('created')
    } else {
      ElMessage.error('问卷创建失败 ❌')
    }
  } catch (err) {
    console.error('❌ 创建失败:', err)
    ElMessage.error('创建失败，请稍后重试')
  } finally {
    visible.value = false
  }
}
</script>