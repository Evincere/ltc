import React from "react"
import { WidgetBase } from "./widget-base"
import { Icons } from "@/components/icons"
import { Progress } from "@/components/ui/progress"

interface SentimentWidgetProps {
  onRemove?: () => void
  onConfigure?: () => void
}

export function SentimentWidget({
  onRemove,
  onConfigure
}: SentimentWidgetProps) {
  // Datos simulados de sentimiento
  const sentimentData = {
    overall: 65, // 0-100, donde 50 es neutral
    twitter: 70,
    reddit: 62,
    news: 58
  }
  
  const getSentimentLabel = (value: number): string => {
    if (value >= 75) return "Muy Positivo"
    if (value >= 60) return "Positivo"
    if (value >= 40) return "Neutral"
    if (value >= 25) return "Negativo"
    return "Muy Negativo"
  }
  
  const getSentimentColor = (value: number): string => {
    if (value >= 75) return "bg-green-500"
    if (value >= 60) return "bg-green-400"
    if (value >= 40) return "bg-yellow-400"
    if (value >= 25) return "bg-red-400"
    return "bg-red-500"
  }
  
  return (
    <WidgetBase
      title="Análisis de Sentimiento"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Sentimiento General</p>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getSentimentColor(sentimentData.overall)}`} />
              <p className="text-sm">{getSentimentLabel(sentimentData.overall)}</p>
            </div>
          </div>
          <Progress value={sentimentData.overall} className="h-2" />
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Icons.twitter className="h-4 w-4 text-blue-400" />
                <p className="text-sm">Twitter</p>
              </div>
              <p className="text-sm font-medium">{sentimentData.twitter}%</p>
            </div>
            <Progress value={sentimentData.twitter} className="h-1.5" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Icons.info className="h-4 w-4 text-red-400" />
                <p className="text-sm">Reddit</p>
              </div>
              <p className="text-sm font-medium">{sentimentData.reddit}%</p>
            </div>
            <Progress value={sentimentData.reddit} className="h-1.5" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Icons.fileCode className="h-4 w-4 text-gray-400" />
                <p className="text-sm">Noticias</p>
              </div>
              <p className="text-sm font-medium">{sentimentData.news}%</p>
            </div>
            <Progress value={sentimentData.news} className="h-1.5" />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Actualizado: {new Date().toLocaleString()}
        </div>
      </div>
    </WidgetBase>
  )
}
