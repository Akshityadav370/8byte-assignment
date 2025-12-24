import axios from 'axios'
import type { PortfolioData } from '@/types/portfolio.types'
import { API_BASE_URL } from '@/constants/constants'

export const portfolioService = {
  getPortfolio: async (): Promise<PortfolioData> => {
    try {
      const response = await axios.get<PortfolioData>(
        `${API_BASE_URL}/portfolio`,
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch portfolio data',
        )
      }
      throw new Error('An unexpected error occurred')
    }
  },
}
