// Servicio para obtener y analizar métricas de red de Litecoin

export interface NetworkMetrics {
  hashRate: number;
  difficulty: number;
  activeAddresses: number;
  transactionCount: number;
  averageFee: number;
  blockTime: number;
  blockSize: number;
  mempoolSize: number;
  timestamp: number;
}

export interface NetworkMetricsHistory {
  daily: NetworkMetrics[];
  weekly: NetworkMetrics[];
  monthly: NetworkMetrics[];
}

export interface NetworkMetricsChange {
  hashRate: number;
  difficulty: number;
  activeAddresses: number;
  transactionCount: number;
  averageFee: number;
}

class NetworkMetricsService {
  private apiBaseUrl: string = 'https://api.blockchair.com/litecoin';
  private apiKey: string | null = null;
  private cachedMetrics: NetworkMetrics | null = null;
  private cachedHistory: NetworkMetricsHistory | null = null;
  private lastFetchTime: number = 0;
  private cacheDuration: number = 15 * 60 * 1000; // 15 minutos

  constructor() {
    // Intentar cargar la API key desde las variables de entorno
    this.apiKey = process.env.NEXT_PUBLIC_BLOCKCHAIR_API_KEY || null;
  }

  /**
   * Establece la clave de API para Blockchair
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Obtiene las métricas de red actuales
   */
  public async getCurrentMetrics(): Promise<NetworkMetrics> {
    const now = Date.now();
    
    // Usar caché si está disponible y es reciente
    if (this.cachedMetrics && (now - this.lastFetchTime < this.cacheDuration)) {
      return this.cachedMetrics;
    }
    
    try {
      // En un entorno real, haríamos una llamada a la API
      // Para este ejemplo, generamos datos simulados
      const metrics = this.generateSimulatedMetrics();
      
      this.cachedMetrics = metrics;
      this.lastFetchTime = now;
      
      return metrics;
    } catch (error) {
      console.error('Error fetching network metrics:', error);
      
      // Si hay un error pero tenemos caché, devolver la caché aunque sea antigua
      if (this.cachedMetrics) {
        return this.cachedMetrics;
      }
      
      throw error;
    }
  }

  /**
   * Obtiene el historial de métricas de red
   */
  public async getMetricsHistory(): Promise<NetworkMetricsHistory> {
    const now = Date.now();
    
    // Usar caché si está disponible y es reciente
    if (this.cachedHistory && (now - this.lastFetchTime < this.cacheDuration)) {
      return this.cachedHistory;
    }
    
    try {
      // En un entorno real, haríamos una llamada a la API
      // Para este ejemplo, generamos datos simulados
      const history = this.generateSimulatedHistory();
      
      this.cachedHistory = history;
      this.lastFetchTime = now;
      
      return history;
    } catch (error) {
      console.error('Error fetching network metrics history:', error);
      
      // Si hay un error pero tenemos caché, devolver la caché aunque sea antigua
      if (this.cachedHistory) {
        return this.cachedHistory;
      }
      
      throw error;
    }
  }

  /**
   * Calcula los cambios porcentuales en las métricas de red
   */
  public async getMetricsChanges(period: '24h' | '7d' | '30d' = '24h'): Promise<NetworkMetricsChange> {
    const history = await this.getMetricsHistory();
    
    let metrics: NetworkMetrics[];
    switch (period) {
      case '24h':
        metrics = history.daily;
        break;
      case '7d':
        metrics = history.weekly;
        break;
      case '30d':
        metrics = history.monthly;
        break;
    }
    
    if (metrics.length < 2) {
      throw new Error(`Not enough data for ${period} comparison`);
    }
    
    const current = metrics[metrics.length - 1];
    const previous = metrics[0];
    
    return {
      hashRate: this.calculatePercentageChange(current.hashRate, previous.hashRate),
      difficulty: this.calculatePercentageChange(current.difficulty, previous.difficulty),
      activeAddresses: this.calculatePercentageChange(current.activeAddresses, previous.activeAddresses),
      transactionCount: this.calculatePercentageChange(current.transactionCount, previous.transactionCount),
      averageFee: this.calculatePercentageChange(current.averageFee, previous.averageFee)
    };
  }

