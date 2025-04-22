import * as TechnicalIndicators from 'technicalindicators';



/**
 * Represents historical price data for a cryptocurrency.
 */
export interface HistoricalPrice {
  /**
   * The timestamp of the price data.
   */
  timestamp: number;
  /**
   * The price of the cryptocurrency at the given timestamp.
   */
  price: number;
}

export interface TechnicalIndicators {
  rsi: number[];
  macd: MACDOutput[];
  sma: number[];
}

export type MACDOutput = { MACD: number; signal: number; histogram: number };

/**
 * Asynchronously retrieves historical price data for a given cryptocurrency.
 *
 * @param coinId The ID of the cryptocurrency (e.g., 'litecoin').
 * @param currency The currency to retrieve the price in (e.g., 'usd').
 * @param days The number of days of historical data to retrieve.
 * @returns A promise that resolves to an array of HistoricalPrice objects.
 */
export async function getHistoricalPrice(
  coinId: string,
  currency: string,
  days: number
): Promise<HistoricalPrice[]> {  
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/history?vs_currency=${currency}&days=${days}`;

  const response = await fetch(url);
  const data = await response.json();

  const historicalData: HistoricalPrice[] = [];
  
  // Check if the API response has the expected structure
  if (data && data.market_data && data.market_data.current_price) {
    historicalData.push({
        timestamp: data.market_data.current_price.last_updated_at,
        price: data.market_data.current_price[currency]
    })
  }

  // Check if the API response has the expected structure  
  if (data && data.market_data && data.market_data.prices) {
    data.market_data.prices.forEach((priceData: [number, number]) => {
      historicalData.push({ timestamp: priceData[0], price: priceData[1] });
    });
  }

  return historicalData;
}

export function calculateTechnicalIndicators(historicalPrices: HistoricalPrice[]): TechnicalIndicators {
  const prices = historicalPrices.map(h => h.price);

  const rsiPeriod = 14;
  const macdShortPeriod = 12;
  const macdLongPeriod = 26;
  const macdSignalPeriod = 9;
  const smaPeriod = 20;

  const rsi = TechnicalIndicators.RSI.calculate({ values: prices, period: rsiPeriod });
  const macd = TechnicalIndicators.MACD.calculate({
    values: prices,
    fastPeriod: macdShortPeriod,
    slowPeriod: macdLongPeriod, 
    signalPeriod: macdSignalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const sma = SMA.calculate({ values: prices, period: smaPeriod });

  // Make sure all indicators have the same length as the data
  const rsiPadding = prices.length - rsi.length;
  const macdPadding = prices.length - macd.length;
  const smaPadding = prices.length - sma.length;


  const paddedRSI = Array(rsiPadding).fill(0).concat(rsi)
  const paddedMacd = Array(macdPadding).fill({ MACD: 0, signal: 0, histogram: 0 }).concat(macd);
  const paddedSMA = Array(smaPadding).fill(0).concat(sma);

  return {
    rsi: paddedRSI,
    macd: paddedMacd,
    sma: paddedSMA
  };
}

export async function getBiLSTMPrediction(historicalPrices: HistoricalPrice[]): Promise<number> {
  const prices = historicalPrices.map(h => h.price);

  const url = `/api/predict`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prices)
  });

  const data = await response.json();

  if (!data.hasOwnProperty('prediction')) {
    throw new Error("La respuesta de la API no contiene la propiedad 'prediction'");
  }
  return data.prediction;
}

export interface OnChainMetrics {
  transactions: number;
  volume: number;
  activeAddresses: number;
}

export async function getLitecoinOnChainMetrics(): Promise<OnChainMetrics> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ transactions: 12345, volume: 67890, activeAddresses: 101112 });
    }, 1000); // Simulate network latency
  });
}

export interface MarketSentiment {
  sentiment: 'Positivo' | 'Neutral' | 'Negativo';
  score: number;
}

export async function getLitecoinSentiment(): Promise<MarketSentiment> {
  return new Promise((resolve) => {
    resolve({ sentiment: 'Positivo', score: 0.75 });
  });
}

