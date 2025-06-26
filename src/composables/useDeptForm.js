//useDeptForm.js：DeptManage页面的表单逻辑胶囊、弹窗状态、回填、提交（组合式函数）
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addDept, updateDept, deleteDept } from '../api/dept'
import { parseTargets } from '../utils/parseTargets' // 可抽出去复用

export function useDeptForm({ onRefresh }) {
  const form = ref({ deptName: '', targets: [] })
  const isEdit = ref(false)
  const dialogVisible = ref(false)
  const currentDeptId = ref(null)
  const originalForm = ref(null)

  const searchText = ref('') // 搜索考核项关键词

  const openAddDialog = () => {
    isEdit.value = false
    form.value = { deptName: '', targets: [] }
    dialogVisible.value = true
    searchText.value = ''
  }

  const editDept = (dept) => {
    isEdit.value = true
    currentDeptId.value = dept.deptId
    const parsedTargets = parseTargets(dept.targets).map(t => t.id)
    form.value = {
      deptName: dept.deptName,
      targets: parsedTargets
    }
    originalForm.value = JSON.parse(JSON.stringify(form.value))
    dialogVisible.value = true
    searchText.value = ''
  }

  const onSubmit = async () => {
    if (!form.value.deptName.trim()) {
      ElMessage.warning('请输入部门名称')
      return
    }
    if (!form.value.targets.length) {
      ElMessage.warning('请至少选择一个考核项')
      return
    }

    const payload = {
      deptName: form.value.deptName,
      targets: JSON.stringify(form.value.targets.map(Number))
    }

    const isFormChanged = JSON.stringify(form.value) !== JSON.stringify(originalForm.value)
    if (isEdit.value && !isFormChanged) {
      dialogVisible.value = false
      ElMessage.info('没有任何修改，已关闭弹窗')
      return
    }

    try {
      if (isEdit.value) {
        await updateDept({ deptId: currentDeptId.value, ...payload })
        ElMessage.success('更新成功')
      } else {
        await addDept(payload)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      onRefresh?.()
    } catch (err) {
      console.error('❌ 提交失败:', err)
      ElMessage.error('操作失败，请稍后重试')
    }
  }

  const resetForm = () => {
    if (originalForm.value) {
      form.value = JSON.parse(JSON.stringify(originalForm.value))
      ElMessage.info('已恢复至修改前状态')
    }
  }

  const deleteDeptById = async (dept) => {
    try {
      await ElMessageBox.confirm(`确认删除部门【${dept.deptName}】吗？`, '警告', { type: 'warning' })
      await deleteDept(dept.deptId)
      ElMessage.success('已删除')
      onRefresh?.()
    } catch (err) {
      console.error('❌ 删除失败:', err)
      ElMessage.error('删除失败，请稍后重试')
    }
  }

  return {
    form,
    isEdit,
    dialogVisible,
    searchText,
    openAddDialog,
    editDept,
    onSubmit,
    resetForm,
    deleteDeptById
  }
}