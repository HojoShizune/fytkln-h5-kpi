import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'


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
    children: [//HomeLayout的子路由
      {
        path: 'home',
        component: () => import('../pages/Home.vue'),
        meta: { title: '首页', icon: 'House' }
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
        path: 'manage',
        meta: {
          title: '问卷管理',
          icon: 'Tools',
          roles: [1] // 只有 admin 可见可访问
        },
        children: [
          {
            path: 'result',
            component: () => import('../pages/SurveyResult.vue'),
            meta: {
              title: '问卷结果',
              icon: 'PieChart'
            }
          },
          {
            path: 'export',
            component: () => import('../pages/SurveyExport.vue'),
            meta: {
              title: '问卷导出',
              icon: 'Download'
            }
          }
        ]
      },
      {
        path: 'admin',
        meta: { title: '管理员菜单', icon: 'Setting', roles: [1] }, // 仅管理员可见
        children: [
          {
            path: 'register',
            component: () => import('../pages/UserRegister.vue'),
            meta: { title: '用户注册', icon: 'UserAdd' }
          },
          {
            path: 'manage',
            component: () => import('../pages/UserManage.vue'),
            meta: { title: '用户管理', icon: 'UserList' }
          }
        ]
      }    
    ]
  },
  // 可选：404 或登录页等顶层路由
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