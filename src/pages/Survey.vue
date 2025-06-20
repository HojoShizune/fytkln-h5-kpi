<template>
  <div class="form-wrapper">
    <h2>连云港联通 2025 年工会工作满意度调查问卷</h2>
    <el-form ref="formRef" :model="form" label-width="300px">
      <el-form-item
        v-for="(item, index) in questions"
        :label="item.title"
        :key="index"
        :prop="'q' + index"
        :rules="[{ required: true, message: '请选择评价', trigger: 'blur' }]"
      >
        <el-radio-group v-model="form['q' + index]">
          <el-radio v-for="opt in options" :label="opt" :key="opt">{{ opt }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="十、您有什么建议或意见？">
        <el-input v-model="form.comment" type="textarea" :rows="3" placeholder="选填，若选“不满意”建议填写" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref()

const options = ['满意', '基本满意', '待提升', '不满意']

const questions = [
  { title: '一、您对“劳模”、“好员工”等评优活动的满意度' },
  { title: '二、您对技能/劳动竞赛活动的满意度' },
  { title: '三、您对工会文体及兴趣小组活动的满意度' },
  { title: '四、您对传统节日慰问品的满意度' },
  { title: '五、您对节日慰问活动（三八/六一等）的满意度' },
  { title: '六、您对职工健康体检活动的满意度' },
  { title: '七、您对心理健康讲座的满意度' },
  { title: '八、您对子女助学类活动（金秋助学等）的满意度' },
  { title: '九、您对工会总体工作的满意度' }
]

const form = reactive({
  ...Object.fromEntries(questions.map((_, i) => [`q${i}`, ''])),
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
  ElMessage.info('内容已清空')
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