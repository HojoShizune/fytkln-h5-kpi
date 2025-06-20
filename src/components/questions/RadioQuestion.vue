<template>
  <div class="q-wrap">
    <h3>{{ index }}. {{ question.title }}</h3>
    <el-radio-group v-model="selected" @change="emitAnswer">
      <el-radio
        v-for="(opt, idx) in question.options"
        :key="idx"
        :label="opt"
      >
        {{ opt }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSurveyStore } from '../../store/surveyStore'

defineProps({
  question: Object,
  index: Number
})

const selected = ref('')
const store = useSurveyStore()

function emitAnswer() {
  store.updateAnswer(question.id, selected.value)
}
</script>

<style scoped>
.q-wrap {
  margin-bottom: 24px;
}
</style>