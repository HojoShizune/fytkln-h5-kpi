// 解析后端返回的伪 JSON 字符串
// 用在DeptManage页面及相关组件中
// 输入: raw 字符串（例：[{id=1,name=考核项A},{id=2,name=考核项B}]）
// 输出: [{ id: '1', name: '考核项A' }, { id: '2', name: '考核项B' }]
export function parseTargets(raw) {
  if (!raw || typeof raw !== 'string') return []

  try {
    const jsonStr = raw
      .replace(/([{,])\s*(\w+)=/g, '$1"$2":') // name= ➝ "name":
      .replace(/:([^,{}]+)/g, (_, val) => {
        const v = val.trim()
        return isNaN(v) ? `:"${v}"` : `:${v}`
      })

    return JSON.parse(jsonStr).map(t => ({
      id: String(t.id),
      name: t.name
    }))
  } catch (err) {
    console.warn('❌ parseTargets 解析失败:', raw)
    return []
  }
}