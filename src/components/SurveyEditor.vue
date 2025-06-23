<template>
  <el-button @click="goBack">返回问卷管理</el-button>
  <h2 style="margin-top: 12px;">问卷编辑器</h2>

  <el-form :model="form">
    <el-form-item label="问卷标题">
      <el-input v-model="form.title" />
    </el-form-item>
    <el-form-item label="问卷描述">
      <el-input v-model="form.description" type="textarea" />
    </el-form-item>
  </el-form>

  <draggable v-model="form.questions" item-key="id" animation="200">
    <template #item="{ element, index }">
      <el-collapse style="margin-bottom: 12px;">
        <el-collapse-item :name="index">
          <template #title>
            <b>题目 {{ index + 1 }}（{{ element.type }}）</b>
          </template>

          <el-input
            v-model="element.title"
            placeholder="请输入题干"
            style="margin: 8px 0"
          />

          <div v-if="element.type !== 'input'">
            <div
              v-for="(opt, i) in element.options"
              :key="i"
              style="display: flex; gap: 8px; margin-bottom: 4px;"
            >
              <el-input v-model="opt.text" placeholder="选项内容" style="width: 220px;" />
              <el-input-number
                v-model="opt.score"
                :min="0"
                :max="1000"
                :step="1"
                placeholder="分数"
                style="width: 120px;"
              />
              <el-button size="small" type="danger" @click="element.options.splice(i, 1)">
                删
              </el-button>
            </div>
            <el-button size="small" @click="element.options.push({ text: '', score: null })">
              添加选项
            </el-button>
          </div>

          <el-button
            size="small"
            type="danger"
            style="margin-top: 8px;"
            @click="removeQuestion(index)"
          >
            删除该题
          </el-button>
        </el-collapse-item>
      </el-collapse>
    </template>
  </draggable>

  <div style="margin-top: 12px;">
    <el-button @click="addLocalQuestion('radio')">添加单选题</el-button>
    <el-button @click="addLocalQuestion('checkbox')">添加多选题</el-button>
    <el-button @click="addLocalQuestion('input')">添加填空题</el-button>
  </div>

  <div style="margin-top: 24px;">
    <el-button type="primary" @click="submit">发布问卷</el-button>
    <el-button @click="saveDraft">保存草稿</el-button>
  </div>

  <el-card style="margin-top: 24px;">
    <template #header>预览问卷</template>
    <div v-for="(q, i) in form.questions" :key="i" style="margin-bottom: 16px;">
      <div><b>{{ i + 1 }}. {{ q.title }}</b></div>

      <div v-if="q.type === 'radio'">
        <el-radio-group>
          <el-radio v-for="(opt, j) in q.options" :key="j" :label="opt.text">
            {{ opt.text }} <span v-if="opt.score !== null">（{{ opt.score }}分）</span>
          </el-radio>
        </el-radio-group>
      </div>

      <div v-else-if="q.type === 'checkbox'">
        <el-checkbox-group>
          <el-checkbox v-for="(opt, j) in q.options" :key="j" :label="opt.text">
            {{ opt.text }} <span v-if="opt.score !== null">（{{ opt.score }}分）</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <div v-else>
        <el-input placeholder="请填写答案" />
      </div>
    </div>
  </el-card>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import {
  updateSurvey,
  addQuestion,
  updateQuestion,
  getQuestionList,
  deleteQuestion
} from '../api/survey'

const deletedQuestionIds = ref([])

const props = defineProps({
  surveyId: [String, Number]
})

const router = useRouter()

const form = ref({
  id: '',
  title: '',
  description: '',
  questions: []
})

const generateQuestionId = () =>
  'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000)

const addLocalQuestion = (type) => {
  form.value.questions.push({
    id: generateQuestionId(),
    type,
    title: '',
    options:
      type === 'input'
        ? []
        : [
            { text: '', score: null },
            { text: '', score: null }
          ]
  })
}

