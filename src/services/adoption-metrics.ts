// Servicio para análisis de datos de adopción de Litecoin

export interface AdoptionMetrics {
  activeAddresses: number;
  newAddresses: number;
  transactionCount: number;
  transactionVolume: number; // En LTC
  averageTransactionValue: number; // En LTC
  medianTransactionValue: number; // En LTC
  timestamp: number;
}

export interface AdoptionTrend {
  daily: AdoptionMetrics[];
  weekly: AdoptionMetrics[];
  monthly: AdoptionMetrics[];
  yearly: AdoptionMetrics[];
}

export interface MerchantAdoption {
  category: string;
  count: number;
  percentage: number;
  yearOverYearGrowth: number;
}

export interface RegionalAdoption {
  region: string;
  transactionVolume: number;
  userCount: number;
  percentage: number;
  yearOverYearGrowth: number;
}

export interface SocialMetrics {
  platform: string;
  followers: number;
  engagement: number;
  sentiment: number; // -1 a 1
  change30d: number; // Porcentaje
}

class AdoptionMetricsService {
  private cachedMetrics: AdoptionMetrics | null = null;
  private cachedTrends: AdoptionTrend | null = null;
  private lastFetchTime: number = 0;
  private cacheDuration: number = 60 * 60 * 1000; // 1 hora

