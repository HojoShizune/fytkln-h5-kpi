<template>
  <el-container>
    <el-aside width="200px">
      <el-menu default-active="register">
        <el-menu-item index="register" @click="go('/admin/register')">用户注册</el-menu-item>
        <el-menu-item index="manage" @click="go('/admin/manage')">用户管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const go = (path) => router.push(path)
</script>

<style scoped>
el-aside {
  background: #f5f5f5;
}
</style>