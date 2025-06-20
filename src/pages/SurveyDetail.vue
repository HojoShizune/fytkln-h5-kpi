<template>
  <div class="form-wrapper" v-if="survey">
    <el-button type="default" icon="ArrowLeft" @click="goBack" style="margin-bottom: 16px;">
     返回
    </el-button>
    <h2>{{ survey.title }}</h2>
    <el-form ref="formRef" :model="form" label-width="300px">
      <el-form-item
        v-for="(q, i) in survey.questions"
        :label="q.title"
        :key="i"
        :prop="'q' + i"
        :rules="[{ required: true, message: '请选择评价', trigger: 'blur' }]"
      >
        <el-radio-group v-model="form['q' + i]">
          <el-radio v-for="opt in options" :label="opt" :key="opt">{{ opt }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="您有什么建议或意见？">
        <el-input v-model="form.comment" type="textarea" :rows="3" placeholder="选填" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'


const formRef = ref()
const route = useRoute()
const router = useRouter()
const goBack = () => {
  router.back()
}

const surveyMap = {
  gwy2025: {
    title: '2025 年工会工作满意度调查问卷',
    questions: [
      { title: '一、您对“劳模”、“好员工”等评优活动的满意度' },
      { title: '二、您对技能/劳动竞赛活动的满意度' },
      { title: '三、您对工会文体及兴趣小组活动的满意度' }
    ]
  },
  culture: {
    title: '企业文化满意度调研',
    questions: [
      { title: '您认同公司的使命与愿景吗？' },
      { title: '对内部沟通文化满意吗？' }
    ]
  },
  wellness: {
    title: '职工关怀计划反馈',
    questions: [
      { title: '健康体检安排是否合理？' },
      { title: '心理讲座是否实用？' }
    ]
  }
}

const survey = computed(() => surveyMap[route.params.id])
const options = ['满意', '基本满意', '待提升', '不满意']
const form = reactive({
  ...Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`q${i}`, ''])),
  comment: ''
})

const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交内容：', form)
      ElMessage.success('提交成功！感谢您的反馈 🎉')
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
  background: #fff;
  border-radius: 8px;
}
</style>