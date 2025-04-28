import { cacheService } from './cacheService';
import { HistoricalData } from '@/types/market';

interface CoinGeckoResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export class CoinGeckoService {
  private static instance: CoinGeckoService;
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 segundo
  private readonly rateLimit = 10; // Llamadas por minuto
  private lastCallTime: number = 0;
  private callCount: number = 0;

  private constructor() {}

  public static getInstance(): CoinGeckoService {
    if (!CoinGeckoService.instance) {
      CoinGeckoService.instance = new CoinGeckoService();
    }
    return CoinGeckoService.instance;
  }

  public async getHistoricalData(
    coinId: string = 'litecoin',
    days: number = 30,
    interval: 'daily' | 'hourly' = 'daily'
  ): Promise<HistoricalData[]> {
    const cacheKey = `historical_${coinId}_${days}_${interval}`;
    const cachedData = cacheService.get<HistoricalData[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      await this.checkRateLimit();
      
      const response = await this.fetchWithRetry<CoinGeckoResponse>(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
      );

      const historicalData = this.transformResponse(response);
      cacheService.set(cacheKey, historicalData, 5 * 60 * 1000); // Cache por 5 minutos
      
      return historicalData;
    } catch (error) {
      console.error('Error al obtener datos históricos:', error);
      throw error;
    }
  }

  public async getCurrentPrice(coinId: string = 'litecoin'): Promise<number> {
    const cacheKey = `current_price_${coinId}`;
    const cachedPrice = cacheService.get<number>(cacheKey);
    
    if (cachedPrice) {
      return cachedPrice;
    }

    try {
      await this.checkRateLimit();
      
      const response = await this.fetchWithRetry<{ [key: string]: { usd: number } }>(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`
      );

      const price = response[coinId].usd;
      cacheService.set(cacheKey, price, 60 * 1000); // Cache por 1 minuto
      
      return price;
    } catch (error) {
      console.error('Error al obtener precio actual:', error);
      throw error;
    }
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < 60000) { // Menos de un minuto
      this.callCount++;
      if (this.callCount >= this.rateLimit) {
        const waitTime = 60000 - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.callCount = 0;
        this.lastCallTime = Date.now();
      }
    } else {
      this.callCount = 1;
      this.lastCallTime = now;
    }
  }

  private async fetchWithRetry<T>(url: string): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  private transformResponse(response: CoinGeckoResponse): HistoricalData[] {
    return response.prices.map(([timestamp, price], index) => ({
      timestamp: timestamp.toString(),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: response.total_volumes[index][1],
      marketCap: response.market_caps[index][1]
    }));
  }
}

export const coinGeckoService = CoinGeckoService.getInstance(); 