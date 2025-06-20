<template>
  <div class="q-wrap">
    <h3>{{ index }}. {{ question.title }}</h3>
    <el-input
      v-model="text"
      type="textarea"
      rows="3"
      placeholder="请输入你的答案"
      @blur="emitAnswer"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSurveyStore } from '../../store/surveyStore'

defineProps({
  question: Object,
  index: Number
})

const text = ref('')
const store = useSurveyStore()

function emitAnswer() {
  store.updateAnswer(question.id, text.value)
}
</script>

<style scoped>
.q-wrap {
  margin-bottom: 24px;
}
</style>