const removeQuestion = (index) => {
  const removed = form.value.questions.splice(index, 1)[0]
  if (typeof removed.id === 'number') {
    deletedQuestionIds.value.push(removed.id)
  }
}

const validateForm = () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('问卷标题不能为空')
    return false
  }
  if (form.value.questions.length === 0) {
    ElMessage.warning('请至少添加一个题目')
    return false
  }
  for (const [i, q] of form.value.questions.entries()) {
    if (!q.title.trim()) {
      ElMessage.warning(`题目 ${i + 1} 不能为空`)
      return false
    }
    if (q.type !== 'input') {
      if (q.options.length < 2) {
        ElMessage.warning(`题目 ${i + 1} 至少需要两个选项`)
        return false
      }
      for (const [j, opt] of q.options.entries()) {
        if (!opt.text || opt.score == null) {
          ElMessage.warning(`题目 ${i + 1} 的选项 ${j + 1} 内容或分数不能为空`)
          return false
        }
      }
    }
  }
  return true
}

const getOptionFields = (options = []) => {
  const labels = ['A', 'B', 'C', 'D']
  const fields = {}
  for (let i = 0; i < labels.length; i++) {
    fields[`option${labels[i]}`] = options[i]?.text ?? ''
    fields[`score${labels[i]}`] = options[i]?.score ?? null
  }
  return fields
}

const isNewQuestion = (q) =>
  typeof q.id === 'string' && q.id.startsWith('q_')

const submit = async () => {
  if (!validateForm()) return

  try {
    const surveyId = props.surveyId

    if (!surveyId) {
      ElMessage.error('缺少问卷ID，无法提交')
      return
    }

    await updateSurvey({
      id: surveyId,
      title: form.value.title,
      description: form.value.description
    })

    for (const q of form.value.questions) {
      const base = {
        surveyId,
        questionText: q.title,
        questionType:
          q.type === 'radio'
            ? '单选'
            : q.type === 'checkbox'
              ? '多选'
              : '简答'
      }

      const optionsPayload =
        q.type === 'input' ? {} : getOptionFields(q.options)

      const payload = { ...base, ...optionsPayload }

      if (isNewQuestion(q)) {
        await addQuestion(payload)
      } else {
        await updateQuestion({ id: q.id, ...payload })
      }
    }

    for (const id of deletedQuestionIds.value) {
      await deleteQuestion(id)
    }

    ElMessage.success('问卷更新成功 ✅')
    router.push('/manage/manage')
  } catch (err) {
    console.error('❌ 提交失败:', err)
    ElMessage.error('提交失败，请稍后重试')
  }
}

const saveDraft = () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请填写问卷标题')
    return
  }
  console.log('💾 草稿保存:', { ...form.value, status: 'draft' })
  ElMessage.success('草稿保存成功')
}

const goBack = () => {
  router.push('/manage/manage')
}

onMounted(async () => {
  if (props.surveyId) {
    try {
      const localSurveyList = JSON.parse(
        sessionStorage.getItem('surveyList') || '[]'
      )
      const survey = localSurveyList.find(
        (s) => s.id == props.surveyId
      )

      if (survey) {
        form.value.id = survey.id
        form.value.title = survey.title
        form.value.description = survey.description || ''
      }

      const res = await getQuestionList(props.surveyId)

      form.value.questions = (res.data || []).map((q) => {
        let type = 'input'
        if (q.questionType === '单选') type = 'radio'
        else if (q.questionType === '多选') type = 'checkbox'

        const options =
          type === 'input'
            ? []
            : ['A', 'B', 'C', 'D'].map((key) => ({
                text: q[`option${key}`],
                score: q[`score${key}`]
              })).filter(opt => opt.text)

        return {
          id: q.id,
          type,
          title: q.questionText,
          options
        }
      })

      console.log('✅ 问卷题目已加载:', form.value.questions)
    } catch (err) {
      console.error('❌ 加载问卷题目失败:', err)
      ElMessage.error('加载问卷失败，请稍后重试')
    }
  }
})
</script>