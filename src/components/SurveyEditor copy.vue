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

          <!-- 选项题 -->
          <div v-if="element.type !== 'input'">
            <div
              v-for="(opt, i) in element.options"
              :key="i"
              class="option-input"
              style="display: flex; gap: 8px; margin-bottom: 4px;"
            >
              <el-input v-model="element.options[i]" placeholder="选项" />
              <el-button size="small" type="danger" @click="element.options.splice(i, 1)">
                删
              </el-button>
            </div>
            <el-button size="small" @click="element.options.push('')">添加选项</el-button>
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

  <!-- 添加题目按钮 -->
  <div style="margin-top: 12px;">
    <el-button @click="addQuestion('radio')">添加单选题</el-button>
    <el-button @click="addQuestion('checkbox')">添加多选题</el-button>
    <el-button @click="addQuestion('input')">添加填空题</el-button>
  </div>

  <!-- 提交 -->
  <div style="margin-top: 24px;">
    <el-button type="primary" @click="submit">发布问卷</el-button>
    <el-button @click="saveDraft">保存草稿</el-button>
  </div>

  <!-- 预览区 -->
  <el-card style="margin-top: 24px;">
    <template #header>预览问卷</template>
    <div v-for="(q, i) in form.questions" :key="i" style="margin-bottom: 16px;">
      <div><b>{{ i + 1 }}. {{ q.title }}</b></div>

      <div v-if="q.type === 'radio'">
        <el-radio-group>
          <el-radio
            v-for="(opt, j) in q.options"
            :key="j"
            :label="opt"
          >{{ opt }}</el-radio>
        </el-radio-group>
      </div>

      <div v-else-if="q.type === 'checkbox'">
        <el-checkbox-group>
          <el-checkbox
            v-for="(opt, j) in q.options"
            :key="j"
            :label="opt"
          >{{ opt }}</el-checkbox>
        </el-checkbox-group>
      </div>

      <div v-else>
        <el-input placeholder="请填写答案" />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'


const router = useRouter()

const form = ref({
  id: '',
  title: '',
  description: '',
  questions: []
})

const generateQuestionId = () => 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000)

const addQuestion = (type) => {
  form.value.questions.push({
    id: generateQuestionId(),
    type,
    title: '',
    options: type === 'input' ? [] : ['']
  })
}

const removeQuestion = (index) => {
  form.value.questions.splice(index, 1)
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
    if ((q.type !== 'input') && q.options.length < 2) {
      ElMessage.warning(`题目 ${i + 1} 至少需要两个选项`)
      return false
    }
  }
  return true
}

const submit = () => {
  if (!validateForm()) return
  const payload = {
    id: 'survey_' + Date.now(),
    title: form.value.title,
    description: form.value.description,
    questions: form.value.questions,
    status: 'published'
  }
  console.log('🚀 发布问卷:', payload)
  ElMessage.success('问卷发布成功（暂存为草稿）')
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

</script>