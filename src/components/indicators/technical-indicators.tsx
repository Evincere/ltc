"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface TechnicalIndicator {
  name: string
  value: number
  previousValue: number
  signal: "buy" | "sell" | "neutral"
}

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicator[]
}

export function TechnicalIndicators({ indicators }: TechnicalIndicatorsProps) {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "buy":
        return "text-green-500"
      case "sell":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "buy":
        return <ArrowUp className="h-4 w-4" />
      case "sell":
        return <ArrowDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores Técnicos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {indicators.map((indicator, index) => (
            <motion.div
              key={indicator.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{indicator.name}</span>
                <span className={getSignalColor(indicator.signal)}>
                  {getSignalIcon(indicator.signal)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono">{indicator.value.toFixed(2)}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm ${
                    indicator.value > indicator.previousValue
                      ? "text-green-500"
                      : indicator.value < indicator.previousValue
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {indicator.value > indicator.previousValue ? "+" : ""}
                  {((indicator.value - indicator.previousValue) /
                    indicator.previousValue) *
                    100}
                  %
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 