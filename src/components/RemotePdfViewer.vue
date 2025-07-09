<template>
  <div class="remote-pdf-viewer">
    <!-- 📦 PDF 预览弹窗 -->
    <el-dialog v-model="visible" title="导出PDF预览" width="90%" top="4vh">
      <div class="scroll-wrapper">
        <!-- ✅ 使用 iframe 加载 PDF 文件 -->
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          class="pdf-frame"
          frameborder="0"
        />
        <div v-else class="loading-tip">⏳ 正在加载 PDF 文件...</div>
      </div>
      <template #footer>
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="success" @click="downloadPdf">下载 PDF 文件</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { downloadCompletePdfFile } from '../api/score' // ✅ 引用后端接口方法

const visible = ref(false)       // 控制弹窗显隐
const pdfUrl = ref(null)         // 保存 PDF 文件对象 URL

// ✅ 父组件调用此方法触发打开弹窗 + 加载 PDF
async function open() {
  visible.value = true
  pdfUrl.value = null

  try {
    const res = await downloadCompletePdfFile()
    const blob = new Blob([res.data], { type: 'application/pdf' })
    pdfUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    console.error('❌ 获取后端 PDF 文件失败:', err)
  }
}

// ✅ 下载 PDF 功能：点击按钮触发保存
function downloadPdf() {
  if (!pdfUrl.value) return
  const a = document.createElement('a')
  a.href = pdfUrl.value
  a.download = `绩效评分导出.pdf`
  a.click()
}

// ✅ 向父组件暴露 open 方法
defineExpose({ open })
</script>

<style scoped>
.scroll-wrapper {
  max-height: 80vh;
  overflow-y: auto;
  background-color: #f9f9f9;
  padding: 12px;
}

/* PDF 文件预览 iframe 样式 */
.pdf-frame {
  width: 100%;
  height: 1000px;
  border: none;
}

/* 加载提示样式 */
.loading-tip {
  padding: 24px;
  text-align: center;
  color: #999;
}
</style>
