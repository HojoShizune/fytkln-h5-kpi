<script setup>
//TargetSelector.vue：DeptManage页面的表格内容摘要、省略号 + tooltip
const props = defineProps({
  value: String,
  max: {
    type: Number,
    default: 3
  }
})

// 简易复用你原来的 parseTargets 逻辑
const parseTargets = (raw) => {
  if (!raw || typeof raw !== 'string') return []
  try {
    const jsonStr = raw
      .replace(/([{,])\s*(\w+)=/g, '$1"$2":')
      .replace(/:([^,{}]+)/g, (_, val) => {
        const v = val.trim()
        return isNaN(v) ? `:"${v}"` : `:${v}`
      })
    return JSON.parse(jsonStr).map(t => t.name).filter(Boolean)
  } catch {
    return []
  }
}

const allNames = parseTargets(props.value)
const visible = allNames.slice(0, props.max)
const more = allNames.length > props.max
</script>

<template>
  <el-tooltip :content="allNames.join('，')" placement="top" effect="dark">
    <span>
      {{ visible.join('，') + (more ? '…' : '') }}
    </span>
  </el-tooltip>
</template>