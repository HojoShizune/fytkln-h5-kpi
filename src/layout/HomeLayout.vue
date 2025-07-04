<template>
  <el-container class="layout-container">
    <el-header class="top-bar">
      <div class="logo">🧭 KPI 考核管理系统</div>
      <div class="header-right">
        <UserDropdown /><!--用户信息组件-->
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="side-menu">
        <el-menu router :default-active="route.path">
          <template v-for="item in menuRoutes" :key="item.fullPath || item.path">
            <!-- ✅一级菜单 -->
            <el-sub-menu v-if="item.children?.length" :index="item.fullPath || item.path">
              <template #title>
                <el-icon>
                  <component :is="iconMap[item.meta?.icon] || DefaultIcon" />
                </el-icon>
                <span>{{ item.meta?.title }}</span>
              </template>

              <!-- ✅递归渲染子菜单 -->
              <template v-for="child in item.children" :key="child.fullPath || child.path">
                <el-sub-menu v-if="child.children?.length" :index="child.fullPath || child.path">
                  <template #title>
                    <el-icon>
                      <component :is="iconMap[child.meta?.icon] || DefaultIcon" />
                    </el-icon>
                    <span>{{ child.meta?.title }}</span>
                  </template>
                  <!-- 继续递归... -->
                  <template v-for="grand in child.children" :key="grand.fullPath || grand.path">
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Edit, View, PieChart, Download, Tools } from '@element-plus/icons-vue'
import { QuestionFilled as DefaultIcon } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import UserDropdown from '../components/UserDropdown.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前登录角色（admin / user）
const currentRole = computed(() => userStore.roleId)

const layoutRoute = router.options.routes.find(
  r =>
    r.component?.name === 'HomeLayout' ||
    (typeof r.component === 'function' && r.component.toString().includes('HomeLayout'))
)

// 提取可见菜单（角色判断 + 显示标题 + 非 hidden）
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
  House,
  Edit,
  View,
  PieChart,
  Download,
  Tools
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.top-bar {
  background-color: #3f77ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between; /* ✅ 推开左右区域 */
  padding: 0 20px;
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.side-menu {
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
}
.main-content {
  padding: 24px;
  background-color: #f5f7fa;
}
.logo {
  display: flex;
  align-items: center;
}
</style>