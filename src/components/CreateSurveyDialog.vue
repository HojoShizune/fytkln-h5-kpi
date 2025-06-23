<template>
  <el-dialog v-model="visible" title="新建问卷" width="400px" @close="handleClose">
    <el-input
      v-model="title"
      placeholder="请输入问卷标题"
      maxlength="100"
      show-word-limit
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addSurvey } from '../api/survey'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'created'])

const visible = ref(false)
const title = ref('')

watch(() => props.modelValue, val => {
  visible.value = val
  if (val) title.value = ''
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  if (!title.value.trim()) {
    ElMessage.warning('问卷标题不能为空')
    return
  }

  try {
    const res = await addSurvey({ title: title.value })
    if (res?.code === 0) {
      ElMessage.success('问卷创建成功 ✅')
      emit('created') // 通知父组件刷新列表
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