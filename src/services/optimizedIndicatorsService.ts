import { HistoricalData } from '@/types/market';
import { cacheService } from './cacheService';

export class OptimizedIndicatorsService {
  private static instance: OptimizedIndicatorsService;
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  public static getInstance(): OptimizedIndicatorsService {
    if (!OptimizedIndicatorsService.instance) {
      OptimizedIndicatorsService.instance = new OptimizedIndicatorsService();
    }
    return OptimizedIndicatorsService.instance;
  }

  // Cálculo optimizado de SMA
  public calculateSMA(data: HistoricalData[], period: number): number[] {
    const cacheKey = `sma_${period}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const sma: number[] = [];
    let sum = 0;

    // Calcular la primera SMA
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    sma.push(sum / period);

    // Calcular el resto usando el método de ventana deslizante
    for (let i = period; i < data.length; i++) {
      sum = sum - data[i - period].close + data[i].close;
      sma.push(sum / period);
    }

    cacheService.setIndicator(cacheKey, sma, this.cacheTTL);
    return sma;
  }

  // Cálculo optimizado de EMA
  public calculateEMA(data: HistoricalData[], period: number): number[] {
    const cacheKey = `ema_${period}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    // Calcular la primera EMA usando SMA
    const sma = this.calculateSMA(data, period);
    ema.push(sma[0]);

    // Calcular el resto de EMAs
    for (let i = 1; i < data.length; i++) {
      const currentEMA = (data[i].close - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(currentEMA);
    }

    cacheService.setIndicator(cacheKey, ema, this.cacheTTL);
    return ema;
  }

  // Cálculo optimizado de RSI
  public calculateRSI(data: HistoricalData[], period: number = 14): number[] {
    const cacheKey = `rsi_${period}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calcular cambios de precio
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    // Calcular promedio de ganancias y pérdidas
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calcular primer RSI
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    // Calcular el resto de RSIs
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      const currentRS = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + currentRS)));
    }

    cacheService.setIndicator(cacheKey, rsi, this.cacheTTL);
    return rsi;
  }

  // Cálculo optimizado de MACD
  public calculateMACD(
    data: HistoricalData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const cacheKey = `macd_${fastPeriod}_${slowPeriod}_${signalPeriod}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);

    // Calcular línea MACD
    const macd: number[] = [];
    for (let i = 0; i < data.length; i++) {
      macd.push(fastEMA[i] - slowEMA[i]);
    }

    // Calcular línea de señal
    const signal = this.calculateEMA(
      macd.map((value, index) => ({
        ...data[index],
        close: value
      })),
      signalPeriod
    );

    // Calcular histograma
    const histogram: number[] = [];
    for (let i = 0; i < data.length; i++) {
      histogram.push(macd[i] - signal[i]);
    }

    const result = { macd, signal, histogram };
    cacheService.setIndicator(cacheKey, result, this.cacheTTL);
    return result;
  }

  // Cálculo optimizado de Bollinger Bands
  public calculateBollingerBands(
    data: HistoricalData[],
    period: number = 20,
    stdDev: number = 2
  ): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const cacheKey = `bb_${period}_${stdDev}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const sma = this.calculateSMA(data, period);
    const middle = sma;
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sumSquaredDiff = slice.reduce((sum, d) => {
        const diff = d.close - middle[i - period + 1];
        return sum + diff * diff;
      }, 0);
      const standardDeviation = Math.sqrt(sumSquaredDiff / period);
      
      upper.push(middle[i - period + 1] + stdDev * standardDeviation);
      lower.push(middle[i - period + 1] - stdDev * standardDeviation);
    }

    const result = { upper, middle, lower };
    cacheService.setIndicator(cacheKey, result, this.cacheTTL);
    return result;
  }

  // Cálculo optimizado de Stochastic Oscillator
  public calculateStochastic(
    data: HistoricalData[],
    kPeriod: number = 14,
    dPeriod: number = 3
  ): {
    k: number[];
    d: number[];
  } {
    const cacheKey = `stoch_${kPeriod}_${dPeriod}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const k: number[] = [];
    const d: number[] = [];

    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(d => d.high));
      const lowestLow = Math.min(...slice.map(d => d.low));
      const currentClose = data[i].close;

      const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      k.push(kValue);
    }

    // Calcular D como SMA de K
    for (let i = dPeriod - 1; i < k.length; i++) {
      const slice = k.slice(i - dPeriod + 1, i + 1);
      const dValue = slice.reduce((sum, val) => sum + val, 0) / dPeriod;
      d.push(dValue);
    }

    const result = { k, d };
    cacheService.setIndicator(cacheKey, result, this.cacheTTL);
    return result;
  }

  // Cálculo optimizado de Average True Range (ATR)
  public calculateATR(
    data: HistoricalData[],
    period: number = 14
  ): number[] {
    const cacheKey = `atr_${period}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const tr: number[] = [];
    const atr: number[] = [];

    // Calcular True Range
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;

      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);

      tr.push(Math.max(tr1, tr2, tr3));
    }

    // Calcular ATR
    let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
    atr.push(sum / period);

    for (let i = period; i < tr.length; i++) {
      sum = sum - tr[i - period] + tr[i];
      atr.push(sum / period);
    }

    cacheService.setIndicator(cacheKey, atr, this.cacheTTL);
    return atr;
  }

  // Cálculo optimizado de On-Balance Volume (OBV)
  public calculateOBV(data: HistoricalData[]): number[] {
    const cacheKey = `obv_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const obv: number[] = [];
    let currentOBV = 0;

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        currentOBV = data[i].volume;
      } else {
        if (data[i].close > data[i - 1].close) {
          currentOBV += data[i].volume;
        } else if (data[i].close < data[i - 1].close) {
          currentOBV -= data[i].volume;
        }
      }
      obv.push(currentOBV);
    }

    cacheService.setIndicator(cacheKey, obv, this.cacheTTL);
    return obv;
  }

  // Cálculo optimizado de Money Flow Index (MFI)
  public calculateMFI(
    data: HistoricalData[],
    period: number = 14
  ): number[] {
    const cacheKey = `mfi_${period}_${data.length}`;
    const cached = cacheService.getIndicator(cacheKey);
    if (cached) return cached;

    const mfi: number[] = [];
    const typicalPrice: number[] = [];
    const moneyFlow: number[] = [];

    // Calcular precio típico y flujo de dinero
    for (let i = 0; i < data.length; i++) {
      const tp = (data[i].high + data[i].low + data[i].close) / 3;
      typicalPrice.push(tp);
      moneyFlow.push(tp * data[i].volume);
    }

    // Calcular MFI
    for (let i = period; i < data.length; i++) {
      let positiveFlow = 0;
      let negativeFlow = 0;

      for (let j = i - period + 1; j <= i; j++) {
        if (typicalPrice[j] > typicalPrice[j - 1]) {
          positiveFlow += moneyFlow[j];
        } else if (typicalPrice[j] < typicalPrice[j - 1]) {
          negativeFlow += moneyFlow[j];
        }
      }

      const moneyRatio = positiveFlow / negativeFlow;
      const mfiValue = 100 - (100 / (1 + moneyRatio));
      mfi.push(mfiValue);
    }

    cacheService.setIndicator(cacheKey, mfi, this.cacheTTL);
    return mfi;
  }
}

export const optimizedIndicatorsService = OptimizedIndicatorsService.getInstance(); 