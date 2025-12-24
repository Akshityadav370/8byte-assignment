export interface Stock {
  name: string
  exchange: string
  sector: string
  purchasePrice: number
  quantity: number
  symbol: string
  cmp: number
  investment: number
  presentValue: number
  gainLoss: number
  peRatio: number | null
  latestEarnings: number | null
  source: string
}

export interface Sector {
  sectorName: string
  totalInvestment: number
  totalPresentValue: number
  totalGainLoss: number
  totalQty: number
  totalPurchasePrice: number
  stocks: Array<Stock>
}

export interface PortfolioSummary {
  totalInvestment: number
  totalPresentValue: number
  totalGainLoss: number
  lastUpdated: string
}

export interface PortfolioData {
  summary: PortfolioSummary
  sectors: Array<Sector>
}
