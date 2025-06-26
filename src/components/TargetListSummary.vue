<script setup>
import { computed } from 'vue'

const props = defineProps({
  // value 现在既可以是字符串，也可以是一个 string[] 数组
  value: {
    type: [String, Array],
    required: true
  },
  max: {
    type: Number,
    default: 3
  }
})

// 字符串解析逻辑（你原有的）
const parseFromString = (raw) => {
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

// 统一拿到 string[] 形式的 names
const allNames = computed(() => {
  if (Array.isArray(props.value)) {
    // 如果已经是数组，直接返回
    return props.value.filter(v => typeof v === 'string' && v)
  }
  // 否则当成字符串来 parse
  return parseFromString(props.value)
})

const visible = computed(() => allNames.value.slice(0, props.max))
const more = computed(() => allNames.value.length > props.max)
</script>

<template>
  <el-tooltip :content="allNames.join('，')" placement="top" effect="dark">
    <span>
      {{ visible.join('，') + (more ? '…' : '') }}
    </span>
  </el-tooltip>
</template>