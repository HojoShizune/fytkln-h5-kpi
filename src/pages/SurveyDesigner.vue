<template>
  <SurveyEditor :surveyId="route.query.id" />
</template>

<script setup>
import SurveyEditor from '../components/SurveyEditor.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
