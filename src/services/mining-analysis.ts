// Servicio para análisis de minería de Litecoin

export interface MiningPool {
  name: string;
  hashRate: number;
  hashRatePercentage: number;
  blocksLast24h: number;
  blocksPercentage: number;
}

export interface MiningStats {
  totalHashRate: number;
  averageBlockTime: number;
  difficulty: number;
  nextDifficultyEstimate: number;
  nextDifficultyChangePercentage: number;
  blockReward: number;
  pools: MiningPool[];
  timestamp: number;
}

export interface MiningProfitability {
  hashRate: number; // MH/s
  powerConsumption: number; // Watts
  powerCost: number; // USD/kWh
  dailyReward: number; // LTC
  dailyRevenue: number; // USD
  dailyCost: number; // USD
  dailyProfit: number; // USD
  monthlyProfit: number; // USD
  breakEvenDays: number;
  roi: number; // %
}

export interface MinerDevice {
  name: string;
  hashRate: number; // MH/s
  power: number; // Watts
  price: number; // USD
}

class MiningAnalysisService {
  private cachedStats: MiningStats | null = null;
  private lastFetchTime: number = 0;
  private cacheDuration: number = 30 * 60 * 1000; // 30 minutos
  private ltcPrice: number = 80; // USD, valor simulado

  /**
   * Obtiene estadísticas actuales de minería
   */
  public async getMiningStats(): Promise<MiningStats> {
    const now = Date.now();
    
    // Usar caché si está disponible y es reciente
    if (this.cachedStats && (now - this.lastFetchTime < this.cacheDuration)) {
      return this.cachedStats;
    }
    
    try {
      // En un entorno real, haríamos una llamada a la API
      // Para este ejemplo, generamos datos simulados
      const stats = this.generateSimulatedStats();
      
      this.cachedStats = stats;
      this.lastFetchTime = now;
      
      return stats;
    } catch (error) {
      console.error('Error fetching mining stats:', error);
      
      // Si hay un error pero tenemos caché, devolver la caché aunque sea antigua
      if (this.cachedStats) {
        return this.cachedStats;
      }
      
      throw error;
    }
  }

  /**
   * Calcula la rentabilidad de la minería
   */
  public calculateProfitability(
    hashRate: number,
    powerConsumption: number,
    powerCost: number,
    ltcPrice: number = this.ltcPrice
  ): MiningProfitability {
    // Obtener estadísticas de minería (usamos valores en caché si están disponibles)
    const stats = this.cachedStats || this.generateSimulatedStats();
    
    // Calcular recompensa diaria en LTC
    // Fórmula: (hashRate / totalHashRate) * (blocksPerDay * blockReward)
    const blocksPerDay = 24 * 60 / stats.averageBlockTime;
    const dailyReward = (hashRate / (stats.totalHashRate * 1000000)) * (blocksPerDay * stats.blockReward);
    
    // Calcular ingresos diarios en USD
    const dailyRevenue = dailyReward * ltcPrice;
    
    // Calcular costos diarios en USD
    const dailyPowerConsumption = powerConsumption * 24 / 1000; // kWh
    const dailyCost = dailyPowerConsumption * powerCost;
    
    // Calcular beneficio diario y mensual
    const dailyProfit = dailyRevenue - dailyCost;
    const monthlyProfit = dailyProfit * 30;
    
    // Calcular ROI y días para recuperar la inversión
    // Asumimos un costo de hardware de $1000 por cada 1000 MH/s
    const hardwareCost = (hashRate / 1000) * 1000;
    const breakEvenDays = hardwareCost / dailyProfit;
    const roi = (dailyProfit * 365 / hardwareCost) * 100;
    
    return {
      hashRate,
      powerConsumption,
      powerCost,
      dailyReward,
      dailyRevenue,
      dailyCost,
      dailyProfit,
      monthlyProfit,
      breakEvenDays,
      roi
    };
  }

  /**
   * Obtiene una lista de dispositivos de minería populares
   */
  public getPopularMiners(): MinerDevice[] {
    return [
      {
        name: "Antminer L7",
        hashRate: 9500, // MH/s
        power: 3425, // Watts
        price: 22000 // USD
      },
      {
        name: "Goldshell LT6",
        hashRate: 3000, // MH/s
        power: 2800, // Watts
        price: 9000 // USD
      },
      {
        name: "Bitmain Antminer L3++",
        hashRate: 580, // MH/s
        power: 942, // Watts
        price: 1200 // USD
      },
      {
        name: "Goldshell LT5 Pro",
        hashRate: 2450, // MH/s
        power: 2250, // Watts
        price: 7500 // USD
      },
      {
        name: "iBeLink BM-L21",
        hashRate: 2100, // MH/s
        power: 1850, // Watts
        price: 6000 // USD
      }
    ];
  }

