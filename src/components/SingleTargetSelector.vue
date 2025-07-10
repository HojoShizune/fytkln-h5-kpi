<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String, // ✅ 单选 ID
    required: true
  },
  targetList: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
const popoverVisible = ref(false)
const searchText = ref('')

// ✅ 过滤逻辑支持多字段模糊匹配
const filteredTargets = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return props.targetList

  return props.targetList.filter(t => {
    const scoreStr = t.score != null ? `${t.score}分` : ''
    const floatStr = t.floating != null ? `浮动${t.floating}` : ''
    const fields = [t.name, t.deptName, scoreStr, floatStr]
    return fields.some(f => f?.toLowerCase().includes(keyword))
  })
})

const selectTarget = (id) => {
  emit('update:modelValue', String(id))
  searchText.value = ''
  popoverVisible.value = false
}

const selectedTarget = computed(() =>
  props.targetList.find(t => String(t.id) === props.modelValue)
)
</script>

<template>
  <div>
    <el-popover
      placement="bottom-start"
      :width="400"
      trigger="click"
      v-model:visible="popoverVisible"
    >
      <template #reference>
        <el-button plain style="margin-bottom: 8px;">
          {{ selectedTarget?.name || '选择考核项' }}
        </el-button>
      </template>

      <div>
        <el-input
          v-model="searchText"
          placeholder="搜索名称、部门、分数，例如：20分 / 浮动0"
          clearable
          size="small"
          style="margin-bottom: 8px;"
        />

        <div style="max-height: 250px; overflow-y: auto;">
          <div
            v-for="t in filteredTargets"
            :key="t.id"
            @click="selectTarget(t.id)"
            :style="{
              padding: '6px 10px',
              cursor: 'pointer',
              borderRadius: '4px',
              marginBottom: '4px',
              background: props.modelValue === String(t.id) ? '#e0f7fa' : '#f7f8fa',
              color: '#333'
            }"
          >
            {{ t.name }}（{{ t.score ?? 0 }}分｜浮动{{ t.floating ?? 0 }}｜{{ t.deptName || '—' }}）
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

    <div v-if="selectedTarget" style="margin-top: 12px;">
      <span style="font-weight: bold; color: #666;">已选考核项：</span>
      <el-tag type="success">{{ selectedTarget.name }}</el-tag>
    </div>
  </div>
</template>
