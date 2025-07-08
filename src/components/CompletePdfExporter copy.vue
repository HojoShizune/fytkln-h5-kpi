<template>
  <div class="complete-exporter">
    <!-- ✅ 触发按钮 -->
    <el-button type="primary" @click="dialogVisible = true" :loading="exporting">
      📄 导出全部 PDF（弹窗内容）
    </el-button>

    <!-- ✅ 弹窗预览 -->
    <el-dialog v-model="dialogVisible" title="整合导出预览（可截图、核查）" width="90%" top="4vh">
      <div class="scroll-wrapper">
        <div ref="previewArea" class="preview-container">
          <!-- ✅ 拼接真实 DOM 区块 -->
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
  title: String,
  selectorList: Array // 示例：['#score-board-preview', '#score-summary-preview']
})

const dialogVisible = ref(false)
const exporting = ref(false)
const previewArea = ref(null)
const mergedBlocks = ref([])

watch(dialogVisible, async (visible) => {
  if (!visible) return

  mergedBlocks.value = []

  for (const selector of props.selectorList) {
    const node = document.querySelector(selector)
    console.log('DOM 内容：', document.querySelector('#score-summary-preview')?.innerText.slice(0, 300))

    if (node) {
      mergedBlocks.value.push(node.innerHTML)
    } else {
      console.warn(`⚠️ 没找到选择器: ${selector}`)
    }
  }
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
        mode: ['css', 'legacy'], // ✅ 增强兼容性
        before: '.page-divider',
        avoid: '.print-table' // ✅ 避免拆评分详情表格
      },
      html2canvas: { scale: 1.0, backgroundColor: '#fff', useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(el)
    .save()
    .then(() => {
      ElMessage.success('✅ PDF 导出成功')
    })
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
  page-break-inside: avoid; /* ✅ 整个区块不可拆 */
}
.page-divider {
  page-break-before: always;
  height: 24px;
}
</style>