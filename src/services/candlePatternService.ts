import { HistoricalData } from '@/types/market';

interface CandlePattern {
  name: string;
  description: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export function detectCandlePatterns(data: HistoricalData[]): CandlePattern[] {
  const patterns: CandlePattern[] = [];
  
  // Necesitamos al menos 3 velas para detectar patrones
  if (data.length < 3) return patterns;

  for (let i = 2; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];
    const twoPrevious = data[i - 2];

    // Calcular características de las velas
    const currentBody = Math.abs(current.close - current.open);
    const currentUpperWick = current.high - Math.max(current.open, current.close);
    const currentLowerWick = Math.min(current.open, current.close) - current.low;
    
    const previousBody = Math.abs(previous.close - previous.open);
    const previousUpperWick = previous.high - Math.max(previous.open, previous.close);
    const previousLowerWick = Math.min(previous.open, previous.close) - previous.low;

    // Detectar Martillo (Hammer)
    if (currentLowerWick > 2 * currentBody && currentUpperWick < currentBody) {
      patterns.push({
        name: 'Martillo',
        description: 'Señal de reversión alcista después de una tendencia bajista',
        signal: 'bullish',
        confidence: calculateConfidence(current, previous, twoPrevious)
      });
    }

    // Detectar Estrella Fugaz (Shooting Star)
    if (currentUpperWick > 2 * currentBody && currentLowerWick < currentBody) {
      patterns.push({
        name: 'Estrella Fugaz',
        description: 'Señal de reversión bajista después de una tendencia alcista',
        signal: 'bearish',
        confidence: calculateConfidence(current, previous, twoPrevious)
      });
    }

    // Detectar Engulfing Alcista
    if (previous.close < previous.open && // Vela anterior bajista
        current.open < previous.close && // Apertura dentro del cuerpo anterior
        current.close > previous.open) { // Cierre por encima de la apertura anterior
      patterns.push({
        name: 'Engulfing Alcista',
        description: 'Fuerte señal de reversión alcista',
        signal: 'bullish',
        confidence: calculateConfidence(current, previous, twoPrevious)
      });
    }

    // Detectar Engulfing Bajista
    if (previous.close > previous.open && // Vela anterior alcista
        current.open > previous.close && // Apertura dentro del cuerpo anterior
        current.close < previous.open) { // Cierre por debajo de la apertura anterior
      patterns.push({
        name: 'Engulfing Bajista',
        description: 'Fuerte señal de reversión bajista',
        signal: 'bearish',
        confidence: calculateConfidence(current, previous, twoPrevious)
      });
    }

    // Detectar Doji
    if (currentBody < (current.high - current.low) * 0.1) {
      patterns.push({
        name: 'Doji',
        description: 'Indecisión en el mercado',
        signal: 'neutral',
        confidence: calculateConfidence(current, previous, twoPrevious)
      });
    }
  }

  return patterns;
}

function calculateConfidence(
  current: HistoricalData,
  previous: HistoricalData,
  twoPrevious: HistoricalData
): number {
  // Calcular la confianza basada en:
  // 1. Volatilidad del mercado
  // 2. Volumen de trading
  // 3. Tamaño relativo de las velas
  
  const volatility = Math.abs(current.close - current.open) / current.open;
  const volumeRatio = current.volume / ((previous.volume + twoPrevious.volume) / 2);
  
  // Normalizar los factores
  const normalizedVolatility = Math.min(volatility * 100, 100);
  const normalizedVolume = Math.min(volumeRatio * 50, 100);
  
  // Combinar los factores con pesos
  return (normalizedVolatility * 0.4 + normalizedVolume * 0.6);
} 