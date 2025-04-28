import { HistoricalData } from '@/types/market';

interface FibonacciLevels {
  level0: number;  // 0%
  level236: number; // 23.6%
  level382: number; // 38.2%
  level500: number; // 50%
  level618: number; // 61.8%
  level786: number; // 78.6%
  level100: number; // 100%
}

export function calculateFibonacciRetracement(data: HistoricalData[]): FibonacciLevels {
  if (data.length < 2) {
    throw new Error('Se necesitan al menos 2 puntos de datos para calcular Fibonacci Retracement');
  }

  // Encontrar el máximo y mínimo en el conjunto de datos
  let high = Math.max(...data.map(d => d.high));
  let low = Math.min(...data.map(d => d.low));

  // Calcular la diferencia entre el máximo y mínimo
  const diff = high - low;

  // Calcular los niveles de Fibonacci
  return {
    level0: high,
    level236: high - (diff * 0.236),
    level382: high - (diff * 0.382),
    level500: high - (diff * 0.500),
    level618: high - (diff * 0.618),
    level786: high - (diff * 0.786),
    level100: low
  };
}

export function isFibonacciRetracementLevel(price: number, levels: FibonacciLevels, tolerance: number = 0.01): number | null {
  const percentages = [
    { level: 0, value: levels.level0 },
    { level: 23.6, value: levels.level236 },
    { level: 38.2, value: levels.level382 },
    { level: 50, value: levels.level500 },
    { level: 61.8, value: levels.level618 },
    { level: 78.6, value: levels.level786 },
    { level: 100, value: levels.level100 }
  ];

  for (const { level, value } of percentages) {
    const diff = Math.abs(price - value);
    const percentageDiff = diff / value;
    
    if (percentageDiff <= tolerance) {
      return level;
    }
  }

  return null;
} 