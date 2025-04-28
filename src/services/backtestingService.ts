import { HistoricalData } from '@/types/market';
import { calculateRSI } from '@/utils/indicators/rsi';
import { calculateMACD } from '@/utils/indicators/macd';
import { calculateBollingerBands } from '@/utils/indicators/bollinger';
import { calculateFibonacciRetracement, isFibonacciRetracementLevel } from '@/utils/indicators/fibonacci';

interface BacktestConfig {
  startDate: string;
  endDate: string;
  initialBalance: number;
  strategy: string;
  customStrategy?: any;
}

interface Trade {
  entryPrice: number;
  exitPrice: number;
  entryDate: string;
  exitDate: string;
  profit: number;
  profitPercentage: number;
}

interface BacktestResult {
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  profit: number;
  profitPercentage: number;
  trades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  tradeHistory: Trade[];
  equityCurve: number[]; // Curva de equity para gráficos
}

// Función para ejecutar estrategias personalizadas
function executeCustomStrategy(
  strategy: any,
  data: HistoricalData[],
  currentIndex: number,
  indicators: any
): number {
  // Obtener los valores de los parámetros de la estrategia
  const params: Record<string, any> = {};
  if (strategy.parameters && strategy.parameters.length > 0) {
    strategy.parameters.forEach((param: any) => {
      params[param.name] = param.value;
    });
  }

  // Si la estrategia es de tipo predefinida, usar condiciones
  if (strategy.type === 'predefined' || strategy.type === 'combined') {
    return evaluateConditions(strategy.conditions, data[currentIndex], currentIndex, indicators, data);
  }

  // Si la estrategia es personalizada y tiene código, intentar ejecutarlo
  if (strategy.type === 'custom' && strategy.code) {
    try {
      // Crear una función a partir del código de la estrategia
      // Nota: En un entorno de producción, esto debería hacerse con más seguridad
      const strategyFunction = new Function(
        'data', 'currentIndex', 'indicators', 'params',
        `
        try {
          ${strategy.code}
          // Si el código no retorna explícitamente, asumimos que no hay señal
          return 0;
        } catch (error) {
          console.error("Error ejecutando estrategia personalizada:", error);
          return 0;
        }
        `
      );

      // Ejecutar la función con los datos actuales
      return strategyFunction(data, currentIndex, indicators, params);
    } catch (error) {
      console.error("Error al crear función de estrategia personalizada:", error);
      return 0;
    }
  }

  // Si no se puede ejecutar la estrategia, no dar señal
  return 0;
}

// Función para evaluar condiciones de estrategias
function evaluateConditions(
  conditions: any[],
  currentData: HistoricalData,
  currentIndex: number,
  indicators: any,
  allData: HistoricalData[]
): number {
  if (!conditions || conditions.length === 0) {
    return 0;
  }

  // Verificar cada condición
  for (const condition of conditions) {
    const { indicator, operator, value, action } = condition;
    let conditionMet = false;

    // Obtener el valor del indicador
    let indicatorValue;
    switch (indicator) {
      case 'rsi':
        indicatorValue = indicators.rsi[currentIndex];
        break;
      case 'macd':
        indicatorValue = indicators.macd.macdLine[currentIndex] - indicators.macd.signalLine[currentIndex];
        break;
      case 'bollinger':
        // Distancia al borde superior/inferior de las bandas
        const price = currentData.close;
        const upperBand = indicators.bollinger.upper[currentIndex];
        const lowerBand = indicators.bollinger.lower[currentIndex];

        if (operator === 'cross-above' || operator === 'greater') {
          indicatorValue = (price / upperBand) * 100 - 100;
        } else {
          indicatorValue = (lowerBand / price) * 100 - 100;
        }
        break;
      case 'price':
        indicatorValue = currentData.close;
        break;
      case 'volume':
        indicatorValue = currentData.volume;
        break;
      default:
        indicatorValue = 0;
    }

    // Evaluar la condición según el operador
    switch (operator) {
      case 'greater':
        conditionMet = indicatorValue > value;
        break;
      case 'less':
        conditionMet = indicatorValue < value;
        break;
      case 'equal':
        conditionMet = Math.abs(indicatorValue - value) < 0.001; // Aproximación para igualdad en números flotantes
        break;
      case 'cross-above':
        // Verificar si el indicador cruzó por encima del valor
        if (currentIndex > 0) {
          let previousValue;
          switch (indicator) {
            case 'rsi':
              previousValue = indicators.rsi[currentIndex - 1];
              break;
            case 'macd':
              previousValue = indicators.macd.macdLine[currentIndex - 1] - indicators.macd.signalLine[currentIndex - 1];
              break;
            case 'price':
              previousValue = allData[currentIndex - 1].close;
              break;
            default:
              previousValue = 0;
          }
          conditionMet = previousValue <= value && indicatorValue > value;
        }
        break;
      case 'cross-below':
        // Verificar si el indicador cruzó por debajo del valor
        if (currentIndex > 0) {
          let previousValue;
          switch (indicator) {
            case 'rsi':
              previousValue = indicators.rsi[currentIndex - 1];
              break;
            case 'macd':
              previousValue = indicators.macd.macdLine[currentIndex - 1] - indicators.macd.signalLine[currentIndex - 1];
              break;
            case 'price':
              previousValue = allData[currentIndex - 1].close;
              break;
            default:
              previousValue = 0;
          }
          conditionMet = previousValue >= value && indicatorValue < value;
        }
        break;
    }

    // Si la condición se cumple, retornar la señal correspondiente
    if (conditionMet) {
      return action === 'buy' ? 1 : -1;
    }
  }

  // Si ninguna condición se cumple, no dar señal
  return 0;
}

