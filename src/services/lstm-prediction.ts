import { HistoricalPrice } from "@/types"

interface LSTMPrediction {
  price: number
  confidence: number
  trend: "up" | "down" | "neutral"
  volatility: number
}

export class LSTMPredictionService {
  private static instance: LSTMPredictionService
  private model: any = null
  private scaler: any = null
  private sequenceLength = 30
  private predictionHorizon = 7

  private constructor() {
    this.initializeModel()
  }

  public static getInstance(): LSTMPredictionService {
    if (!LSTMPredictionService.instance) {
      LSTMPredictionService.instance = new LSTMPredictionService()
    }
    return LSTMPredictionService.instance
  }

  private async initializeModel() {
    try {
      // Cargar el modelo pre-entrenado
      const response = await fetch('/api/lstm-model')
      const modelData = await response.json()
      this.model = modelData.model
      this.scaler = modelData.scaler
    } catch (error) {
      console.error('Error al inicializar el modelo LSTM:', error)
    }
  }

  private preprocessData(data: HistoricalPrice[]): number[] {
    // Extraer solo los precios
    return data.map(item => item.price)
  }

  private normalizeData(data: number[]): number[] {
    if (!this.scaler) {
      throw new Error('Scaler no inicializado')
    }
    return this.scaler.transform(data)
  }

  private createSequences(data: number[]): number[][] {
    const sequences: number[][] = []
    for (let i = 0; i < data.length - this.sequenceLength; i++) {
      sequences.push(data.slice(i, i + this.sequenceLength))
    }
    return sequences
  }

  private calculateVolatility(prices: number[]): number {
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
    return Math.sqrt(variance) * Math.sqrt(252) // Volatilidad anualizada
  }

  private determineTrend(prices: number[]): "up" | "down" | "neutral" {
    const lastPrice = prices[prices.length - 1]
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const threshold = 0.01 // 1% de diferencia para considerar tendencia

    if (lastPrice > avgPrice * (1 + threshold)) return "up"
    if (lastPrice < avgPrice * (1 - threshold)) return "down"
    return "neutral"
  }

  public async predict(historicalData: HistoricalPrice[]): Promise<LSTMPrediction> {
    try {
      if (!this.model || !this.scaler) {
        throw new Error('Modelo o scaler no inicializado')
      }

      // Preprocesar y normalizar datos
      const prices = this.preprocessData(historicalData)
      const normalizedData = this.normalizeData(prices)
      const sequences = this.createSequences(normalizedData)

      // Realizar predicción
      const prediction = await this.model.predict(sequences[sequences.length - 1])
      const denormalizedPrice = this.scaler.inverseTransform(prediction)

      // Calcular métricas adicionales
      const volatility = this.calculateVolatility(prices)
      const trend = this.determineTrend(prices)

      // Calcular confianza basada en la volatilidad y la precisión histórica
      const confidence = Math.max(0, Math.min(100, 100 - (volatility * 100)))

      return {
        price: denormalizedPrice[0],
        confidence,
        trend,
        volatility
      }
    } catch (error) {
      console.error('Error en la predicción LSTM:', error)
      throw error
    }
  }

  public async trainModel(newData: HistoricalPrice[]): Promise<void> {
    try {
      // Implementar lógica de entrenamiento del modelo
      // Esto podría incluir:
      // 1. Preprocesamiento de nuevos datos
      // 2. Ajuste de hiperparámetros
      // 3. Entrenamiento incremental
      // 4. Validación del modelo
      console.log('Entrenamiento del modelo iniciado con nuevos datos')
    } catch (error) {
      console.error('Error en el entrenamiento del modelo:', error)
      throw error
    }
  }
}

export const lstmPredictionService = LSTMPredictionService.getInstance() 