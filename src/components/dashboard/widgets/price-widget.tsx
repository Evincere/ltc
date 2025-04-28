import React from "react"
import { WidgetBase } from "./widget-base"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface PriceWidgetProps {
  currentPrice: number
  predictedPrice: number
  confidence: number
  onRemove?: () => void
  onConfigure?: () => void
}

export function PriceWidget({
  currentPrice,
  predictedPrice,
  confidence,
  onRemove,
  onConfigure
}: PriceWidgetProps) {
  const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100
  const isPositive = priceChange > 0

  return (
    <WidgetBase
      title="Precio y Predicción"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Precio Actual</p>
            <p className="text-2xl font-bold">${isNaN(currentPrice) ? '0.00' : currentPrice.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Predicción</p>
            <p className={cn(
              "text-2xl font-bold",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              ${isNaN(predictedPrice) ? '0.00' : predictedPrice.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icons.trendingUp className={cn(
              "h-4 w-4",
              isPositive ? "text-green-500" : "text-red-500"
            )} />
            <span className={cn(
              "text-sm",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? "+" : ""}{isNaN(priceChange) ? '0.00' : priceChange.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icons.info className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-500">
              {isNaN(confidence) ? '0.0' : confidence.toFixed(1)}% confianza
            </span>
          </div>
        </div>
      </div>
    </WidgetBase>
  )
}