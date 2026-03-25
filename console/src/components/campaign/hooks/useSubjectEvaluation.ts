import { useState, useCallback } from 'react'

export interface SubjectScore {
  grade: string
  points: number
  message: string
  color: string
  progressPercent: number
}

export interface UseSubjectEvaluationReturn {
  score: SubjectScore | null
  isEvaluating: boolean
  evaluate: (subjectLine: string) => void
  clearScore: () => void
}

const POWER_WORDS = [
  'free', 'new', 'you', 'now', 'get', 'your', 'how', 'save', 'best',
  'today', 'exclusive', 'limited', 'urgent', 'discover', 'secret',
  'proven', 'results', 'amazing', 'instant', 'introducing', 'special',
  'last', 'chance', 'breaking', 'alert', 'quick', 'easy', 'simple',
]

function evaluateSubject(subjectLine: string): SubjectScore {
  let points = 0
  const text = subjectLine.trim().toLowerCase()
  const length = text.length

  // Length scoring (40-60 chars ideal)
  if (length >= 30 && length <= 70) {
    points += 25
  } else if (length >= 20 && length <= 80) {
    points += 15
  } else if (length >= 10) {
    points += 8
  }

  // Power words (up to 20 points)
  const powerWordCount = POWER_WORDS.filter((w) => text.includes(w)).length
  points += Math.min(powerWordCount * 5, 20)

  // Has question mark (engagement)
  if (text.includes('?')) {
    points += 10
  }

  // Has number/digit (specificity)
  if (/\d/.test(text)) {
    points += 10
  }

  // Has personalization token
  if (text.includes('{{') || text.includes('{%')) {
    points += 10
  }

  // Starts with action verb or curiosity
  const startsWithAction = /^(how|why|what|when|discover|get|learn|find|see|try|start|stop|don't|do|are|is|can|will|want|need|ready|feeling|looking)/.test(text)
  if (startsWithAction) {
    points += 10
  }

  // Not all caps
  if (subjectLine.trim() !== subjectLine.trim().toUpperCase()) {
    points += 5
  }

  // Has emoji (slight bonus)
  if (/\p{Extended_Pictographic}/u.test(subjectLine)) {
    points += 5
  }

  // No spam triggers
  const spamTriggers = ['buy now', 'click here', 'act now', 'limited time', 'order now', 'subscribe now']
  const hasSpam = spamTriggers.some((s) => text.includes(s))
  if (!hasSpam) {
    points += 5
  }

  // Cap at 100
  points = Math.min(points, 100)

  // Determine grade
  let grade: string
  let color: string
  let message: string

  if (points >= 90) {
    grade = 'A'
    color = '#7ABE04'
    message = 'Very solid subject line.'
  } else if (points >= 75) {
    grade = 'B'
    color = '#73D13D'
    message = 'Good subject line with room for improvement.'
  } else if (points >= 55) {
    grade = 'C'
    color = '#FAAD14'
    message = 'Average subject line. Consider adding more engagement.'
  } else if (points >= 35) {
    grade = 'D'
    color = '#FF7A45'
    message = 'Weak subject line. Try using power words or questions.'
  } else {
    grade = 'F'
    color = '#FF4D4F'
    message = 'Needs significant improvement. Make it shorter and more compelling.'
  }

  return {
    grade,
    points,
    message,
    color,
    progressPercent: points,
  }
}

export function useSubjectEvaluation(): UseSubjectEvaluationReturn {
  const [score, setScore] = useState<SubjectScore | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const evaluate = useCallback((subjectLine: string) => {
    if (!subjectLine.trim()) {
      setScore(null)
      return
    }
    setIsEvaluating(true)
    // Simulate brief evaluation delay for UX
    setTimeout(() => {
      const result = evaluateSubject(subjectLine)
      setScore(result)
      setIsEvaluating(false)
    }, 300)
  }, [])

  const clearScore = useCallback(() => {
    setScore(null)
  }, [])

  return { score, isEvaluating, evaluate, clearScore }
}
