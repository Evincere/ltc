"use client";

import { bitsoApiReal } from './bitso-api-real';
import { BitsoOrder, BitsoTicker } from './bitso-api';
import { EventEmitter } from 'events';

// Interfaces para el servicio de trading
export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  config: Record<string, any>;
  execute: (data: TradingData) => TradingSignal | null;
}

export interface TradingData {
  ticker: BitsoTicker;
  balance: {
    [currency: string]: number;
  };
  openOrders: BitsoOrder[];
  timestamp: number;
}

export interface TradingSignal {
  action: 'buy' | 'sell';
  book: string;
  type: 'limit' | 'market';
  amount: number;
  price?: number;
  reason: string;
}

export interface TradeResult {
  id: string;
  strategy: string;
  signal: TradingSignal;
  order?: BitsoOrder;
  timestamp: number;
  status: 'success' | 'error';
  error?: string;
  profit?: number;
}

export interface RiskParameters {
  maxOrderSize: {
    [currency: string]: number;
  };
  maxDailyVolume: {
    [currency: string]: number;
  };
  maxDrawdown: number;
  stopLoss: number;
}

// Clase principal para el servicio de trading
class TradingServiceReal extends EventEmitter {
  private static instance: TradingServiceReal;
  private isRunning: boolean = false;
  private interval: NodeJS.Timeout | null = null;
  private strategies: TradingStrategy[] = [];
  private tradeHistory: TradeResult[] = [];
  private riskParameters: RiskParameters = {
    maxOrderSize: {
      btc: 0.01,
      eth: 0.1,
      ltc: 1,
      mxn: 1000
    },
    maxDailyVolume: {
      btc: 0.05,
      eth: 0.5,
      ltc: 5,
      mxn: 5000
    },
    maxDrawdown: 10, // Porcentaje
    stopLoss: 5 // Porcentaje
  };
  private dailyVolume: {
    [currency: string]: number;
  } = {};
  private lastVolumeReset: number = Date.now();
  private availableBooks: string[] = [];
  
  private constructor() {
    super();
    this.loadStrategies();
    this.loadTradeHistory();
    this.initializeAvailableBooks();
  }
  
  public static getInstance(): TradingServiceReal {
    if (!TradingServiceReal.instance) {
      TradingServiceReal.instance = new TradingServiceReal();
    }
    return TradingServiceReal.instance;
  }
  
  /**
   * Inicializa la lista de libros disponibles
   */
  private async initializeAvailableBooks(): Promise<void> {
    try {
      this.availableBooks = await bitsoApiReal.getAvailableBooks();
    } catch (error) {
      console.error('Error initializing available books:', error);
      // Usar valores por defecto si falla
      this.availableBooks = ['btc_mxn', 'eth_mxn', 'ltc_mxn'];
    }
  }
  
  /**
   * Carga las estrategias guardadas
   */
  private loadStrategies(): void {
    if (typeof window !== 'undefined') {
      const savedStrategies = localStorage.getItem('tradingStrategies');
      if (savedStrategies) {
        try {
          // Necesitamos reconstruir las funciones execute
          const parsedStrategies = JSON.parse(savedStrategies);
          this.strategies = parsedStrategies.map((strategy: any) => {
            // Reconstruir la función execute desde su representación en string
            if (strategy.executeString) {
              try {
                // eslint-disable-next-line no-new-func
                strategy.execute = new Function('data', strategy.executeString);
              } catch (error) {
                console.error(`Error reconstructing execute function for strategy ${strategy.name}:`, error);
                strategy.execute = () => null;
              }
            } else {
              strategy.execute = () => null;
            }
            return strategy;
          });
        } catch (error) {
          console.error('Error loading trading strategies:', error);
          this.strategies = [];
        }
      }
    }
    
    // Si no hay estrategias guardadas, crear algunas por defecto
    if (this.strategies.length === 0) {
      this.strategies = this.getDefaultStrategies();
    }
  }
  
