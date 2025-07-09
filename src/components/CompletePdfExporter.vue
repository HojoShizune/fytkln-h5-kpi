<!-- html2pdf插件与浏览器打印，废弃 -->
<template>
  <div class="complete-exporter">
    <!-- ⏱ 导出入口按钮 -->
    <el-button type="primary" @click="dialogVisible = true" :loading="exporting">
      导出全部 PDF
    </el-button>

    <!-- 📦 弹窗：展示拼接好的内容（预览 + 导出） -->
    <el-dialog v-model="dialogVisible" title="整合导出预览" width="90%" top="4vh">
      <div class="scroll-wrapper">
        <!-- 📄 PDF 内容预览区域 -->
        <div ref="previewArea" class="preview-container">
          <!-- ⛓️ 每段内容拼接并渲染为组件，绑定 print-area 类便于分页 -->
          <component
            v-for="(html, idx) in mergedBlocks"
            :key="idx"
            is="div"
            class="print-area"
            v-html="html"
          />
        </div>
      </div>

      <!-- 🔘 弹窗底部按钮区：取消 / 确认导出 / 浏览器打印 -->
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExport">确认导出 PDF</el-button>
        <el-button type="success" @click="handlePrint">🖨️ 浏览器打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import html2pdf from 'html2pdf.js'
import { ElMessage } from 'element-plus'

// ✅ 接收父组件传入的标题，用于命名 PDF 文件等
const props = defineProps({
  title: String
})

// 🎯 控制弹窗状态与导出状态
const dialogVisible = ref(false)
const exporting = ref(false)

// 📌 弹窗内容区域 DOM 引用
const previewArea = ref(null)

// 🧩 存放拼接后的 HTML 块
const mergedBlocks = ref([])

// 🔍 监听弹窗打开时，抓取需要导出的结构片段
watch(dialogVisible, async visible => {
  if (!visible) return
  await nextTick()
  mergedBlocks.value = []

  // ✅ 抓取汇总页结构
  const board = document.querySelector('#score-board-preview')
  if (board) {
    mergedBlocks.value.push(board.innerHTML) // 🧱 插入为首块
  }

  // ✅ 抓取部门详情结构，并为每块添加分页符
  const details = document.querySelectorAll('#score-summary-preview .print-area')
  details.forEach((node, idx) => {
    const inner = node.outerHTML // ✅ 保留 print-area 包裹层
    const block = `<div class="page-divider"></div>${inner}` // ✅ 插入分页符（即使是第一块也插）
    mergedBlocks.value.push(block)
  })
})

// 🖨️ 浏览器原生打印：打开新窗口打印预览区域内容
function handlePrint() {
  const printArea = previewArea.value
  if (!printArea) return

  const printWindow = window.open('', '', 'width=800,height=600')
  if (!printWindow) return

  // ✅ 写入内容和样式，结构与 print-area 保持一致
  printWindow.document.write(`
    <html>
      <head>
        <title>整合导出预览 - ${props.title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 16px;
            background: white;
            color: black;
          }
          .print-area {
            page-break-before: always;
            page-break-inside: avoid;
            margin-bottom: 24px;
          }
          .print-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 0 0 12px 0;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #ccc;
            padding: 4px 6px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
    </html>
  `)

  // ✅ 关闭写入、聚焦新窗口、稍后触发打印
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}

// 📄 PDF 导出（使用 html2pdf）
async function handleExport() {
  exporting.value = true
  await nextTick()

  const el = previewArea.value
  if (!el) return

  html2pdf()
    .set({
      // 📐 设置边距：上下 10mm，左右 0（你也可调为 [10, 10, 10, 10]）
      margin: [10, 0, 10, 0],
      filename: `考核整合导出_${props.title}.pdf`,
      pagebreak: {
        before: '.page-divider', // ✅ 插入分页点触发新页
      },
      html2canvas: {
        scale: 0.9, // 🧼 提高清晰度
        backgroundColor: '#fff',
        useCORS: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      }
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
/* ✅ 滚动容器，用于弹窗内容区域 */
.scroll-wrapper {
  max-height: 80vh;
  overflow-y: auto;
  padding: 12px;
  background-color: #fafafa;
}

/* 📄 内容预览区域，控制宽度和背景 */
.preview-container {
  max-width: 180mm;
  margin: 0 auto;
  background: white;
  padding: 16px;
}

/* 🧵 每段评分块，控制分页和间距 */
.print-area {
  margin-bottom: 24px;
  page-break-inside: avoid;
}

/* 🧨 分页符元素，触发 page-break-before */
.page-divider {
  page-break-before: always;
  height: 16px;
}
</style>
