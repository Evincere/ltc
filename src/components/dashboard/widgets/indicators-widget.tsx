import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Icons } from '@/components/icons'
import { WidgetBase } from './widget-base'
import { technicalIndicatorsService } from '@/services/technical-indicators'

interface Indicator {
  name: string
  value: number
  signal: "buy" | "sell" | "neutral"
  strength: number
}

interface IndicatorsWidgetProps {
  indicators: Indicator[]
  onRemove?: () => void
  onConfigure?: () => void
}

export function IndicatorsWidget({ indicators, onRemove, onConfigure }: IndicatorsWidgetProps) {
  const getSignalIcon = (signal: "buy" | "sell" | "neutral") => {
    switch (signal) {
      case "buy":
        return <Icons.trendingUp className="h-4 w-4 text-green-500" />
      case "sell":
        return <Icons.trendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Icons.minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSignalText = (signal: "buy" | "sell" | "neutral") => {
    switch (signal) {
      case "buy":
        return "Comprar"
      case "sell":
        return "Vender"
      default:
        return "Neutral"
    }
  }

  return (
    <WidgetBase
      title="Indicadores Técnicos"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        {indicators.map((indicator) => (
          <div key={indicator.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{indicator.name}</span>
                {getSignalIcon(indicator.signal)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {getSignalText(indicator.signal)}
                </span>
                <span className="text-sm font-medium">
                  {isNaN(indicator.value) ? '0' : Math.round(indicator.value)}
                </span>
              </div>
            </div>
            <Progress value={isNaN(indicator.strength) ? 0 : indicator.strength} />
          </div>
        ))}
      </div>
    </WidgetBase>
  )
}