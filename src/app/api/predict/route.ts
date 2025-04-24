import { NextResponse } from 'next/server';

// Función simple de ejemplo para simular una predicción
function simulatePrediction(prices: number[]): number {
  if (prices.length === 0) return 0;
  
  // Calcula una predicción simple basada en la tendencia reciente
  const lastPrice = prices[prices.length - 1];
  const averageChange = prices.slice(-5).reduce((acc, price, index, arr) => {
    if (index === 0) return 0;
    return acc + (price - arr[index - 1]);
  }, 0) / 4;

  return lastPrice + averageChange;
}

export async function POST(request: Request) {
  try {
    const prices: number[] = await request.json();

    if (!Array.isArray(prices) || prices.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de precios válido' },
        { status: 400 }
      );
    }

    const prediction = simulatePrediction(prices);

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Error en la predicción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la predicción' },
      { status: 500 }
    );
  }
} 