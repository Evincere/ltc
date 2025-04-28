import { HistoricalData } from '@/types/market';

interface CorrelationResult {
  asset: string;
  correlation: number;
  pValue: number;
  significance: 'high' | 'medium' | 'low';
}

export async function calculateCorrelations(
  ltcData: HistoricalData[],
  otherAssets: { [key: string]: HistoricalData[] }
): Promise<CorrelationResult[]> {
  const results: CorrelationResult[] = [];
  const ltcPrices = ltcData.map(d => d.close);

  for (const [asset, data] of Object.entries(otherAssets)) {
    const otherPrices = data.map(d => d.close);
    
    // Calcular correlación de Pearson
    const correlation = calculatePearsonCorrelation(ltcPrices, otherPrices);
    
    // Calcular p-value
    const pValue = calculatePValue(correlation, ltcPrices.length);
    
    // Determinar significancia
    const significance = determineSignificance(correlation, pValue);
    
    results.push({
      asset,
      correlation,
      pValue,
      significance
    });
  }

  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function calculatePValue(correlation: number, n: number): number {
  const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
  const df = n - 2;
  
  // Aproximación simple del p-value
  return 2 * (1 - tDistributionCDF(Math.abs(t), df));
}

function tDistributionCDF(t: number, df: number): number {
  // Aproximación simple de la CDF de la distribución t
  const x = t / Math.sqrt(df + t * t);
  return 0.5 * (1 + x * (1 + x * x / (2 * df)));
}

function determineSignificance(correlation: number, pValue: number): 'high' | 'medium' | 'low' {
  if (Math.abs(correlation) > 0.7 && pValue < 0.05) return 'high';
  if (Math.abs(correlation) > 0.5 && pValue < 0.1) return 'medium';
  return 'low';
} 