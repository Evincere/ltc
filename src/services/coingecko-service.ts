import { getHistoricalPrice } from './coingecko';
import { HistoricalPrice } from '@/types';

class CoingeckoService {
  private static instance: CoingeckoService;
  private currentPrice: number = 0;
  private lastUpdated: number = 0;
  private updateInterval: number = 60 * 1000; // 1 minuto

  private constructor() {}

  public static getInstance(): CoingeckoService {
    if (!CoingeckoService.instance) {
      CoingeckoService.instance = new CoingeckoService();
    }
    return CoingeckoService.instance;
  }

  /**
   * Obtiene el precio actual de Litecoin
   */
  public async getCurrentPrice(): Promise<number> {
    const now = Date.now();
    
    // Si el precio es reciente, devolverlo directamente
    if (this.currentPrice > 0 && now - this.lastUpdated < this.updateInterval) {
      return this.currentPrice;
    }
    
    try {
      // En un entorno real, haríamos una llamada a la API de CoinGecko
      // Para este ejemplo, simulamos un precio
      const simulatedPrice = 80 + (Math.random() * 10 - 5); // $80 +/- $5
      
      this.currentPrice = simulatedPrice;
      this.lastUpdated = now;
      
      return simulatedPrice;
    } catch (error) {
      console.error('Error fetching current price:', error);
      
      // Si hay un error pero tenemos un precio anterior, devolverlo
      if (this.currentPrice > 0) {
        return this.currentPrice;
      }
      
      // Si no hay precio anterior, devolver un valor por defecto
      return 80;
    }
  }

  /**
   * Obtiene datos históricos de Litecoin
   */
  public async getHistoricalData(days: number = 30): Promise<HistoricalPrice[]> {
    try {
      return await getHistoricalPrice('litecoin', 'usd', days);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }
}

export const coingeckoService = CoingeckoService.getInstance();