  /**
   * Obtiene métricas de adopción actuales
   */
  public async getCurrentMetrics(): Promise<AdoptionMetrics> {
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
      console.error('Error fetching adoption metrics:', error);
      
      // Si hay un error pero tenemos caché, devolver la caché aunque sea antigua
      if (this.cachedMetrics) {
        return this.cachedMetrics;
      }
      
      throw error;
    }
  }

  /**
   * Obtiene tendencias de adopción
   */
  public async getAdoptionTrends(): Promise<AdoptionTrend> {
    const now = Date.now();
    
    // Usar caché si está disponible y es reciente
    if (this.cachedTrends && (now - this.lastFetchTime < this.cacheDuration)) {
      return this.cachedTrends;
    }
    
    try {
      // En un entorno real, haríamos una llamada a la API
      // Para este ejemplo, generamos datos simulados
      const trends = this.generateSimulatedTrends();
      
      this.cachedTrends = trends;
      this.lastFetchTime = now;
      
      return trends;
    } catch (error) {
      console.error('Error fetching adoption trends:', error);
      
      // Si hay un error pero tenemos caché, devolver la caché aunque sea antigua
      if (this.cachedTrends) {
        return this.cachedTrends;
      }
      
      throw error;
    }
  }

  /**
   * Obtiene datos de adopción por comerciantes
   */
  public async getMerchantAdoption(): Promise<MerchantAdoption[]> {
    // En un entorno real, haríamos una llamada a la API
    // Para este ejemplo, generamos datos simulados
    return [
      { category: 'E-commerce', count: 1250, percentage: 35, yearOverYearGrowth: 15 },
      { category: 'Servicios', count: 850, percentage: 24, yearOverYearGrowth: 12 },
      { category: 'Retail', count: 620, percentage: 17, yearOverYearGrowth: 8 },
      { category: 'Viajes', count: 320, percentage: 9, yearOverYearGrowth: 20 },
      { category: 'Juegos', count: 280, percentage: 8, yearOverYearGrowth: 25 },
      { category: 'Otros', count: 250, percentage: 7, yearOverYearGrowth: 5 }
    ];
  }

  /**
   * Obtiene datos de adopción por región
   */
  public async getRegionalAdoption(): Promise<RegionalAdoption[]> {
    // En un entorno real, haríamos una llamada a la API
    // Para este ejemplo, generamos datos simulados
    return [
      { region: 'Norteamérica', transactionVolume: 12500000, userCount: 850000, percentage: 32, yearOverYearGrowth: 12 },
      { region: 'Europa', transactionVolume: 9800000, userCount: 720000, percentage: 27, yearOverYearGrowth: 15 },
      { region: 'Asia', transactionVolume: 8200000, userCount: 650000, percentage: 24, yearOverYearGrowth: 22 },
      { region: 'Sudamérica', transactionVolume: 3100000, userCount: 280000, percentage: 10, yearOverYearGrowth: 18 },
      { region: 'África', transactionVolume: 1200000, userCount: 120000, percentage: 4, yearOverYearGrowth: 30 },
      { region: 'Oceanía', transactionVolume: 950000, userCount: 85000, percentage: 3, yearOverYearGrowth: 10 }
    ];
  }

  /**
   * Obtiene métricas sociales
   */
  public async getSocialMetrics(): Promise<SocialMetrics[]> {
    // En un entorno real, haríamos una llamada a la API
    // Para este ejemplo, generamos datos simulados
    return [
      { platform: 'Twitter', followers: 2100000, engagement: 3.2, sentiment: 0.65, change30d: 5.2 },
      { platform: 'Reddit', followers: 1250000, engagement: 4.8, sentiment: 0.72, change30d: 8.5 },
      { platform: 'Telegram', followers: 950000, engagement: 2.9, sentiment: 0.58, change30d: 3.1 },
      { platform: 'Discord', followers: 780000, engagement: 5.1, sentiment: 0.81, change30d: 12.3 },
      { platform: 'YouTube', followers: 650000, engagement: 2.2, sentiment: 0.62, change30d: 4.7 },
      { platform: 'Instagram', followers: 520000, engagement: 1.8, sentiment: 0.51, change30d: 2.9 }
    ];
  }

  /**
   * Analiza la tendencia de adopción
   */
  public async analyzeAdoptionTrend(): Promise<{
    trend: 'increasing' | 'stable' | 'decreasing';
    growthRate: number;
    keyInsights: string[];
  }> {
    const trends = await this.getAdoptionTrends();
    
    // Calcular tasa de crecimiento basada en datos mensuales
    const monthlyData = trends.monthly;
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];
    
    const activeAddressesGrowth = ((lastMonth.activeAddresses / firstMonth.activeAddresses) - 1) * 100;
    const transactionCountGrowth = ((lastMonth.transactionCount / firstMonth.transactionCount) - 1) * 100;
    const transactionVolumeGrowth = ((lastMonth.transactionVolume / firstMonth.transactionVolume) - 1) * 100;
    
    // Calcular tasa de crecimiento promedio
    const growthRate = (activeAddressesGrowth + transactionCountGrowth + transactionVolumeGrowth) / 3;
    
    // Determinar tendencia
    let trend: 'increasing' | 'stable' | 'decreasing';
    if (growthRate > 5) {
      trend = 'increasing';
    } else if (growthRate < -5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
    
    // Generar insights
    const keyInsights = [];
    
    if (activeAddressesGrowth > 10) {
      keyInsights.push(`Fuerte crecimiento en direcciones activas (${activeAddressesGrowth.toFixed(1)}%), indicando mayor adopción de usuarios.`);
    } else if (activeAddressesGrowth < -10) {
      keyInsights.push(`Disminución significativa en direcciones activas (${activeAddressesGrowth.toFixed(1)}%), posible señal de preocupación.`);
    }
    
    if (transactionCountGrowth > 15) {
      keyInsights.push(`Aumento notable en el número de transacciones (${transactionCountGrowth.toFixed(1)}%), indicando mayor uso de la red.`);
    }
    
    if (transactionVolumeGrowth > 20) {
      keyInsights.push(`Crecimiento sustancial en el volumen de transacciones (${transactionVolumeGrowth.toFixed(1)}%), señal de mayor actividad económica.`);
    }
    
    // Añadir insights sobre nuevas direcciones
    const newAddressesGrowth = ((lastMonth.newAddresses / firstMonth.newAddresses) - 1) * 100;
    if (newAddressesGrowth > 15) {
      keyInsights.push(`Fuerte aumento en nuevas direcciones (${newAddressesGrowth.toFixed(1)}%), indicando crecimiento de nuevos usuarios.`);
    }
    
    // Si no hay insights específicos, añadir uno general
    if (keyInsights.length === 0) {
      if (trend === 'increasing') {
        keyInsights.push(`Tendencia general positiva con un crecimiento del ${growthRate.toFixed(1)}% en métricas clave.`);
      } else if (trend === 'stable') {
        keyInsights.push(`Métricas de adopción estables con un cambio del ${growthRate.toFixed(1)}% en el período analizado.`);
      } else {
        keyInsights.push(`Tendencia a la baja con una disminución del ${Math.abs(growthRate).toFixed(1)}% en métricas clave.`);
      }
    }
    
    return {
      trend,
      growthRate,
      keyInsights
    };
  }

  /**
   * Genera métricas de adopción simuladas para demostración
   */
  private generateSimulatedMetrics(): AdoptionMetrics {
    return {
      activeAddresses: 500000 + Math.random() * 100000,
      newAddresses: 15000 + Math.random() * 5000,
      transactionCount: 100000 + Math.random() * 20000,
      transactionVolume: 1000000 + Math.random() * 200000,
      averageTransactionValue: 10 + Math.random() * 5,
      medianTransactionValue: 5 + Math.random() * 2,
      timestamp: Date.now()
    };
  }

  /**
   * Genera tendencias de adopción simuladas para demostración
   */
  private generateSimulatedTrends(): AdoptionTrend {
    return {
      daily: this.generateTrendData(30, 24 * 60 * 60 * 1000, 0.05),
      weekly: this.generateTrendData(12, 7 * 24 * 60 * 60 * 1000, 0.1),
      monthly: this.generateTrendData(12, 30 * 24 * 60 * 60 * 1000, 0.15),
      yearly: this.generateTrendData(5, 365 * 24 * 60 * 60 * 1000, 0.2)
    };
  }

  /**
   * Genera datos de tendencia simulados
   */
  private generateTrendData(count: number, interval: number, growthFactor: number): AdoptionMetrics[] {
    const now = Date.now();
    const result: AdoptionMetrics[] = [];
    
    // Valores base
    const baseActiveAddresses = 400000;
    const baseNewAddresses = 12000;
    const baseTransactionCount = 80000;
    const baseTransactionVolume = 800000;
    const baseAvgTxValue = 10;
    const baseMedianTxValue = 5;
    
    for (let i = 0; i < count; i++) {
      const timestamp = now - ((count - 1 - i) * interval);
      
      // Aplicar tendencia creciente con algo de variación aleatoria
      const growthMultiplier = 1 + (i * growthFactor / count);
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 a 1.1
      
      result.push({
        activeAddresses: Math.round(baseActiveAddresses * growthMultiplier * randomFactor),
        newAddresses: Math.round(baseNewAddresses * growthMultiplier * randomFactor),
        transactionCount: Math.round(baseTransactionCount * growthMultiplier * randomFactor),
        transactionVolume: Math.round(baseTransactionVolume * growthMultiplier * randomFactor),
        averageTransactionValue: baseAvgTxValue * randomFactor,
        medianTransactionValue: baseMedianTxValue * randomFactor,
        timestamp
      });
    }
    
    return result;
  }
}

export const adoptionMetricsService = new AdoptionMetricsService();
