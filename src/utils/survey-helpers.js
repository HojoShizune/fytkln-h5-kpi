// src/utils/survey-helpers.js

export function parseQuestions(questions) {
  if (!questions) return []
  if (typeof questions === 'string') {
    try {
      return JSON.parse(questions)
    } catch {
      return []
    }
  }
  return Array.isArray(questions) ? questions : []
}

export function parseAnswers(questions) {
  const parsed = parseQuestions(questions)
  return parsed.map(q => q.choice)
}