  /**
   * Calcula la rentabilidad para un dispositivo específico
   */
  public calculateMinerProfitability(
    miner: MinerDevice,
    powerCost: number,
    ltcPrice: number = this.ltcPrice
  ): MiningProfitability & { paybackPeriod: number } {
    const profitability = this.calculateProfitability(
      miner.hashRate,
      miner.power,
      powerCost,
      ltcPrice
    );
    
    // Calcular período de recuperación específico para este dispositivo
    const paybackPeriod = miner.price / profitability.dailyProfit;
    
    return {
      ...profitability,
      paybackPeriod
    };
  }

  /**
   * Compara la rentabilidad de varios dispositivos
   */
  public compareMiners(
    miners: MinerDevice[],
    powerCost: number,
    ltcPrice: number = this.ltcPrice
  ): Array<MiningProfitability & { name: string; efficiency: number; paybackPeriod: number }> {
    return miners.map(miner => {
      const profitability = this.calculateProfitability(
        miner.hashRate,
        miner.power,
        powerCost,
        ltcPrice
      );
      
      // Calcular eficiencia (MH/J)
      const efficiency = miner.hashRate / miner.power;
      
      // Calcular período de recuperación
      const paybackPeriod = miner.price / profitability.dailyProfit;
      
      return {
        ...profitability,
        name: miner.name,
        efficiency,
        paybackPeriod
      };
    }).sort((a, b) => b.monthlyProfit - a.monthlyProfit);
  }

  /**
   * Genera estadísticas de minería simuladas para demostración
   */
  private generateSimulatedStats(): MiningStats {
    const totalHashRate = 300 + Math.random() * 50; // TH/s
    const blockReward = 12.5; // LTC
    
    // Generar pools de minería simulados
    const pools: MiningPool[] = [
      { name: "F2Pool", hashRate: 0, hashRatePercentage: 0, blocksLast24h: 0, blocksPercentage: 0 },
      { name: "AntPool", hashRate: 0, hashRatePercentage: 0, blocksLast24h: 0, blocksPercentage: 0 },
      { name: "ViaBTC", hashRate: 0, hashRatePercentage: 0, blocksLast24h: 0, blocksPercentage: 0 },
      { name: "Poolin", hashRate: 0, hashRatePercentage: 0, blocksLast24h: 0, blocksPercentage: 0 },
      { name: "LitecoinPool", hashRate: 0, hashRatePercentage: 0, blocksLast24h: 0, blocksPercentage: 0 },
      { name: "Otros", hashRate: 0, hashRatePercentage: 0, blocksLast24h: 0, blocksPercentage: 0 }
    ];
    
    // Asignar porcentajes aleatorios a los pools
    let remainingPercentage = 100;
    for (let i = 0; i < pools.length - 1; i++) {
      const percentage = i === 0 
        ? 20 + Math.random() * 10 
        : Math.min(remainingPercentage, Math.random() * 20);
      
      pools[i].hashRatePercentage = percentage;
      pools[i].hashRate = (totalHashRate * percentage) / 100;
      remainingPercentage -= percentage;
    }
    
    // Asignar el porcentaje restante al último pool ("Otros")
    pools[pools.length - 1].hashRatePercentage = remainingPercentage;
    pools[pools.length - 1].hashRate = (totalHashRate * remainingPercentage) / 100;
    
    // Calcular bloques minados en las últimas 24 horas
    const blocksLast24h = 576; // Aproximadamente 576 bloques en 24 horas
    
    // Distribuir bloques entre los pools según su hash rate
    let remainingBlocks = blocksLast24h;
    for (let i = 0; i < pools.length - 1; i++) {
      const blocks = Math.round((blocksLast24h * pools[i].hashRatePercentage) / 100);
      pools[i].blocksLast24h = blocks;
      pools[i].blocksPercentage = (blocks / blocksLast24h) * 100;
      remainingBlocks -= blocks;
    }
    
    // Asignar los bloques restantes al último pool
    pools[pools.length - 1].blocksLast24h = remainingBlocks;
    pools[pools.length - 1].blocksPercentage = (remainingBlocks / blocksLast24h) * 100;
    
    return {
      totalHashRate,
      averageBlockTime: 2.5, // minutos
      difficulty: 15000000 + Math.random() * 1000000,
      nextDifficultyEstimate: 15000000 + Math.random() * 2000000,
      nextDifficultyChangePercentage: Math.random() * 10 - 5, // -5% a +5%
      blockReward,
      pools,
      timestamp: Date.now()
    };
  }

  /**
   * Establece el precio actual de LTC
   */
  public setLtcPrice(price: number): void {
    this.ltcPrice = price;
  }

  /**
   * Obtiene el precio actual de LTC
   */
  public getLtcPrice(): number {
    return this.ltcPrice;
  }
}

export const miningAnalysisService = new MiningAnalysisService();
