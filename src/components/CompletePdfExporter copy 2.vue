<template>
  <div class="complete-exporter">
    <el-button type="primary" @click="dialogVisible = true" :loading="exporting">
      📄 导出全部 PDF
    </el-button>

    <el-dialog v-model="dialogVisible" title="整合导出预览" width="90%" top="4vh">
      <div class="scroll-wrapper">
        <div ref="previewArea" class="preview-container">
          <component
            v-for="(html, idx) in mergedBlocks"
            :key="idx"
            is="div"
            class="print-area"
            v-html="html"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExport">确认导出 PDF</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import html2pdf from 'html2pdf.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  title: String
})

const dialogVisible = ref(false)
const exporting = ref(false)
const previewArea = ref(null)
const mergedBlocks = ref([])

watch(dialogVisible, async visible => {
  if (!visible) return

  await nextTick()
  mergedBlocks.value = []

  // 1. 汇总页：抓 innerHTML，交给外层 print-area 包裹
  const board = document.querySelector('#score-board-preview')
  if (board) {
    mergedBlocks.value.push(board.innerHTML)
  }

  // 2. 明细页：每个 .print-area 塊按索引分块，插分页符
  const details = document.querySelectorAll('#score-summary-preview .print-area')
  details.forEach((node, idx) => {
    const inner = node.innerHTML
    const block = idx === 0
      ? inner
      : `<div class="page-divider"></div>${inner}`
    mergedBlocks.value.push(block)
  })
})

async function handleExport() {
  exporting.value = true
  await nextTick()

  const el = previewArea.value
  if (!el) return

  html2pdf()
    .set({
      margin: 10,
      filename: `考核整合导出_${props.title}.pdf`,
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.page-divider',
        avoid: '.print-area'
      },
      html2canvas: { scale: 1.0, backgroundColor: '#fff', useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(el)
    .save()
    .then(() => ElMessage.success('PDF 导出成功'))
    .finally(() => {
      exporting.value = false
      dialogVisible.value = false
    })
}
</script>

<style scoped>
.scroll-wrapper {
  max-height: 80vh;
  overflow-y: auto;
  padding: 12px;
  background-color: #fafafa;
}
.preview-container {
  max-width: 180mm;
  margin: 0 auto;
  background: white;
  padding: 16px;
}
.print-area {
  margin-bottom: 24px;
  page-break-inside: avoid;
}
.page-divider {
  page-break-before: always;
  height: 16px;
}
</style>
