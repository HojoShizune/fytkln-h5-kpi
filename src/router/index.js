import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { h } from 'vue' // 在 router 文件顶部引入
import QuestionnaireLayout from '../layout/QuestionnaireLayout.vue'
import ScoringLayout from '../layout/ScoringLayout.vue'



const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue')
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/',
    component: () => import('../layout/HomeLayout.vue'),
    children: [
      {
        path: 'home',
        component: () => import('../pages/Home.vue'),
        meta: { title: '首页', icon: 'House' }
      },
      {
        path: 'test',
        component: () => import('../pages/Test.vue'),
        meta: { title: '接口测试', icon: 'House' }
      },
      {
        path: 'survey',
        meta: { title: '问卷', icon: 'Document' },
        children: [
          {
            path: '',
            component: () => import('../pages/SurveyList.vue'),
            meta: { title: '填写问卷', icon: 'Edit' }
          },
          {
            path: ':id',
            component: () => import('../pages/SurveyDetail.vue'),
            meta: { title: '问卷详情', hidden: true }
          }
        ]
      },
      {
        path: 'admin',
        meta: { title: '管理员菜单', icon: 'Setting' },// 只有 admin 可见可访问  roles: [1]
        children: [
          /*{
            path: 'register',
            component: () => import('../pages/UserRegister.vue'),
            meta: { title: '用户新增', icon: 'UserAdd' }
          },*/ // 用户注册页面: 已整合至组件RegisterUserDialog.vue
          {
            path: 'manage',
            component: () => import('../pages/UserManage.vue'),
            meta: { title: '用户管理', icon: 'UserList' }
          },
          {
            path: 'dept',
            component: () => import('../pages/DeptManage.vue'),
            meta: { title: '部门管理', icon: 'OfficeBuilding' }
          },
          {
            path: 'target',
            component: () => import('../pages/TargetManage.vue'),
            meta: { title: '考核项管理', icon: 'OfficeBuilding' }
          },
          {
            path: 'questionnaire',
            component: QuestionnaireLayout,
            meta: { title: '问卷管理', icon: 'PieChart' },
            children: [
              {
                path: 'result',
                component: () => import('../pages/SurveyResult.vue'),
                meta: { title: '结果查询与导出', icon: 'PieChart' }
              },
              {
                path: 'design',
                component: () => import('../pages/SurveyDesigner.vue'),
                meta: { title: '问卷设计', icon: 'EditPen', hidden: true }
              },// 问卷设计页面: 已整合至组件SurveyEditor.vue；靠该页面调用SurveyEditor组件，需保留
              {
                path: 'manage',
                component: () => import('../pages/SurveyManage.vue'),
                meta: { title: '问卷管理与设计', icon: 'List' }
              }
            ]
          }
        ]
      },
      {
        path: 'scoring',
        component: ScoringLayout,
        meta: { title: '打分模块', icon: 'Tools' },
        children: [
          {
            path: 'score-board',
            component: () => import('../pages/ScoreBoard.vue'),
            meta: { title: '指标打分', icon: 'PieChart' }
          },
          {
            path: 'summary',
            component: () => import('../pages/ScoreSummary.vue'),
            meta: { title: '得分汇总', icon: 'PieChart' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.token

  if (to.path !== '/login' && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/home')
  } else if (to.meta.roles && !to.meta.roles.includes(userStore.roleId)) {
    ElMessage.warning('无权限访问')
    next('/home')
  } else {
    next()
  }
})


export default router