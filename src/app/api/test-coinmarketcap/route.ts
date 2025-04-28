import { NextResponse } from 'next/server';
import { coinmarketcapAPI } from '@/services/coinmarketcap-api';

export async function GET() {
  try {
    // Obtener el precio actual de Litecoin
    const ltcPrice = await coinmarketcapAPI.getCurrentPrice('LTC');
    
    // Obtener datos históricos de Litecoin
    const historicalData = await coinmarketcapAPI.getHistoricalPrices('LTC', 'USD', 7);
    
    // Obtener las principales criptomonedas
    const topCryptos = await coinmarketcapAPI.getTopCryptocurrencies(5);
    
    // Obtener métricas globales
    const globalMetrics = await coinmarketcapAPI.getGlobalMetrics();
    
    return NextResponse.json({
      success: true,
      data: {
        ltcPrice,
        historicalData,
        topCryptos,
        globalMetrics
      }
    });
  } catch (error) {
    console.error('Error testing CoinMarketCap API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
