import { SentimentData } from '@/types'

interface SocialMediaPost {
  platform: 'twitter' | 'reddit' | 'telegram'
  content: string
  timestamp: number
  likes?: number
  retweets?: number
  comments?: number
}

export class SentimentAnalysisService {
  private static instance: SentimentAnalysisService
  private posts: SocialMediaPost[] = []
  private updateInterval = 5 * 60 * 1000 // 5 minutos

  private constructor() {
    this.startDataCollection()
  }

  public static getInstance(): SentimentAnalysisService {
    if (!SentimentAnalysisService.instance) {
      SentimentAnalysisService.instance = new SentimentAnalysisService()
    }
    return SentimentAnalysisService.instance
  }

  private async startDataCollection() {
    await this.collectData()
    setInterval(() => this.collectData(), this.updateInterval)
  }

  private async collectData() {
    try {
      // Simulación de recolección de datos de redes sociales
      const newPosts: SocialMediaPost[] = [
        {
          platform: 'twitter',
          content: 'Litecoin showing strong momentum! #LTC #Crypto',
          timestamp: Date.now(),
          likes: 150,
          retweets: 45
        },
        {
          platform: 'reddit',
          content: 'LTC price prediction for next week?',
          timestamp: Date.now(),
          likes: 30,
          comments: 15
        },
        {
          platform: 'telegram',
          content: 'Litecoin breaking resistance levels!',
          timestamp: Date.now()
        }
      ]

      this.posts = [...this.posts, ...newPosts]
      // Mantener solo los últimos 1000 posts
      if (this.posts.length > 1000) {
        this.posts = this.posts.slice(-1000)
      }
    } catch (error) {
      console.error('Error al recolectar datos de redes sociales:', error)
    }
  }

  private analyzeSentiment(posts: SocialMediaPost[]): SentimentData {
    // Simulación de análisis de sentimiento
    const positiveWords = ['strong', 'bullish', 'up', 'moon', 'buy']
    const negativeWords = ['weak', 'bearish', 'down', 'dump', 'sell']

    let positiveCount = 0
    let negativeCount = 0
    let totalWeight = 0

    posts.forEach(post => {
      const content = post.content.toLowerCase()
      const weight = (post.likes || 0) + (post.retweets || 0) + (post.comments || 0)

      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++
      })

      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++
      })

      totalWeight += weight
    })

    const totalSentiment = positiveCount - negativeCount
    const score = (totalSentiment / (positiveCount + negativeCount || 1)) * 100

    return {
      sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
      score: Math.abs(score)
    }
  }

  public async getSentiment(): Promise<SentimentData> {
    try {
      // Filtrar posts de las últimas 24 horas
      const last24Hours = Date.now() - 24 * 60 * 60 * 1000
      const recentPosts = this.posts.filter(post => post.timestamp > last24Hours)

      return this.analyzeSentiment(recentPosts)
    } catch (error) {
      console.error('Error al obtener el sentimiento:', error)
      return {
        sentiment: 'neutral',
        score: 0
      }
    }
  }

  public async getPlatformSentiment(platform: 'twitter' | 'reddit' | 'telegram'): Promise<SentimentData> {
    try {
      const platformPosts = this.posts.filter(post => post.platform === platform)
      return this.analyzeSentiment(platformPosts)
    } catch (error) {
      console.error(`Error al obtener el sentimiento de ${platform}:`, error)
      return {
        sentiment: 'neutral',
        score: 0
      }
    }
  }
}

export const sentimentAnalysisService = SentimentAnalysisService.getInstance() 