<template>
  <div class="home-page">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card shadow="hover">
          <h2>欢迎进入问卷管理系统</h2>
          <el-button type="primary" @click="$router.push('/survey')">
            去填写问卷
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useUserStore } from '../store/user'


const surveys = ref([])
const userStore = useUserStore()

console.log('[当前角色]', userStore.roleId)



</script>