<template>
  <div class="toolbar">
    <el-date-picker
      v-model="localPeriod"
      type="month"
      placeholder="请选择账期"
      format="YYYY-MM"
      value-format="YYYY-MM"
      @change="emit('update:period', localPeriod)"
      style="width: 180px;"
    />

    <el-select
      v-model="localSurveyId"
      placeholder="请选择问卷"
      style="width: 360px;"
      :disabled="!surveyList.length"
      @update:model-value="val => emit('update:activeSurveyId', val)"
    >
      <el-option
        v-for="s in surveyList"
        :key="s.id"
        :label="s.title"
        :value="s.id"
      />
    </el-select>

    <el-button v-if="isPreviousMonth" type="primary" :loading="loading" @click="emit('compute')">
      一键核算
    </el-button>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'

const isPreviousMonth = computed(() => {
  const current = dayjs().startOf('month')
  const selected = dayjs(localPeriod.value).startOf('month')
  return selected.isSame(current.subtract(1, 'month'), 'month')
})


const props = defineProps({
  period: String,
  surveyList: Array,
  activeSurveyId: [String, Number],
  loading: Boolean
})
const emit = defineEmits(['update:period', 'update:activeSurveyId', 'compute'])

const localPeriod = ref(props.period)
const localSurveyId = ref(props.activeSurveyId)

watch(() => props.period, val => {
  localPeriod.value = val
  localSurveyId.value = null //  清除下拉回显
  emit('update:activeSurveyId', null) //  通知父组件同步清除
})

watch(() => props.activeSurveyId, val => {
  localSurveyId.value = val
})

</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
</style>