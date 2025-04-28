export interface HistoricalPrice {
  timestamp: number
  price: number
}

export interface TechnicalIndicators {
  rsi: number
  macd: number
  bollinger: number
}

export interface OnChainMetrics {
  transactions: number
  volume: number
  activeAddresses: number
}

export interface SentimentData {
  sentiment: string
  score: number
}

export interface Prediction {
  price: number
  confidence: number
  trend: "up" | "down" | "neutral"
  volatility: number
} 