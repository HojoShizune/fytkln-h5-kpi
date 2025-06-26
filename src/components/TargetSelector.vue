<script setup>
//TargetSelector.vue：DeptManage页面的目标项选择器、搜索 + Tag、多字段模糊匹配
import { ref, computed, watch } from 'vue'
import { ElPopover, ElInput, ElButton, ElTag, ElTooltip } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  targetList: {
    type: Array,
    required: true
  }
})

const emits = defineEmits(['update:modelValue'])

const popoverVisible = ref(false)
const searchText = ref('')

// ✅ 筛选：支持 name / deptName / 分数 / 浮动
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

// ✅ 添加选项
const addTarget = (id) => {
  const strId = String(id)
  if (!props.modelValue.includes(strId)) {
    emits('update:modelValue', [...props.modelValue, strId])
    searchText.value = ''
  }
}

// ✅ 删除选项
const removeTarget = (id) => {
  emits('update:modelValue', props.modelValue.filter(i => i !== id))
}
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
        <el-button plain style="margin-bottom: 8px;">选择考核项</el-button>
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
          >
            <el-tooltip
              placement="top"
              effect="dark"
              :show-after="200"
            >
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
                  cursor: props.modelValue.includes(String(t.id)) ? 'default' : 'pointer',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  background: props.modelValue.includes(String(t.id)) ? '#e0e0e0' : '#f7f8fa',
                  color: props.modelValue.includes(String(t.id)) ? '#888' : '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pointerEvents: props.modelValue.includes(String(t.id)) ? 'none' : 'auto'
                }"
              >
                <div style="flex: 1;">
                  {{ t.name }}（{{ t.score ?? 0 }}分｜浮动{{ t.floating ?? 0 }}｜{{ t.deptName || '—' }}）
                </div>
                <div v-if="props.modelValue.includes(String(t.id))" style="color: #4caf50;">✓</div>
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
        v-for="(id, index) in modelValue"
        :key="id"
        size="small"
        closable
        style="margin: 4px 6px 0 0;"
        @close="removeTarget(id)"
      >
        {{ targetList.find(t => t.id === id)?.name || `#${id}` }}
      </el-tag>
    </div>
  </div>
</template>