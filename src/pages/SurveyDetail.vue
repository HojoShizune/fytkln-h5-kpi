<template>
  <div class="form-wrapper" v-if="survey">
    <el-button type="default" icon="ArrowLeft" @click="goBack" style="margin-bottom: 16px;">
      返回
    </el-button>
    <h2>{{ survey.title }}</h2>

    <el-form ref="formRef" :model="form" label-width="300px" label-position="left">
      <el-form-item
        v-for="(q, i) in survey.questions"
        :label="q.title"
        :key="i"
        :prop="'q' + i"
        :rules="q.type === '简答' ? [] : [{ required: true, message: '请选择评价', trigger: 'change' }]"
      >
        <el-radio-group v-if="q.type === '单选'" v-model="form['q' + i]">
          <el-radio v-for="opt in q.options" :key="opt.label" :label="opt.label">
            {{ opt.text }}
          </el-radio>
        </el-radio-group>
        <el-input v-else v-model="form['q' + i]" placeholder="请填写（非必填）" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getQuestionList, submitAnswer } from '../api/survey'

const formRef = ref()
const route = useRoute()
const router = useRouter()

const surveyId = route.params.id
const survey = ref({ title: '', questions: [] })
const form = reactive({ comment: '' })

const goBack = () => router.back()

onMounted(async () => {
  try {
    const localSurveyList = JSON.parse(sessionStorage.getItem('surveyList') || '[]')
    const match = localSurveyList.find(s => s.id == surveyId)
    if (match) {
      survey.value.title = match.title
    }

    const res = await getQuestionList(surveyId)
    const questions = (res.data || []).map((q) => {
      const options = ['A', 'B', 'C', 'D'].map((label) => ({
        label,
        text: q[`option${label}`]
      })).filter(opt => !!opt.text)

      return {
        id: q.id,
        type: q.questionType,
        title: q.questionText,
        options
      }
    })

    survey.value.questions = questions
    questions.forEach((_, i) => { form[`q${i}`] = '' })
  } catch (err) {
    console.error('❌ 加载题目失败:', err)
    ElMessage.error('加载问卷失败，请稍后重试')
  }
})

const onSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const payload = survey.value.questions.map((q, i) => ({
        surveyId: Number(surveyId),
        questionId: q.id,
        response: form[`q${i}`]
      }))
      await submitAnswer(payload)
      ElMessage.success('提交成功 ✅')
      router.push('/survey')
    } catch (err) {
      console.error('❌ 提交失败:', err)
      ElMessage.error('提交失败，请稍后重试')
    }
  })
}

const onReset = () => {
  Object.keys(form).forEach((key) => (form[key] = ''))
  ElMessage.info('已重置')
}
</script>

<style scoped>
.form-wrapper {
  max-width: 800px;
  margin: auto;
  padding: 32px;
  background-color: var(--el-bg-color);       /* ✅ 支持亮暗模式 */
  border-radius: 8px;
  color: var(--el-text-color-primary);        /* ✅ 字体自动适配 */
}

:deep(.el-form-item) {
  margin-bottom: 32px;                         /* ✅ 每题间距稳定 */
  align-items: flex-start;
}

:deep(.el-form-item__label) {
  white-space: normal;                         /* ✅ 多行换行 */
  line-height: 1.4;
  padding: 4px 0;                              /* ✅ 稳定上下布局，不用 margin */
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);         /* ✅ 自动适配文字色 */
}

:deep(.el-radio-group),
:deep(.el-input) {
  margin-top: 6px;                             /* ✅ 选项组与标题拉开 */
}
</style>
