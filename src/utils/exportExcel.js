import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * @param {Object} survey 当前问卷对象
 * @param {Object} answers 用户填写的答案
 */
export function exportSurveyToExcel(survey, answers) {
  const data = [
    ['题号', '题目', '答案']
  ]

  survey.questions.forEach((q, index) => {
    const answer = answers[q.id] || '（未填写）'
    data.push([index + 1, q.title, answer])
  })

  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '问卷答卷')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `${survey.title || '答卷'}.xlsx`)
}