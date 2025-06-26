<script setup>
// TargetTooltip.vue,备用弹性组件
// 统一封装目标项的评分说明弹窗 tooltip（计算公式 + 评分标准）
// 可用于任何目标项 hover 展示场景，传入目标对象 target 即可
const props = defineProps({
  target: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <el-tooltip placement="top" effect="dark" :show-after="200">
    <template #content>
      <div style="max-width: 300px; white-space: normal;">
        <div><strong>计算公式：</strong>{{ target.description || '—' }}</div>
        <div style="margin-top: 4px;"><strong>评分标准：</strong>{{ target.scoringMethod || '—' }}</div>
      </div>
    </template>
    <slot />
  </el-tooltip>
</template>