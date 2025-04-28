import { HistoricalPrice, TechnicalIndicators } from '@/types'

interface BollingerBands {
  upper: number
  middle: number
  lower: number
  width: number
}

interface MACD {
  macd: number
  signal: number
  histogram: number
}

// Tipo interno para los cálculos
interface DetailedTechnicalIndicators {
  rsi: number
  macd: MACD
  bollinger: BollingerBands
}

export class TechnicalIndicatorsService {
  private static instance: TechnicalIndicatorsService
  private period = 14
  private stdDev = 2

  private constructor() {}

  public static getInstance(): TechnicalIndicatorsService {
    if (!TechnicalIndicatorsService.instance) {
      TechnicalIndicatorsService.instance = new TechnicalIndicatorsService()
    }
    return TechnicalIndicatorsService.instance
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return 0
    const multiplier = 2 / (period + 1)
    let ema = this.calculateSMA(prices.slice(0, period), period)

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema
    }

    return ema
  }

  private calculateRSI(prices: number[]): number {
    if (prices.length < this.period + 1) return 50

    let gains = 0
    let losses = 0

    for (let i = 1; i <= this.period; i++) {
      const difference = prices[i] - prices[i - 1]
      if (difference >= 0) {
        gains += difference
      } else {
        losses -= difference
      }
    }

    const avgGain = gains / this.period
    const avgLoss = losses / this.period

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  private calculateMACD(prices: number[]): MACD {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26
    const signal = this.calculateEMA([macd], 9)
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  private calculateBollingerBands(prices: number[]): BollingerBands {
    const sma = this.calculateSMA(prices, this.period)
    const squaredDifferences = prices
      .slice(-this.period)
      .map(price => Math.pow(price - sma, 2))
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / this.period
    const stdDeviation = Math.sqrt(variance)

    const upper = sma + (this.stdDev * stdDeviation)
    const lower = sma - (this.stdDev * stdDeviation)
    const width = (upper - lower) / sma

    return { upper, middle: sma, lower, width }
  }

  public calculateIndicators(prices: number[]): TechnicalIndicators {
    const detailedIndicators = {
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      bollinger: this.calculateBollingerBands(prices)
    };

    // Convertir a formato simplificado para la interfaz
    return {
      rsi: detailedIndicators.rsi,
      macd: detailedIndicators.macd.macd, // Usar el valor principal de MACD
      bollinger: detailedIndicators.bollinger.middle // Usar la línea media de Bollinger
    };
  }

  public getSignal(value: number, upperThreshold: number = 70, lowerThreshold: number = 30): "buy" | "sell" | "neutral" {
    if (value > upperThreshold) return "sell";
    if (value < lowerThreshold) return "buy";
    return "neutral";
  }

  public getSignalForIndicators(indicators: DetailedTechnicalIndicators): {
    rsi: "buy" | "sell" | "neutral"
    macd: "buy" | "sell" | "neutral"
    bollinger: "buy" | "sell" | "neutral"
  } {
    const { rsi, macd, bollinger } = indicators

    const rsiSignal = rsi > 70 ? "sell" : rsi < 30 ? "buy" : "neutral"

    const macdSignal = macd.histogram > 0
      ? (macd.macd > macd.signal ? "buy" : "neutral")
      : (macd.macd < macd.signal ? "sell" : "neutral")

    const bollingerSignal = bollinger.width > 0.1
      ? (bollinger.upper < bollinger.middle ? "sell" : "buy")
      : "neutral"

    return {
      rsi: rsiSignal,
      macd: macdSignal,
      bollinger: bollingerSignal
    }
  }

  public getStrength(value: number, threshold: number = 50): number {
    return Math.min(Math.abs(value - threshold) * 2, 100);
  }

  public getStrengthForIndicators(indicators: DetailedTechnicalIndicators): {
    rsi: number
    macd: number
    bollinger: number
  } {
    const { rsi, macd, bollinger } = indicators

    const rsiStrength = Math.abs(rsi - 50) / 50 * 100
    const macdStrength = Math.abs(macd.histogram) * 100
    const bollingerStrength = bollinger.width * 100

    return {
      rsi: Math.min(rsiStrength, 100),
      macd: Math.min(macdStrength, 100),
      bollinger: Math.min(bollingerStrength, 100)
    }
  }
}

export const technicalIndicatorsService = TechnicalIndicatorsService.getInstance()