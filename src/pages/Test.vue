<template>
  <div class="api-test-page">
    <h2>接口测试</h2>

    <div class="controls">
      <el-input
        v-model="url"
        placeholder="请输入接口地址"
        style="width: 350px;"
      />
      <el-select v-model="method" placeholder="请求方式" style="width: 90px;">
        <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
      </el-select>
      <el-select v-model="paramMode" placeholder="参数类型" style="width: 110px;">
        <el-option label="Query Params" value="params" />
        <el-option label="JSON Body" value="body" />
      </el-select>
      <el-input
        v-model="token"
        placeholder="Bearer Token (可选)"
        style="width: 240px;"
      />
      <el-button type="primary" @click="testApi">发送请求</el-button>
    </div>

    <el-form label-width="100px" class="param-form">
      <el-form-item label="请求参数">
        <el-input
          v-model="rawParams"
          type="textarea"
          placeholder="请输入 JSON 格式参数"
          :rows="6"
        />
      </el-form-item>
    </el-form>

    <div v-if="loading" class="status">加载中…</div>
    <div v-if="error" class="status error">错误：{{ error }}</div>

    <div v-if="result" class="result">
      <h3>返回数据：</h3>
      <pre>{{ formattedResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const url = ref('')
const method = ref('GET')
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const paramMode = ref('params') // 'params' | 'body'
const token = ref('')
const rawParams = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)

const formattedResult = computed(() => {
  try {
    return JSON.stringify(result.value, null, 2)
  } catch {
    return String(result.value)
  }
})

async function testApi() {
  error.value = ''
  result.value = null

  if (!url.value.trim()) {
    error.value = '接口地址不能为空'
    return
  }

  let paramsObj = {}
  if (rawParams.value.trim()) {
    try {
      paramsObj = JSON.parse(rawParams.value)
    } catch (e) {
      error.value = '请求参数不是合法 JSON'
      return
    }
  }

  const config = {
    method: method.value.toLowerCase(),
    url: url.value.trim(),
    headers: {}
  }

  // 带上 Token
  if (token.value.trim()) {
    // 前端直接填入完整的 Authorization，比如 "Bearer xxx"
    config.headers.Authorization = token.value.trim()
  }

  if (paramMode.value === 'params') {
    config.params = paramsObj
  } else {
    config.data = paramsObj
  }

  loading.value = true
  try {
    const res = await axios(config)
    result.value = res.data
  } catch (err) {
    error.value = err.response?.data || err.message || '请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-test-page {
  padding: 24px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}
.param-form {
  max-width: 600px;
}
.status {
  margin-top: 12px;
}
.error {
  color: #f56c6c;
}
.result {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
  max-height: 400px;
  overflow: auto;
}
</style>