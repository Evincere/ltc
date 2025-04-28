import { HistoricalData } from '@/types/market';

export interface FibonacciLevels {
  retracement: {
    level: number;
    price: number;
  }[];
  extension: {
    level: number;
    price: number;
  }[];
  swingHigh: number;
  swingLow: number;
}

export function calculateFibonacciLevels(
  data: HistoricalData[],
  lookbackPeriod: number = 20
): FibonacciLevels {
  if (data.length < lookbackPeriod) {
    throw new Error('No hay suficientes datos para calcular los niveles de Fibonacci');
  }

  // Encontrar el swing high y swing low en el período
  const recentData = data.slice(-lookbackPeriod);
  const swingHigh = Math.max(...recentData.map(d => d.high));
  const swingLow = Math.min(...recentData.map(d => d.low));
  const range = swingHigh - swingLow;

  // Niveles de retroceso de Fibonacci
  const retracementLevels = [0.236, 0.382, 0.5, 0.618, 0.786];
  const retracement = retracementLevels.map(level => ({
    level,
    price: swingHigh - (range * level)
  }));

  // Niveles de extensión de Fibonacci
  const extensionLevels = [1.618, 2.618, 3.618];
  const extension = extensionLevels.map(level => ({
    level,
    price: swingHigh + (range * (level - 1))
  }));

  return {
    retracement,
    extension,
    swingHigh,
    swingLow
  };
}

export function identifyFibonacciZones(
  data: HistoricalData[],
  lookbackPeriod: number = 20
): {
  supportZones: number[];
  resistanceZones: number[];
} {
  const levels = calculateFibonacciLevels(data, lookbackPeriod);
  
  // Identificar zonas de soporte y resistencia basadas en los niveles de Fibonacci
  const supportZones = [
    levels.swingLow,
    ...levels.retracement.map(level => level.price)
  ].sort((a, b) => a - b);

  const resistanceZones = [
    levels.swingHigh,
    ...levels.extension.map(level => level.price)
  ].sort((a, b) => a - b);

  return {
    supportZones,
    resistanceZones
  };
} 