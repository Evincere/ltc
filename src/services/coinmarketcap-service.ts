"use client";

import { HistoricalPrice, TechnicalIndicators } from '@/types';
import { coinmarketcapAPI } from './coinmarketcap-api';
import { technicalIndicatorsService } from './technical-indicators';

class CoinMarketCapService {
  private static instance: CoinMarketCapService;
  private currentPrice: number = 0;
  private lastUpdated: number = 0;
  private updateInterval: number = 60 * 1000; // 1 minuto
  private symbol: string = 'LTC'; // Litecoin por defecto

  private constructor() {}

  public static getInstance(): CoinMarketCapService {
    if (!CoinMarketCapService.instance) {
      CoinMarketCapService.instance = new CoinMarketCapService();
    }
    return CoinMarketCapService.instance;
  }

  /**
   * Establece el símbolo de la criptomoneda a seguir
   */
  public setSymbol(symbol: string): void {
    this.symbol = symbol;
    // Resetear el precio actual para forzar una nueva consulta
    this.currentPrice = 0;
    this.lastUpdated = 0;
  }

  /**
   * Obtiene el símbolo de la criptomoneda actual
   */
  public getSymbol(): string {
    return this.symbol;
  }

  /**
   * Obtiene el precio actual de la criptomoneda
   */
  public async getCurrentPrice(): Promise<number> {
    const now = Date.now();
    
    // Si el precio es reciente, devolverlo directamente
    if (this.currentPrice > 0 && now - this.lastUpdated < this.updateInterval) {
      return this.currentPrice;
    }
    
    try {
      // Obtener el precio actual de la API
      const price = await coinmarketcapAPI.getCurrentPrice(this.symbol);
      
      this.currentPrice = price;
      this.lastUpdated = now;
      
      return price;
    } catch (error) {
      console.error(`Error fetching current price for ${this.symbol}:`, error);
      
      // Si hay un error pero tenemos un precio anterior, devolverlo
      if (this.currentPrice > 0) {
        return this.currentPrice;
      }
      
      // Si no hay precio anterior, devolver un valor por defecto
      return this.symbol === 'LTC' ? 80 : 0;
    }
  }

  /**
   * Obtiene datos históricos de la criptomoneda
   */
  public async getHistoricalData(days: number = 30): Promise<HistoricalPrice[]> {
    try {
      return await coinmarketcapAPI.getHistoricalPrices(this.symbol, 'USD', days);
    } catch (error) {
      console.error(`Error fetching historical data for ${this.symbol}:`, error);
      return [];
    }
  }

  /**
   * Obtiene indicadores técnicos basados en datos históricos
   */
  public async getTechnicalIndicators(): Promise<TechnicalIndicators> {
    try {
      // Obtener datos históricos
      const historicalData = await this.getHistoricalData(30);
      
      if (historicalData.length === 0) {
        throw new Error('No hay datos históricos disponibles');
      }
      
      // Extraer precios
      const prices = historicalData.map(data => data.price);
      
      // Calcular indicadores técnicos
      return technicalIndicatorsService.calculateIndicators(prices);
    } catch (error) {
      console.error(`Error calculating technical indicators for ${this.symbol}:`, error);
      
      // Devolver valores por defecto
      return {
        rsi: 50,
        macd: 0,
        bollinger: 0
      };
    }
  }

  /**
   * Obtiene las principales criptomonedas por capitalización de mercado
   */
  public async getTopCryptocurrencies(limit: number = 10): Promise<any[]> {
    try {
      return await coinmarketcapAPI.getTopCryptocurrencies(limit);
    } catch (error) {
      console.error('Error fetching top cryptocurrencies:', error);
      return [];
    }
  }

  /**
   * Obtiene métricas globales del mercado de criptomonedas
   */
  public async getGlobalMetrics(): Promise<any> {
    try {
      return await coinmarketcapAPI.getGlobalMetrics();
    } catch (error) {
      console.error('Error fetching global metrics:', error);
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        btcDominance: 0,
        ethDominance: 0,
        activeCryptocurrencies: 0,
        totalExchanges: 0
      };
    }
  }

  /**
   * Obtiene métricas on-chain de Litecoin (simuladas por ahora)
   * En una versión futura, esto se conectará a una API real de datos on-chain
   */
  public async getLitecoinOnChainMetrics(): Promise<{ 
    transactions: number; 
    volume: number; 
    activeAddresses: number 
  }> {
    // Por ahora, devolvemos datos simulados
    // En una versión futura, esto se conectará a una API real de datos on-chain
    return {
      transactions: 12345 + Math.floor(Math.random() * 1000),
      volume: 67890 + Math.floor(Math.random() * 5000),
      activeAddresses: 101112 + Math.floor(Math.random() * 500)
    };
  }

  /**
   * Obtiene datos de sentimiento para Litecoin (simulados por ahora)
   * En una versión futura, esto se conectará a una API real de análisis de sentimiento
   */
  public async getLitecoinSentiment(): Promise<{ 
    sentiment: string; 
    score: number 
  }> {
    // Por ahora, devolvemos datos simulados
    // En una versión futura, esto se conectará a una API real de análisis de sentimiento
    const score = 0.5 + (Math.random() * 0.5);
    let sentiment = 'Neutral';
    
    if (score > 0.7) {
      sentiment = 'Positivo';
    } else if (score < 0.3) {
      sentiment = 'Negativo';
    }
    
    return { sentiment, score };
  }
}

export const coinmarketcapService = CoinMarketCapService.getInstance();
