import { NextResponse } from 'next/server'
import { LSTMPredictionService } from '@/services/lstm-prediction'

export async function GET() {
  try {
    const lstmService = LSTMPredictionService.getInstance()
    
    // Aquí normalmente cargaríamos el modelo y el scaler desde un almacenamiento persistente
    // Por ahora, devolvemos un modelo y scaler de ejemplo
    const model = {
      predict: async (sequence: number[]) => {
        // Simulación de predicción
        const lastPrice = sequence[sequence.length - 1]
        const randomFactor = (Math.random() - 0.5) * 0.1 // Variación aleatoria del 10%
        return [lastPrice * (1 + randomFactor)]
      }
    }

    const scaler = {
      transform: (data: number[]) => {
        // Simulación de normalización
        const min = Math.min(...data)
        const max = Math.max(...data)
        return data.map(x => (x - min) / (max - min))
      },
      inverseTransform: (data: number[]) => {
        // Simulación de desnormalización
        const min = 0 // Valor mínimo del rango original
        const max = 1000 // Valor máximo del rango original
        return data.map(x => x * (max - min) + min)
      }
    }

    return NextResponse.json({ model, scaler })
  } catch (error) {
    console.error('Error al cargar el modelo LSTM:', error)
    return NextResponse.json(
      { error: 'Error al cargar el modelo LSTM' },
      { status: 500 }
    )
  }
} 