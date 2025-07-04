<template>
  <div class="period-selector">
    <el-date-picker
      v-model="localPeriod"
      type="month"
      placeholder="请选择账期"
      format="YYYY-MM"
      value-format="YYYY-MM"
      @change="emit('update:period', localPeriod)"
      style="width: 180px;"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  period: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:period'])

const localPeriod = ref(props.period)

watch(() => props.period, val => {
  localPeriod.value = val
})
</script>

<style scoped>
.period-selector {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
</style>
