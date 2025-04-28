// Servicio para comparar Litecoin con otros activos criptográficos

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
}

export interface ComparisonMetric {
  name: string;
  description: string;
  getValue: (asset: CryptoAsset) => number | string;
  format: (value: number | string) => string;
  higherIsBetter: boolean;
}

export interface ComparisonResult {
  baseAsset: CryptoAsset;
  comparedAssets: CryptoAsset[];
  metrics: ComparisonMetric[];
  timestamp: number;
}

class CryptoComparisonService {
  private cachedAssets: CryptoAsset[] = [];
  private lastFetchTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutos
  
  /**
   * Obtiene datos de múltiples criptomonedas
   */
  public async getAssets(assetIds: string[] = []): Promise<CryptoAsset[]> {
    const now = Date.now();
    
    // Usar caché si está disponible y es reciente
    if (this.cachedAssets.length > 0 && (now - this.lastFetchTime < this.cacheDuration)) {
      if (assetIds.length === 0) {
        return this.cachedAssets;
      }
      return this.cachedAssets.filter(asset => assetIds.includes(asset.id));
    }
    
    try {
      // En un entorno real, haríamos una llamada a la API de CoinGecko o similar
      // Para este ejemplo, generamos datos simulados
      const assets = this.generateSimulatedAssets();
      
      this.cachedAssets = assets;
      this.lastFetchTime = now;
      
      if (assetIds.length === 0) {
        return assets;
      }
      return assets.filter(asset => assetIds.includes(asset.id));
    } catch (error) {
      console.error('Error fetching crypto assets:', error);
      
      // Si hay un error pero tenemos caché, devolver la caché aunque sea antigua
      if (this.cachedAssets.length > 0) {
        if (assetIds.length === 0) {
          return this.cachedAssets;
        }
        return this.cachedAssets.filter(asset => assetIds.includes(asset.id));
      }
      
      throw error;
    }
  }
  
