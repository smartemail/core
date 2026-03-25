import { useState, useEffect, useCallback } from 'react'
import { emailBuilderApi, type EmailBuilderTrendsResponse } from '../../../services/api/email_builder'

export interface UseTrendingHooksReturn {
  trends: EmailBuilderTrendsResponse[]
  isLoading: boolean
  trendingEnabled: boolean
  setTrendingEnabled: (v: boolean) => void
  selectedTrend: EmailBuilderTrendsResponse | null
  setSelectedTrend: (v: EmailBuilderTrendsResponse | null) => void
}

export function useTrendingHooks(): UseTrendingHooksReturn {
  const [trends, setTrends] = useState<EmailBuilderTrendsResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [trendingEnabled, setTrendingEnabled] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState<EmailBuilderTrendsResponse | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchTrends = useCallback(async () => {
    if (hasFetched) return
    setIsLoading(true)
    try {
      const result = await emailBuilderApi.trends()
      setTrends(result || [])
      setHasFetched(true)
    } catch (error) {
      console.error('Failed to fetch trending hooks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [hasFetched])

  // Fetch trends when toggle is enabled
  useEffect(() => {
    if (trendingEnabled && !hasFetched) {
      fetchTrends()
    }
  }, [trendingEnabled, hasFetched, fetchTrends])

  // Clear selection when disabled
  const handleSetTrendingEnabled = useCallback((v: boolean) => {
    setTrendingEnabled(v)
    if (!v) {
      setSelectedTrend(null)
    }
  }, [])

  return {
    trends,
    isLoading,
    trendingEnabled,
    setTrendingEnabled: handleSetTrendingEnabled,
    selectedTrend,
    setSelectedTrend,
  }
}
