import { useCallback, useEffect, useState } from 'react'
import type { PortfolioData } from '@/types/portfolio.types'
import { portfolioService } from '@/services/portfolio.services'

interface UsePortfolioReturn {
  data: PortfolioData | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refetch: () => Promise<void>
}

export const usePortfolio = (
  refreshInterval: number = 15000,
): UsePortfolioReturn => {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true)
      const portfolioData = await portfolioService.getPortfolio()
      setData(portfolioData)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio')
      console.error('Error fetching portfolio:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()

    const interval = setInterval(() => {
      fetchPortfolio()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchPortfolio, refreshInterval])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchPortfolio,
  }
}
