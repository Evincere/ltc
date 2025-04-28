import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: keyof typeof Icons
  description?: string
}

const MetricCard = ({ title, value, change, icon, description }: MetricCardProps) => {
  const Icon = Icons[icon]
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs text-muted-foreground",
            isPositive && "text-green-500",
            isNegative && "text-red-500"
          )}>
            {isPositive ? "+" : ""}{change}% desde ayer
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface SummaryPanelProps {
  currentPrice: number
  predictedPrice: number
  confidence: number
  volume: number
  sentiment: string
}

export function SummaryPanel({
  currentPrice,
  predictedPrice,
  confidence,
  volume,
  sentiment
}: SummaryPanelProps) {
  const priceChange = predictedPrice && currentPrice
    ? ((predictedPrice - currentPrice) / currentPrice) * 100
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Precio Actual"
        value={`$${currentPrice.toFixed(2)}`}
        icon="dollarSign"
      />
      <MetricCard
        title="Predicción"
        value={`$${predictedPrice.toFixed(2)}`}
        change={priceChange}
        icon="trendingUp"
        description={`Confianza: ${confidence.toFixed(1)}%`}
      />
      <MetricCard
        title="Volumen 24h"
        value={`$${(volume / 1000000).toFixed(1)}M`}
        icon="activity"
      />
      <MetricCard
        title="Sentimiento"
        value={sentiment}
        icon="barChart"
      />
    </div>
  )
} 