  /**
   * Obtiene datos históricos de precio para múltiples criptomonedas
   */
  public async getHistoricalPrices(
    assetIds: string[],
    days: number = 30
  ): Promise<Record<string, Array<{ timestamp: number; price: number }>>> {
    try {
      // En un entorno real, haríamos una llamada a la API
      // Para este ejemplo, generamos datos simulados
      const result: Record<string, Array<{ timestamp: number; price: number }>> = {};
      
      for (const assetId of assetIds) {
        result[assetId] = this.generateSimulatedPriceHistory(assetId, days);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      throw error;
    }
  }
  
  /**
   * Compara Litecoin con otros activos
   */
  public async compareWithOtherAssets(
    comparedAssetIds: string[] = ['bitcoin', 'ethereum', 'ripple', 'cardano']
  ): Promise<ComparisonResult> {
    // Asegurarse de que Litecoin esté incluido
    const assetIds = ['litecoin', ...comparedAssetIds.filter(id => id !== 'litecoin')];
    
    // Obtener datos de los activos
    const assets = await this.getAssets(assetIds);
    
    // Encontrar Litecoin
    const litecoin = assets.find(asset => asset.id === 'litecoin');
    if (!litecoin) {
      throw new Error('Litecoin data not found');
    }
    
    // Filtrar otros activos
    const otherAssets = assets.filter(asset => asset.id !== 'litecoin');
    
    // Definir métricas de comparación
    const metrics: ComparisonMetric[] = [
      {
        name: 'Precio Actual',
        description: 'Precio actual en USD',
        getValue: (asset) => asset.currentPrice,
        format: (value) => `$${(value as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        higherIsBetter: true
      },
      {
        name: 'Capitalización de Mercado',
        description: 'Valor total del activo en circulación',
        getValue: (asset) => asset.marketCap,
        format: (value) => `$${(value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        higherIsBetter: true
      },
      {
        name: 'Volumen 24h',
        description: 'Volumen de trading en las últimas 24 horas',
        getValue: (asset) => asset.volume24h,
        format: (value) => `$${(value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        higherIsBetter: true
      },
      {
        name: 'Cambio 24h',
        description: 'Cambio porcentual en las últimas 24 horas',
        getValue: (asset) => asset.priceChangePercentage24h,
        format: (value) => `${(value as number).toFixed(2)}%`,
        higherIsBetter: true
      },
      {
        name: 'Suministro Circulante',
        description: 'Cantidad de monedas en circulación',
        getValue: (asset) => asset.circulatingSupply,
        format: (value) => (value as number).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        higherIsBetter: false // Neutral
      },
      {
        name: 'Suministro Máximo',
        description: 'Cantidad máxima de monedas que existirán',
        getValue: (asset) => asset.maxSupply || 'Ilimitado',
        format: (value) => typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value as string,
        higherIsBetter: false // Neutral
      },
      {
        name: 'Distancia al ATH',
        description: 'Porcentaje por debajo del máximo histórico',
        getValue: (asset) => asset.athChangePercentage,
        format: (value) => `${Math.abs(value as number).toFixed(2)}%`,
        higherIsBetter: false
      }
    ];
    
    return {
      baseAsset: litecoin,
      comparedAssets: otherAssets,
      metrics,
      timestamp: Date.now()
    };
  }
  
  /**
   * Calcula correlaciones entre Litecoin y otros activos
   */
  public async calculateCorrelations(
    comparedAssetIds: string[] = ['bitcoin', 'ethereum', 'ripple', 'cardano'],
    days: number = 30
  ): Promise<Array<{ assetId: string; name: string; correlation: number }>> {
    // Obtener datos históricos
    const assetIds = ['litecoin', ...comparedAssetIds.filter(id => id !== 'litecoin')];
    const historicalPrices = await this.getHistoricalPrices(assetIds, days);
    
    // Obtener precios de Litecoin
    const litecoinPrices = historicalPrices['litecoin'].map(item => item.price);
    
    // Calcular correlaciones
    const correlations: Array<{ assetId: string; name: string; correlation: number }> = [];
    
    for (const assetId of comparedAssetIds) {
      if (assetId === 'litecoin') continue;
      
      const assetPrices = historicalPrices[assetId].map(item => item.price);
      const correlation = this.calculatePearsonCorrelation(litecoinPrices, assetPrices);
      
      // Obtener nombre del activo
      const asset = this.cachedAssets.find(a => a.id === assetId);
      const name = asset ? asset.name : assetId;
      
      correlations.push({
        assetId,
        name,
        correlation
      });
    }
    
    // Ordenar por correlación (de mayor a menor)
    return correlations.sort((a, b) => b.correlation - a.correlation);
  }
  
  /**
   * Genera activos simulados para demostración
   */
  private generateSimulatedAssets(): CryptoAsset[] {
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        currentPrice: 50000 + Math.random() * 5000,
        marketCap: 950000000000 + Math.random() * 50000000000,
        marketCapRank: 1,
        volume24h: 30000000000 + Math.random() * 5000000000,
        priceChange24h: Math.random() * 1000 - 500,
        priceChangePercentage24h: Math.random() * 10 - 5,
        circulatingSupply: 19000000 + Math.random() * 100000,
        totalSupply: 21000000,
        maxSupply: 21000000,
        ath: 69000,
        athChangePercentage: -25 + Math.random() * 10,
        athDate: '2021-11-10T14:24:11.849Z',
        atl: 67.81,
        atlChangePercentage: 70000 + Math.random() * 10000,
        atlDate: '2013-07-06T00:00:00.000Z'
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        currentPrice: 3000 + Math.random() * 300,
        marketCap: 350000000000 + Math.random() * 20000000000,
        marketCapRank: 2,
        volume24h: 15000000000 + Math.random() * 3000000000,
        priceChange24h: Math.random() * 100 - 50,
        priceChangePercentage24h: Math.random() * 10 - 5,
        circulatingSupply: 120000000 + Math.random() * 100000,
        totalSupply: 120000000 + Math.random() * 100000,
        maxSupply: null,
        ath: 4878.26,
        athChangePercentage: -35 + Math.random() * 10,
        athDate: '2021-11-10T14:24:19.604Z',
        atl: 0.432979,
        atlChangePercentage: 700000 + Math.random() * 100000,
        atlDate: '2015-10-20T00:00:00.000Z'
      },
      {
        id: 'litecoin',
        symbol: 'ltc',
        name: 'Litecoin',
        image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
        currentPrice: 80 + Math.random() * 10,
        marketCap: 6000000000 + Math.random() * 500000000,
        marketCapRank: 15,
        volume24h: 500000000 + Math.random() * 100000000,
        priceChange24h: Math.random() * 5 - 2.5,
        priceChangePercentage24h: Math.random() * 10 - 5,
        circulatingSupply: 73000000 + Math.random() * 100000,
        totalSupply: 84000000,
        maxSupply: 84000000,
        ath: 410.26,
        athChangePercentage: -80 + Math.random() * 10,
        athDate: '2021-05-10T07:24:46.763Z',
        atl: 1.15,
        atlChangePercentage: 7000 + Math.random() * 1000,
        atlDate: '2015-01-14T00:00:00.000Z'
      },
      {
        id: 'ripple',
        symbol: 'xrp',
        name: 'XRP',
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        currentPrice: 0.5 + Math.random() * 0.1,
        marketCap: 25000000000 + Math.random() * 2000000000,
        marketCapRank: 5,
        volume24h: 1000000000 + Math.random() * 200000000,
        priceChange24h: Math.random() * 0.05 - 0.025,
        priceChangePercentage24h: Math.random() * 10 - 5,
        circulatingSupply: 50000000000 + Math.random() * 1000000000,
        totalSupply: 100000000000,
        maxSupply: 100000000000,
        ath: 3.4,
        athChangePercentage: -85 + Math.random() * 10,
        athDate: '2018-01-07T00:00:00.000Z',
        atl: 0.002802,
        atlChangePercentage: 18000 + Math.random() * 2000,
        atlDate: '2014-05-22T00:00:00.000Z'
      },
      {
        id: 'cardano',
        symbol: 'ada',
        name: 'Cardano',
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        currentPrice: 0.3 + Math.random() * 0.05,
        marketCap: 10000000000 + Math.random() * 1000000000,
        marketCapRank: 8,
        volume24h: 300000000 + Math.random() * 50000000,
        priceChange24h: Math.random() * 0.03 - 0.015,
        priceChangePercentage24h: Math.random() * 10 - 5,
        circulatingSupply: 35000000000 + Math.random() * 100000000,
        totalSupply: 45000000000,
        maxSupply: 45000000000,
        ath: 3.09,
        athChangePercentage: -90 + Math.random() * 10,
        athDate: '2021-09-02T06:00:10.474Z',
        atl: 0.01925275,
        atlChangePercentage: 1500 + Math.random() * 200,
        atlDate: '2020-03-13T02:22:55.044Z'
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        currentPrice: 100 + Math.random() * 20,
        marketCap: 40000000000 + Math.random() * 5000000000,
        marketCapRank: 6,
        volume24h: 2000000000 + Math.random() * 500000000,
        priceChange24h: Math.random() * 10 - 5,
        priceChangePercentage24h: Math.random() * 10 - 5,
        circulatingSupply: 400000000 + Math.random() * 10000000,
        totalSupply: 500000000,
        maxSupply: null,
        ath: 259.96,
        athChangePercentage: -60 + Math.random() * 10,
        athDate: '2021-11-06T21:54:35.825Z',
        atl: 0.500801,
        atlChangePercentage: 20000 + Math.random() * 5000,
        atlDate: '2020-05-11T19:35:23.449Z'
      }
    ];
  }
  
  /**
   * Genera un historial de precios simulado
   */
  private generateSimulatedPriceHistory(
    assetId: string,
    days: number
  ): Array<{ timestamp: number; price: number }> {
    const result: Array<{ timestamp: number; price: number }> = [];
    const now = Date.now();
    
    // Obtener precio actual del activo
    const asset = this.cachedAssets.find(a => a.id === assetId);
    const currentPrice = asset ? asset.currentPrice : 100;
    
    // Parámetros de simulación
    let basePrice = currentPrice;
    let volatility = 0.02; // 2% diario
    
    // Ajustar volatilidad según el activo
    switch (assetId) {
      case 'bitcoin':
        volatility = 0.03;
        break;
      case 'ethereum':
        volatility = 0.04;
        break;
      case 'litecoin':
        volatility = 0.035;
        break;
      case 'ripple':
        volatility = 0.05;
        break;
      case 'cardano':
        volatility = 0.06;
        break;
      case 'solana':
        volatility = 0.07;
        break;
    }
    
    // Tendencia (positiva o negativa)
    const trend = Math.random() > 0.5 ? 0.002 : -0.002; // ±0.2% diario
    
    // Generar precios históricos (de más reciente a más antiguo)
    for (let i = 0; i < days; i++) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      
      // Para el día actual, usar el precio actual
      if (i === 0) {
        result.push({
          timestamp,
          price: currentPrice
        });
        continue;
      }
      
      // Para días anteriores, simular precios
      // Calcular cambio diario
      const change = basePrice * (trend + (Math.random() - 0.5) * volatility);
      basePrice -= change; // Restamos porque vamos hacia atrás en el tiempo
      
      // Asegurar que el precio no sea negativo
      basePrice = Math.max(0.01, basePrice);
      
      result.push({
        timestamp,
        price: basePrice
      });
    }
    
    // Ordenar por timestamp (de más antiguo a más reciente)
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  /**
   * Calcula la correlación de Pearson entre dos series de datos
   */
  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    
    // Calcular medias
    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    // Calcular covarianza y varianzas
    let covXY = 0;
    let varX = 0;
    let varY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      
      covXY += diffX * diffY;
      varX += diffX * diffX;
      varY += diffY * diffY;
    }
    
    // Evitar división por cero
    if (varX === 0 || varY === 0) {
      return 0;
    }
    
    // Calcular correlación
    return covXY / Math.sqrt(varX * varY);
  }
}

export const cryptoComparisonService = new CryptoComparisonService();