  /**
   * Calcula el cambio porcentual entre dos valores
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Genera métricas de red simuladas para demostración
   */
  private generateSimulatedMetrics(): NetworkMetrics {
    return {
      hashRate: 300 + Math.random() * 50, // TH/s
      difficulty: 15000000 + Math.random() * 1000000,
      activeAddresses: 100000 + Math.random() * 20000,
      transactionCount: 50000 + Math.random() * 10000,
      averageFee: 0.001 + Math.random() * 0.0005, // LTC
      blockTime: 2.5 + Math.random() * 0.2, // minutos
      blockSize: 30 + Math.random() * 10, // KB
      mempoolSize: 500 + Math.random() * 200, // transacciones
      timestamp: Date.now()
    };
  }

  /**
   * Genera un historial de métricas simulado para demostración
   */
  private generateSimulatedHistory(): NetworkMetricsHistory {
    const daily = this.generateHistoricalData(24, 60 * 60 * 1000); // 24 horas
    const weekly = this.generateHistoricalData(7, 24 * 60 * 60 * 1000); // 7 días
    const monthly = this.generateHistoricalData(30, 24 * 60 * 60 * 1000); // 30 días
    
    return { daily, weekly, monthly };
  }

  /**
   * Genera datos históricos simulados
   */
  private generateHistoricalData(count: number, interval: number): NetworkMetrics[] {
    const now = Date.now();
    const result: NetworkMetrics[] = [];
    
    for (let i = 0; i < count; i++) {
      const timestamp = now - (i * interval);
      
      // Generar datos con una tendencia general
      const trendFactor = 1 + (i / count) * 0.2; // Tendencia creciente
      
      result.push({
        hashRate: (300 + Math.random() * 50) * trendFactor,
        difficulty: (15000000 + Math.random() * 1000000) * trendFactor,
        activeAddresses: (100000 + Math.random() * 20000) * trendFactor,
        transactionCount: (50000 + Math.random() * 10000) * trendFactor,
        averageFee: (0.001 + Math.random() * 0.0005) * trendFactor,
        blockTime: 2.5 + Math.random() * 0.2,
        blockSize: (30 + Math.random() * 10) * trendFactor,
        mempoolSize: (500 + Math.random() * 200) * trendFactor,
        timestamp
      });
    }
    
    // Ordenar por timestamp (más antiguo primero)
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Analiza la salud de la red basada en las métricas actuales
   */
  public async analyzeNetworkHealth(): Promise<{
    overall: 'healthy' | 'neutral' | 'concerning';
    details: Record<string, { status: 'healthy' | 'neutral' | 'concerning'; reason: string }>;
  }> {
    const metrics = await this.getCurrentMetrics();
    const changes = await this.getMetricsChanges('24h');
    
    const details: Record<string, { status: 'healthy' | 'neutral' | 'concerning'; reason: string }> = {};
    
    // Analizar hash rate
    if (changes.hashRate > 5) {
      details.hashRate = { status: 'healthy', reason: 'Hash rate increasing, network security improving' };
    } else if (changes.hashRate < -5) {
      details.hashRate = { status: 'concerning', reason: 'Hash rate decreasing, potential security concerns' };
    } else {
      details.hashRate = { status: 'neutral', reason: 'Hash rate stable' };
    }
    
    // Analizar actividad de la red
    if (changes.activeAddresses > 10 && changes.transactionCount > 10) {
      details.activity = { status: 'healthy', reason: 'Network activity increasing, growing adoption' };
    } else if (changes.activeAddresses < -10 && changes.transactionCount < -10) {
      details.activity = { status: 'concerning', reason: 'Network activity decreasing, potential adoption issues' };
    } else {
      details.activity = { status: 'neutral', reason: 'Network activity stable' };
    }
    
    // Analizar congestión de la red
    if (metrics.mempoolSize > 2000 || changes.averageFee > 20) {
      details.congestion = { status: 'concerning', reason: 'Network congestion high, increasing fees' };
    } else if (metrics.mempoolSize < 500 && changes.averageFee < 5) {
      details.congestion = { status: 'healthy', reason: 'Network congestion low, stable fees' };
    } else {
      details.congestion = { status: 'neutral', reason: 'Network congestion moderate' };
    }
    
    // Determinar salud general
    const statuses = Object.values(details).map(d => d.status);
    const healthyCount = statuses.filter(s => s === 'healthy').length;
    const concerningCount = statuses.filter(s => s === 'concerning').length;
    
    let overall: 'healthy' | 'neutral' | 'concerning';
    if (healthyCount > concerningCount && healthyCount > statuses.length / 2) {
      overall = 'healthy';
    } else if (concerningCount > healthyCount && concerningCount > statuses.length / 2) {
      overall = 'concerning';
    } else {
      overall = 'neutral';
    }
    
    return { overall, details };
  }
}

export const networkMetricsService = new NetworkMetricsService();
