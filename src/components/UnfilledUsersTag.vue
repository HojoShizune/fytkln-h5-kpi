<template>
  <p class="unfilled">
    ❗ 未填写用户：
    <el-tag
      v-for="(user, i) in users"
      :key="i"
      type="danger"
      style="margin-right: 4px;"
    >
      {{ user.username }}（{{ user.deptName }}）
    </el-tag>
  </p>
</template>

<script setup>
defineProps({
  users: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.unfilled {
  color: #f56c6c;
}
</style>