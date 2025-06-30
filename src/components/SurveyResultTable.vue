<template>
  <el-table :data="resultList" border style="width:100%; margin-top:16px;">
    <el-table-column prop="username" label="用户" width="120" />
    <el-table-column prop="deptName" label="部门" width="160" />
    <el-table-column prop="avgScore" label="总分" width="80" />
    <el-table-column label="是否已填写" width="100">
      <template #default="{ row }">
        <el-tag :type="row.answers.length ? 'success' : 'warning'">
          {{ row.answers.length ? '是' : '否' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      v-for="(q, i) in questionList"
      :key="q.title"
      :label="q.title"
    >
      <template #default="{ row }">
        {{ row.answers[i] || '-' }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  resultList: Array,
  questionList: Array
})
</script>