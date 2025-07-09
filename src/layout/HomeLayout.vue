<template>
  <el-container class="layout-container">
    <el-header class="top-bar">
      <div class="logo">🧭 KPI 考核管理系统</div>
      <div class="header-right">
        <el-switch
          v-model="darkMode"
          active-text="🌙 暗黑模式"
          inactive-text="☀️ 明亮模式"
        />
        <UserDropdown />
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="side-menu">
        <el-menu router :default-active="route.path">
          <template v-for="item in menuRoutes" :key="item.fullPath || item.path">
            <el-sub-menu
              v-if="item.children?.length"
              :index="item.fullPath || item.path"
            >
              <template #title>
                <el-icon>
                  <component :is="iconMap[item.meta?.icon] || DefaultIcon" />
                </el-icon>
                <span>{{ item.meta?.title }}</span>
              </template>

              <template v-for="child in item.children" :key="child.fullPath || child.path">
                <el-sub-menu
                  v-if="child.children?.length"
                  :index="child.fullPath || child.path"
                >
                  <template #title>
                    <el-icon>
                      <component :is="iconMap[child.meta?.icon] || DefaultIcon" />
                    </el-icon>
                    <span>{{ child.meta?.title }}</span>
                  </template>

                  <template
                    v-for="grand in child.children"
                    :key="grand.fullPath || grand.path"
                  >
                    <el-menu-item :index="grand.fullPath || grand.path">
                      <el-icon>
                        <component :is="iconMap[grand.meta?.icon] || DefaultIcon" />
                      </el-icon>
                      <span>{{ grand.meta?.title }}</span>
                    </el-menu-item>
                  </template>
                </el-sub-menu>

                <el-menu-item v-else :index="child.fullPath || child.path">
                  <el-icon>
                    <component :is="iconMap[child.meta?.icon] || DefaultIcon" />
                  </el-icon>
                  <span>{{ child.meta?.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>

            <el-menu-item v-else :index="item.fullPath || item.path">
              <el-icon>
                <component :is="iconMap[item.meta?.icon] || DefaultIcon" />
              </el-icon>
              <span>{{ item.meta?.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  Document,
  Edit,
  DocumentChecked,
  Management,
  UserFilled,
  OfficeBuilding,
  Histogram,
  Memo,
  DataLine,
  EditPen,
  Notebook,
  Tools,
  TrendCharts,
  Opportunity,
  DataBoard,
  Calendar,
  Lock
} from '@element-plus/icons-vue'
import { QuestionFilled as DefaultIcon } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import { useThemeStore } from '../store/theme'
import UserDropdown from '../components/UserDropdown.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const currentRole = computed(() => userStore.roleId)

// 🧠 响应式处理暗黑模式按钮
const darkMode = computed({
  get: () => themeStore.isDark,
  set: (val) => {
    themeStore.isDark = val
    themeStore.toggleDarkMode()
  }
})




const layoutRoute = router.options.routes.find(
  r =>
    r.component?.name === 'HomeLayout' ||
    (typeof r.component === 'function' &&
      r.component.toString().includes('HomeLayout'))
)

const extractMenuTree = (routes = [], parentPath = '') =>
  routes
    .filter(route => {
      const hasTitle = route.meta?.title
      const notHidden = !route.meta?.hidden
      const hasAccess =
        !route.meta?.roles || route.meta.roles.includes(currentRole.value)
      return hasTitle && notHidden && hasAccess
    })
    .map(route => {
      const fullPath = (parentPath + '/' + route.path).replace(/\/+/g, '/')
      const children = extractMenuTree(route.children || [], fullPath)
      return children.length
        ? { ...route, fullPath, children }
        : { ...route, fullPath }
    })

const menuRoutes = computed(() =>
  layoutRoute?.children ? extractMenuTree(layoutRoute.children) : []
)

const iconMap = {
  HomeFilled,
  Document,
  Edit,
  DocumentChecked,
  Management,
  UserFilled,
  OfficeBuilding,
  Histogram,
  Memo,
  DataLine,
  EditPen,
  Notebook,
  Tools,
  TrendCharts,
  Opportunity,
  DataBoard,
  Calendar,
  Lock
}
</script>

<style>
.layout-container {
  height: 100vh;
}

/* ✅ 顶部导航栏 */
.top-bar {
  background-color: var(--el-color-primary);
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 20px;
  font-weight: bold;
}

/* ✅ 顶部右侧区域（切换+用户） */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ✅ 侧边栏 */
.side-menu {
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

/* ✅ 主区域内容 */
.main-content {
  padding: 24px;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.logo {
  display: flex;
  align-items: center;
}
</style>
