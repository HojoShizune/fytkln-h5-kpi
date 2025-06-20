import { defineStore } from 'pinia'

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    currentSurvey: null,
    answers: {}
  }),
  actions: {
    setSurvey(data) {
      this.currentSurvey = data
    },
    updateAnswer(questionId, answer) {
      this.answers[questionId] = answer
    }
  }
})