"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PriceChartProps {
  data: {
    timestamp: number
    price: number
    prediction?: number
    confidence?: number
  }[]
}

export function PriceChart({ data }: PriceChartProps) {
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, HH:mm", { locale: es })
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Precio y Predicción de LTC</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickFormatter={formatPrice}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Fecha
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {formatDate(label)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Precio
                            </span>
                            <span className="font-bold">
                              {formatPrice(payload[0].value as number)}
                            </span>
                          </div>
                          {payload[1] && (
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Predicción
                              </span>
                              <span className="font-bold text-primary">
                                {formatPrice(payload[1].value as number)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              {data[0]?.prediction && (
                <Area
                  type="monotone"
                  dataKey="prediction"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 