export async function runBacktest(config: BacktestConfig, historicalData: HistoricalData[]): Promise<BacktestResult> {
  let currentBalance = config.initialBalance;
  let position = 0;
  let trades: Trade[] = [];
  let equityCurve: number[] = [config.initialBalance];
  let maxEquity = config.initialBalance;
  let maxDrawdown = 0;

  // Filtrar datos históricos según el rango de fechas
  const filteredData = historicalData.filter(data =>
    new Date(data.timestamp) >= new Date(config.startDate) &&
    new Date(data.timestamp) <= new Date(config.endDate)
  );

  // Calcular indicadores técnicos
  const rsi = calculateRSI(filteredData.map(d => d.close), 14);
  const macd = calculateMACD(filteredData.map(d => d.close));
  const bollinger = calculateBollingerBands(filteredData.map(d => d.close));
  const fibLevels = calculateFibonacciRetracement(filteredData);

  // Implementar lógica de trading según la estrategia seleccionada
  for (let i = 20; i < filteredData.length; i++) {
    const currentPrice = filteredData[i].close;
    const currentDate = filteredData[i].timestamp;

    let signal = 0; // 0: hold, 1: buy, -1: sell

    if (config.strategy === 'custom' && config.customStrategy) {
      // Ejecutar estrategia personalizada
      signal = executeCustomStrategy(
        config.customStrategy,
        filteredData,
        i,
        { rsi, macd, bollinger, fibLevels }
      );
    } else {
      // Estrategias predefinidas
      switch (config.strategy) {
        case 'rsi':
          if (rsi[i] < 30) signal = 1; // Oversold
          else if (rsi[i] > 70) signal = -1; // Overbought
          break;

        case 'macd':
          if (macd.macdLine[i] > macd.signalLine[i] &&
              macd.macdLine[i-1] <= macd.signalLine[i-1]) signal = 1;
          else if (macd.macdLine[i] < macd.signalLine[i] &&
                  macd.macdLine[i-1] >= macd.signalLine[i-1]) signal = -1;
          break;

        case 'bollinger':
          if (currentPrice < bollinger.lower[i]) signal = 1;
          else if (currentPrice > bollinger.upper[i]) signal = -1;
          break;

        case 'fibonacci':
          const fibLevel = isFibonacciRetracementLevel(currentPrice, fibLevels);
          if (fibLevel === 38.2 || fibLevel === 61.8) signal = 1; // Comprar en niveles clave
          else if (fibLevel === 0 || fibLevel === 100) signal = -1; // Vender en extremos
          break;
      }
    }

    // Ejecutar trades según la señal
    if (signal === 1 && position === 0) {
      // Buy
      position = currentBalance / currentPrice;
      currentBalance = 0;
      trades.push({
        entryPrice: currentPrice,
        exitPrice: 0,
        entryDate: currentDate,
        exitDate: '',
        profit: 0,
        profitPercentage: 0
      });
    } else if (signal === -1 && position > 0) {
      // Sell
      const exitValue = position * currentPrice;
      currentBalance = exitValue;
      const lastTrade = trades[trades.length - 1];
      lastTrade.exitPrice = currentPrice;
      lastTrade.exitDate = currentDate;
      lastTrade.profit = exitValue - (position * lastTrade.entryPrice);
      lastTrade.profitPercentage = (lastTrade.profit / (position * lastTrade.entryPrice)) * 100;
      position = 0;
    }

    // Actualizar curva de equity
    const currentEquity = currentBalance + (position * currentPrice);
    equityCurve.push(currentEquity);
    maxEquity = Math.max(maxEquity, currentEquity);
    maxDrawdown = Math.max(maxDrawdown, (maxEquity - currentEquity) / maxEquity);
  }

  // Calcular métricas finales
  const winningTrades = trades.filter(t => t.profit > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  // Calcular Sharpe Ratio (simplificado)
  const returns = equityCurve.slice(1).map((value, i) =>
    (value - equityCurve[i]) / equityCurve[i]
  );
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = stdDev !== 0 ? avgReturn / stdDev : 0;

  // Calcular balance final
  const finalBalance = currentBalance + (position * filteredData[filteredData.length - 1].close);

  return {
    startDate: config.startDate,
    endDate: config.endDate,
    initialBalance: config.initialBalance,
    finalBalance,
    profit: finalBalance - config.initialBalance,
    profitPercentage: ((finalBalance / config.initialBalance) - 1) * 100,
    trades: trades.length,
    winRate,
    maxDrawdown: maxDrawdown * 100,
    sharpeRatio,
    tradeHistory: trades,
    equityCurve // Incluir la curva de equity para gráficos
  };
}