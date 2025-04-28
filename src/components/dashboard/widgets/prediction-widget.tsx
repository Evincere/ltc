import React from "react"
import { WidgetBase } from "./widget-base"
import { Icons } from "@/components/icons"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PredictionWidgetProps {
  currentPrice: number
  prediction: {
    values: number[]
    timestamps: number[]
    confidence: number
  }
  onRemove?: () => void
  onConfigure?: () => void
}

export function PredictionWidget({
  currentPrice,
  prediction,
  onRemove,
  onConfigure
}: PredictionWidgetProps) {
  // Preparar datos para el gráfico
  const chartData = prediction.timestamps.map((timestamp, index) => ({
    date: new Date(timestamp).toLocaleDateString(),
    price: prediction.values[index]
  }))

  // Calcular cambio porcentual
  const lastPredictedPrice = prediction.values && prediction.values.length > 0
    ? prediction.values[prediction.values.length - 1]
    : 0;
  const priceChange = !isNaN(lastPredictedPrice) && !isNaN(currentPrice)
    ? lastPredictedPrice - currentPrice
    : 0;
  const percentChange = !isNaN(priceChange) && !isNaN(currentPrice) && currentPrice !== 0
    ? (priceChange / currentPrice) * 100
    : 0;

  return (
    <WidgetBase
      title="Predicción de Precio"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Precio Actual</p>
            <p className="text-lg font-bold">${isNaN(currentPrice) ? '0.00' : currentPrice.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Predicción (7 días)</p>
            <p className="text-lg font-bold">${isNaN(lastPredictedPrice) ? '0.00' : lastPredictedPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${percentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {percentChange >= 0 ? '+' : ''}{isNaN(percentChange) ? '0.00' : percentChange.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Confianza: {isNaN(prediction.confidence) ? '0' : (prediction.confidence * 100).toFixed(0)}%
          </p>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.split('/')[1] + '/' + value.split('/')[0]}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(value: any) => [`$${value}`, 'Precio']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icons.info className="h-3 w-3" />
            <p>Basado en modelo BiLSTM entrenado con datos históricos</p>
          </div>
        </div>
      </div>
    </WidgetBase>
  )
}
