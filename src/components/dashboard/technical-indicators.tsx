import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface IndicatorProps {
  name: string
  value: number
  signal: "buy" | "sell" | "neutral"
  strength: number
}

const Indicator = ({ name, value, signal, strength }: IndicatorProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{value.toFixed(2)}</span>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            signal === "buy" && "bg-green-100 text-green-800",
            signal === "sell" && "bg-red-100 text-red-800",
            signal === "neutral" && "bg-yellow-100 text-yellow-800"
          )}>
            {signal.toUpperCase()}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Fuerza de la señal</span>
            <span>{strength}%</span>
          </div>
          <Progress value={strength} className={cn(
            "h-2",
            signal === "buy" && "bg-green-100",
            signal === "sell" && "bg-red-100",
            signal === "neutral" && "bg-yellow-100"
          )} />
        </div>
      </CardContent>
    </Card>
  )
}

interface TechnicalIndicatorsProps {
  indicators: {
    rsi: number
    macd: number
    bollinger: number
    volume: number
  }
}

export function TechnicalIndicators({ indicators }: TechnicalIndicatorsProps) {
  const getSignal = (value: number, threshold: number = 50): "buy" | "sell" | "neutral" => {
    if (value > threshold + 10) return "sell"
    if (value < threshold - 10) return "buy"
    return "neutral"
  }

  const getStrength = (value: number, threshold: number = 50): number => {
    return Math.min(Math.abs(value - threshold) * 2, 100)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Indicator
        name="RSI"
        value={indicators.rsi}
        signal={getSignal(indicators.rsi, 50)}
        strength={getStrength(indicators.rsi, 50)}
      />
      <Indicator
        name="MACD"
        value={indicators.macd}
        signal={getSignal(indicators.macd)}
        strength={getStrength(indicators.macd)}
      />
      <Indicator
        name="Bollinger"
        value={indicators.bollinger}
        signal={getSignal(indicators.bollinger)}
        strength={getStrength(indicators.bollinger)}
      />
      <Indicator
        name="Volumen"
        value={indicators.volume}
        signal={getSignal(indicators.volume)}
        strength={getStrength(indicators.volume)}
      />
    </div>
  )
} 