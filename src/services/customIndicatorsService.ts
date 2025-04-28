import { HistoricalData } from '@/types/market';

export interface CustomIndicator {
  name: string;
  description: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  confidence: number;
}

export function calculateCustomIndicators(
  data: HistoricalData[],
  period: number = 14
): CustomIndicator[] {
  const indicators: CustomIndicator[] = [];

  if (data.length < period) {
    throw new Error('No hay suficientes datos para calcular los indicadores');
  }

  // Indicador de Momentum Personalizado
  const momentumIndicator = calculateMomentumIndicator(data, period);
  indicators.push(momentumIndicator);

  // Indicador de Volatilidad Personalizado
  const volatilityIndicator = calculateVolatilityIndicator(data, period);
  indicators.push(volatilityIndicator);

  // Indicador de Tendencia Personalizado
  const trendIndicator = calculateTrendIndicator(data, period);
  indicators.push(trendIndicator);

  return indicators;
}

function calculateMomentumIndicator(
  data: HistoricalData[],
  period: number
): CustomIndicator {
  const recentData = data.slice(-period);
  const priceChanges = recentData.map((d, i) => {
    if (i === 0) return 0;
    return ((d.close - recentData[i - 1].close) / recentData[i - 1].close) * 100;
  });

  const momentum = priceChanges.reduce((sum, change) => sum + change, 0) / period;
  const volumeMomentum = recentData.reduce((sum, d) => sum + d.volume, 0) / period;

  const signal = momentum > 0 ? 'buy' : momentum < 0 ? 'sell' : 'neutral';
  const confidence = Math.min(Math.abs(momentum) * 2, 100);

  return {
    name: 'Momentum Personalizado',
    description: 'Mide la fuerza del movimiento del precio y el volumen',
    value: momentum,
    signal,
    confidence
  };
}

function calculateVolatilityIndicator(
  data: HistoricalData[],
  period: number
): CustomIndicator {
  const recentData = data.slice(-period);
  const returns = recentData.map((d, i) => {
    if (i === 0) return 0;
    return Math.log(d.close / recentData[i - 1].close);
  });

  const mean = returns.reduce((sum, r) => sum + r, 0) / period;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / period;
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Volatilidad anualizada

  const signal = volatility > 50 ? 'sell' : volatility < 20 ? 'buy' : 'neutral';
  const confidence = Math.min(volatility, 100);

  return {
    name: 'Volatilidad Personalizada',
    description: 'Mide la variabilidad del precio en el tiempo',
    value: volatility,
    signal,
    confidence
  };
}

function calculateTrendIndicator(
  data: HistoricalData[],
  period: number
): CustomIndicator {
  const recentData = data.slice(-period);
  const sma = recentData.reduce((sum, d) => sum + d.close, 0) / period;
  const currentPrice = recentData[recentData.length - 1].close;
  
  const priceAboveSMA = currentPrice > sma;
  const trendStrength = Math.abs((currentPrice - sma) / sma) * 100;

  const signal = priceAboveSMA ? 'buy' : 'sell';
  const confidence = Math.min(trendStrength * 2, 100);

  return {
    name: 'Tendencia Personalizada',
    description: 'Analiza la dirección y fuerza de la tendencia',
    value: trendStrength,
    signal,
    confidence
  };
} 