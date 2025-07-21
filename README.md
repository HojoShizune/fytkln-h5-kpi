## 📝 问卷管理系统

一个基于 Vue 3 + Element Plus 实现的轻量级问卷设计、发布与分析平台，支持创建问卷、收集用户答案、查看结果和图表统计，适合企业内部调研、用户反馈收集、活动报名等场景。

---

### 🚀 技术栈

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [vuedraggable](https://github.com/SortableJS/vue.draggable.next)

---

### 📦 功能亮点

#### 🧩 用户系统

- 用户注册 / 登录 / 管理
- 权限控制（区分管理员与普通用户）

#### 📋 问卷设计与发布

- 拖拽式问卷设计器
- 题型支持单选、多选、填空
- 表单校验、草稿保存、预览模式
- 自动生成问卷 ID，后端可扩展存储

#### 📥 用户填写问卷

- 支持答卷入口列表  
- 问卷填写界面简洁直观

#### 📊 结果查看与分析

- 显示各题答案、得分
- 可视化标注：是否填写、按人展示
- 答题统计模块（可拓展图表）

#### 🧑‍💼 管理后台

- 问卷管理（搜索、筛选、分页、编辑回填）
- 用户管理（编辑、删除、权限设置）
- 路由权限控制（基于角色）

---

### 💾 项目结构（简略）

```
src/
├── assets/              // 静态资源
├── components/          // 公共组件
├── pages/               // 页面：SurveyList, SurveyDetail, SurveyDesigner, SurveyManage, SurveyResult 等
├── router/              // 路由配置
├── store/               // 状态管理（如使用 Pinia）
├── utils/               // 工具函数
└── App.vue / main.js    // 项目入口
```

---

### 🔧 使用说明

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 打包构建
npm run build

# 格式检查（可选）
npm run lint
```

---


### 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

