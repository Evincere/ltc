"use client";

import React, { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Icons } from '@/components/icons'
import { WidgetBase } from '@/components/dashboard/widgets/widget-base'
import { sentimentAnalysisService } from '@/services/sentiment-analysis'
import { SentimentData } from '@/types'

interface SentimentWidgetProps {
  onRemove?: () => void
  onConfigure?: () => void
}

export function SentimentWidget({ onRemove, onConfigure }: SentimentWidgetProps) {
  const [overallSentiment, setOverallSentiment] = useState<SentimentData>({
    sentiment: 'neutral',
    score: 0
  })
  const [platformSentiments, setPlatformSentiments] = useState<{
    [key: string]: SentimentData
  }>({})

  useEffect(() => {
    const fetchSentiment = async () => {
      const overall = await sentimentAnalysisService.getSentiment()
      setOverallSentiment(overall)

      const platforms = ['twitter', 'reddit', 'telegram']
      const platformData: { [key: string]: SentimentData } = {}

      for (const platform of platforms) {
        const sentiment = await sentimentAnalysisService.getPlatformSentiment(
          platform as 'twitter' | 'reddit' | 'telegram'
        )
        platformData[platform] = sentiment
      }

      setPlatformSentiments(platformData)
    }

    fetchSentiment()
    const interval = setInterval(fetchSentiment, 5 * 60 * 1000) // Actualizar cada 5 minutos

    return () => clearInterval(interval)
  }, [])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Icons.trendingUp className="h-5 w-5 text-green-500" />
      case 'negative':
        return <Icons.trendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Icons.minus className="h-5 w-5 text-yellow-500" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Icons.twitter className="h-4 w-4" />
      case 'reddit':
        return <Icons.reddit className="h-4 w-4" />
      case 'telegram':
        return <Icons.telegram className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <WidgetBase
      title="Análisis de Sentimiento"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sentimiento General</span>
          <div className="flex items-center space-x-2">
            {getSentimentIcon(overallSentiment.sentiment)}
            <span className="text-sm font-medium">
              {overallSentiment.sentiment === 'positive' ? 'Positivo' :
               overallSentiment.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Puntuación</span>
            <span>{Math.round(overallSentiment.score)}%</span>
          </div>
          <Progress value={overallSentiment.score} />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Por Plataforma</h4>
          {Object.entries(platformSentiments).map(([platform, sentiment]) => (
            <div key={platform} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {getPlatformIcon(platform)}
                  <span className="capitalize">{platform}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(sentiment.sentiment)}
                  <span>{Math.round(sentiment.score)}%</span>
                </div>
              </div>
              <Progress value={sentiment.score} />
            </div>
          ))}
        </div>
      </div>
    </WidgetBase>
  )
}