  /**
   * Carga el historial de operaciones guardado
   */
  private loadTradeHistory(): void {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('tradeHistory');
      if (savedHistory) {
        try {
          this.tradeHistory = JSON.parse(savedHistory);
        } catch (error) {
          console.error('Error loading trade history:', error);
          this.tradeHistory = [];
        }
      }
    }
  }
  
  /**
   * Guarda las estrategias
   */
  private saveStrategies(): void {
    if (typeof window !== 'undefined') {
      try {
        // Necesitamos guardar la función execute como string
        const strategiesToSave = this.strategies.map(strategy => {
          const strategyCopy = { ...strategy };
          if (typeof strategyCopy.execute === 'function') {
            // Convertir la función a string
            strategyCopy.executeString = strategyCopy.execute.toString();
          }
          // Eliminar la función real para evitar errores de serialización
          delete strategyCopy.execute;
          return strategyCopy;
        });
        localStorage.setItem('tradingStrategies', JSON.stringify(strategiesToSave));
      } catch (error) {
        console.error('Error saving trading strategies:', error);
      }
    }
  }
  
  /**
   * Guarda el historial de operaciones
   */
  private saveTradeHistory(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tradeHistory', JSON.stringify(this.tradeHistory));
      } catch (error) {
        console.error('Error saving trade history:', error);
      }
    }
  }
  
  /**
   * Obtiene estrategias por defecto
   */
  private getDefaultStrategies(): TradingStrategy[] {
    return [
      {
        id: 'rsi-strategy',
        name: 'RSI Strategy',
        description: 'Compra cuando RSI < 30, vende cuando RSI > 70',
        isActive: false,
        config: {
          book: 'btc_mxn',
          buyThreshold: 30,
          sellThreshold: 70,
          amount: 0.001
        },
        execute: (data: TradingData) => {
          // Esta es una estrategia simulada
          // En un caso real, calcularíamos el RSI basado en datos históricos
          const rsi = Math.random() * 100; // Simulación
          
          if (rsi < 30) {
            return {
              action: 'buy',
              book: 'btc_mxn',
              type: 'limit',
              amount: 0.001,
              price: parseFloat(data.ticker.last) * 0.99, // 1% por debajo del precio actual
              reason: `RSI bajo (${rsi.toFixed(2)})`
            };
          } else if (rsi > 70) {
            return {
              action: 'sell',
              book: 'btc_mxn',
              type: 'limit',
              amount: 0.001,
              price: parseFloat(data.ticker.last) * 1.01, // 1% por encima del precio actual
              reason: `RSI alto (${rsi.toFixed(2)})`
            };
          }
          
          return null;
        }
      },
      {
        id: 'macd-strategy',
        name: 'MACD Strategy',
        description: 'Compra en cruce alcista de MACD, vende en cruce bajista',
        isActive: false,
        config: {
          book: 'eth_mxn',
          amount: 0.01
        },
        execute: (data: TradingData) => {
          // Esta es una estrategia simulada
          // En un caso real, calcularíamos el MACD basado en datos históricos
          const macdCrossover = Math.random() > 0.5; // Simulación
          const macdCrossunder = Math.random() > 0.5; // Simulación
          
          if (macdCrossover) {
            return {
              action: 'buy',
              book: 'eth_mxn',
              type: 'market',
              amount: 0.01,
              reason: 'Cruce alcista de MACD'
            };
          } else if (macdCrossunder) {
            return {
              action: 'sell',
              book: 'eth_mxn',
              type: 'market',
              amount: 0.01,
              reason: 'Cruce bajista de MACD'
            };
          }
          
          return null;
        }
      }
    ];
  }
  
  /**
   * Inicia el servicio de trading automatizado
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;
    
    if (!bitsoApiReal.hasCredentials()) {
      // Intentar cargar credenciales
      const loaded = bitsoApiReal.loadCredentials();
      if (!loaded) {
        throw new Error('API credentials not set');
      }
    }
    
    // Validar credenciales
    const valid = await bitsoApiReal.validateCredentials();
    if (!valid) {
      throw new Error('Invalid API credentials');
    }
    
    this.isRunning = true;
    
    // Ejecutar cada 5 minutos
    this.interval = setInterval(async () => {
      await this.executeStrategies();
    }, 5 * 60 * 1000);
    
    // Ejecutar inmediatamente al iniciar
    this.executeStrategies();
    
    this.emit('started');
  }
  
  /**
   * Detiene el servicio de trading automatizado
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.isRunning = false;
    this.emit('stopped');
  }
  
  /**
   * Añade una nueva estrategia
   */
  public addStrategy(strategy: TradingStrategy): void {
    this.strategies.push(strategy);
    this.saveStrategies();
    this.emit('strategy_added', strategy);
  }
  
  /**
   * Actualiza una estrategia existente
   */
  public updateStrategy(id: string, updates: Partial<TradingStrategy>): void {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index !== -1) {
      this.strategies[index] = { ...this.strategies[index], ...updates };
      this.saveStrategies();
      this.emit('strategy_updated', this.strategies[index]);
    }
  }
  
  /**
   * Elimina una estrategia
   */
  public removeStrategy(id: string): void {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index !== -1) {
      const strategy = this.strategies[index];
      this.strategies.splice(index, 1);
      this.saveStrategies();
      this.emit('strategy_removed', strategy);
    }
  }
  
  /**
   * Activa o desactiva una estrategia
   */
  public toggleStrategy(id: string): void {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index !== -1) {
      this.strategies[index].isActive = !this.strategies[index].isActive;
      this.saveStrategies();
      this.emit('strategy_toggled', this.strategies[index]);
    }
  }
  
  /**
   * Obtiene todas las estrategias
   */
  public getStrategies(): TradingStrategy[] {
    return [...this.strategies];
  }
  
  /**
   * Obtiene el historial de operaciones
   */
  public getTradeHistory(): TradeResult[] {
    return [...this.tradeHistory];
  }
  
  /**
   * Establece los parámetros de riesgo
   */
  public setRiskParameters(params: Partial<RiskParameters>): void {
    this.riskParameters = { ...this.riskParameters, ...params };
    this.emit('risk_parameters_updated', this.riskParameters);
  }
  
  /**
   * Obtiene los parámetros de riesgo
   */
  public getRiskParameters(): RiskParameters {
    return { ...this.riskParameters };
  }
  
  /**
   * Ejecuta todas las estrategias activas
   */
  private async executeStrategies(): Promise<void> {
    if (!this.isRunning) return;
    
    // Resetear volumen diario si ha pasado un día
    const now = Date.now();
    if (now - this.lastVolumeReset > 24 * 60 * 60 * 1000) {
      this.dailyVolume = {};
      this.lastVolumeReset = now;
    }
    
    try {
      // Obtener datos necesarios para las estrategias
      const activeBooks = this.getActiveBooks();
      const tickers = await bitsoApiReal.getTickers(activeBooks);
      const balances = await this.getBalances();
      const openOrders = await bitsoApiReal.getOpenOrders();
      
      // Ejecutar cada estrategia activa
      for (const strategy of this.strategies.filter(s => s.isActive)) {
        for (const book of activeBooks) {
          const ticker = tickers[book];
          
          if (!ticker) {
            console.warn(`No ticker data available for ${book}`);
            continue;
          }
          
          const tradingData: TradingData = {
            ticker,
            balance: balances,
            openOrders,
            timestamp: now
          };
          
          try {
            const signal = strategy.execute(tradingData);
            
            if (signal) {
              // Verificar límites de riesgo específicos para esta señal
              if (this.validateSignal(signal, balances)) {
                const result = await this.executeSignal(strategy, signal);
                this.tradeHistory.push(result);
                this.saveTradeHistory();
                this.emit('trade_executed', result);
              }
            }
          } catch (error) {
            console.error(`Error executing strategy ${strategy.name}:`, error);
            this.emit('strategy_error', { strategy, error });
          }
        }
      }
    } catch (error) {
      console.error('Error in trading service:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Obtiene los libros activos basados en las estrategias activas
   */
  private getActiveBooks(): string[] {
    const books = new Set<string>();
    
    // Añadir libros de estrategias activas
    this.strategies
      .filter(s => s.isActive)
      .forEach(strategy => {
        if (strategy.config.book) {
          books.add(strategy.config.book);
        }
      });
    
    // Si no hay libros específicos, usar los disponibles
    if (books.size === 0 && this.availableBooks.length > 0) {
      // Usar solo los primeros 3 para no sobrecargar
      this.availableBooks.slice(0, 3).forEach(book => books.add(book));
    }
    
    // Si aún no hay libros, usar valores por defecto
    if (books.size === 0) {
      books.add('btc_mxn');
      books.add('eth_mxn');
      books.add('ltc_mxn');
    }
    
    return Array.from(books);
  }
  
  /**
   * Obtiene los balances de la cuenta
   */
  private async getBalances(): Promise<Record<string, number>> {
    const balances = await bitsoApiReal.getBalance();
    
    // Convertir a un objeto más simple
    return balances.reduce((acc, balance) => {
      acc[balance.currency] = parseFloat(balance.available);
      return acc;
    }, {} as Record<string, number>);
  }
  
  /**
   * Valida una señal de trading contra los parámetros de riesgo
   */
  private validateSignal(
    signal: TradingSignal,
    balances: Record<string, number>
  ): boolean {
    try {
      // Extraer las monedas del libro (ej: btc_mxn -> btc y mxn)
      const [baseCurrency, quoteCurrency] = signal.book.split('_');
      
      // Verificar tamaño máximo de orden
      if (signal.amount > (this.riskParameters.maxOrderSize[baseCurrency] || Infinity)) {
        console.warn(`Signal rejected: Amount exceeds max order size for ${baseCurrency}`);
        return false;
      }
      
      // Verificar volumen diario
      this.dailyVolume[baseCurrency] = (this.dailyVolume[baseCurrency] || 0) + signal.amount;
      if (this.dailyVolume[baseCurrency] > (this.riskParameters.maxDailyVolume[baseCurrency] || Infinity)) {
        console.warn(`Signal rejected: Daily volume exceeded for ${baseCurrency}`);
        return false;
      }
      
      // Verificar balance suficiente
      if (signal.action === 'buy') {
        const cost = signal.amount * (signal.price || 0);
        if (balances[quoteCurrency] < cost) {
          console.warn(`Signal rejected: Insufficient ${quoteCurrency} balance`);
          return false;
        }
      } else if (signal.action === 'sell') {
        if (balances[baseCurrency] < signal.amount) {
          console.warn(`Signal rejected: Insufficient ${baseCurrency} balance`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validating signal:', error);
      return false;
    }
  }
  
  /**
   * Ejecuta una señal de trading
   */
  private async executeSignal(
    strategy: TradingStrategy,
    signal: TradingSignal
  ): Promise<TradeResult> {
    try {
      // Convertir valores numéricos a strings para la API
      const order = await bitsoApiReal.placeOrder(
        signal.book,
        signal.action,
        signal.type,
        signal.amount.toString(),
        signal.price?.toString()
      );
      
      return {
        id: Math.random().toString(36).substring(2, 15),
        strategy: strategy.id,
        signal,
        order,
        timestamp: Date.now(),
        status: 'success'
      };
    } catch (error) {
      console.error('Error executing signal:', error);
      
      return {
        id: Math.random().toString(36).substring(2, 15),
        strategy: strategy.id,
        signal,
        timestamp: Date.now(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Realiza backtesting de una estrategia
   */
  public async backtest(
    strategy: TradingStrategy,
    book: string,
    days: number = 30
  ): Promise<{
    trades: TradeResult[];
    performance: {
      totalTrades: number;
      successfulTrades: number;
      profitLoss: number;
      winRate: number;
    };
  }> {
    // Esta es una implementación básica de backtesting
    // En un caso real, obtendríamos datos históricos y simularíamos la ejecución de la estrategia
    
    // Simulación simple para demostración
    const trades: TradeResult[] = [];
    let profitLoss = 0;
    
    // Simular 10 operaciones
    for (let i = 0; i < 10; i++) {
      const isSuccess = Math.random() > 0.3;
      const profit = isSuccess ? Math.random() * 5 : -Math.random() * 3;
      
      const signal: TradingSignal = {
        action: Math.random() > 0.5 ? 'buy' : 'sell',
        book,
        type: 'limit',
        amount: 0.01,
        price: 100 + Math.random() * 10,
        reason: 'Backtesting'
      };
      
      const trade: TradeResult = {
        id: `backtest-${i}`,
        strategy: strategy.id,
        signal,
        timestamp: Date.now() - (i * 24 * 60 * 60 * 1000 / 10), // Distribuir en el período
        status: isSuccess ? 'success' : 'error',
        profit
      };
      
      trades.push(trade);
      profitLoss += profit;
    }
    
    const successfulTrades = trades.filter(t => t.status === 'success').length;
    
    return {
      trades,
      performance: {
        totalTrades: trades.length,
        successfulTrades,
        profitLoss,
        winRate: (successfulTrades / trades.length) * 100
      }
    };
  }
}

export const tradingServiceReal = TradingServiceReal.getInstance();
