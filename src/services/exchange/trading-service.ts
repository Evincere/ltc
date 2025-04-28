import { bitsoApi, BitsoOrder, BitsoTicker } from './bitso-api';
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
  order: BitsoOrder;
  timestamp: number;
  status: 'success' | 'failed';
  error?: string;
}

export interface RiskParameters {
  maxPositionSize: number;  // Tamaño máximo de posición como % del balance
  stopLossPercentage: number;  // % de pérdida para activar stop loss
  takeProfitPercentage: number;  // % de ganancia para tomar beneficios
  maxDailyLoss: number;  // Pérdida máxima diaria como % del balance
  maxOpenTrades: number;  // Número máximo de operaciones abiertas
}

// Clase principal para el servicio de trading automatizado
export class TradingService extends EventEmitter {
  private strategies: TradingStrategy[] = [];
  private isRunning: boolean = false;
  private interval: NodeJS.Timeout | null = null;
  private tradeHistory: TradeResult[] = [];
  private riskParameters: RiskParameters = {
    maxPositionSize: 5,  // 5% del balance
    stopLossPercentage: 2,  // 2% de pérdida
    takeProfitPercentage: 5,  // 5% de ganancia
    maxDailyLoss: 10,  // 10% de pérdida diaria máxima
    maxOpenTrades: 3  // Máximo 3 operaciones abiertas
  };
  
  constructor() {
    super();
    this.loadStrategies();
  }
  
  /**
   * Carga las estrategias guardadas
   */
  private loadStrategies(): void {
    try {
      const savedStrategies = localStorage.getItem('tradingStrategies');
      if (savedStrategies) {
        // Solo cargamos los datos de las estrategias, no la función execute
        const parsedStrategies = JSON.parse(savedStrategies);
        
        // Necesitamos asignar la función execute a cada estrategia
        this.strategies = parsedStrategies.map((strategy: any) => ({
          ...strategy,
          execute: this.getStrategyExecuteFunction(strategy.id)
        }));
      }
    } catch (error) {
      console.error('Error loading trading strategies:', error);
    }
  }
  
  /**
   * Guarda las estrategias en localStorage
   */
  private saveStrategies(): void {
    try {
      // Guardamos solo los datos de las estrategias, no la función execute
      const strategiesData = this.strategies.map(strategy => ({
        id: strategy.id,
        name: strategy.name,
        description: strategy.description,
        isActive: strategy.isActive,
        config: strategy.config
      }));
      
      localStorage.setItem('tradingStrategies', JSON.stringify(strategiesData));
    } catch (error) {
      console.error('Error saving trading strategies:', error);
    }
  }
  
  /**
   * Obtiene la función execute para una estrategia según su ID
   */
  private getStrategyExecuteFunction(strategyId: string): TradingStrategy['execute'] {
    // Aquí implementaríamos la lógica para cada estrategia
    // Por ahora, devolvemos una función simple para demostración
    return (data: TradingData) => {
      // Estrategia de ejemplo: comprar si el precio baja un 5% en las últimas 24 horas
      const ticker = data.ticker;
      const currentPrice = parseFloat(ticker.last);
      const high24h = parseFloat(ticker.high);
      
      if (currentPrice < high24h * 0.95) {
        return {
          action: 'buy',
          book: ticker.book,
          type: 'limit',
          amount: 0.01,  // Cantidad fija para demostración
          price: currentPrice,
          reason: 'Price dropped 5% from 24h high'
        };
      }
      
      return null;  // No hay señal
    };
  }
  
  /**
   * Inicia el servicio de trading automatizado
   */
  public start(): void {
    if (this.isRunning) return;
    
    if (!bitsoApi.hasCredentials()) {
      throw new Error('API credentials not set');
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
   * Ejecuta todas las estrategias activas
   */
  private async executeStrategies(): Promise<void> {
    try {
      // Obtener datos necesarios para las estrategias
      const [tickers, balances, openOrders] = await Promise.all([
        this.getAllTickers(),
        this.getBalances(),
        this.getOpenOrders()
      ]);
      
      // Verificar límites de riesgo
      if (!this.checkRiskLimits(balances, openOrders)) {
        this.emit('risk_limit_reached');
        return;
      }
      
      // Ejecutar cada estrategia activa
      for (const strategy of this.strategies.filter(s => s.isActive)) {
        for (const [book, ticker] of Object.entries(tickers)) {
          const tradingData: TradingData = {
            ticker,
            balance: balances,
            openOrders,
            timestamp: Date.now()
          };
          
          try {
            const signal = strategy.execute(tradingData);
            
            if (signal) {
              // Verificar límites de riesgo específicos para esta señal
              if (this.validateSignal(signal, balances)) {
                const result = await this.executeSignal(strategy, signal);
                this.tradeHistory.push(result);
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
   * Obtiene todos los tickers disponibles
   */
  private async getAllTickers(): Promise<Record<string, BitsoTicker>> {
    // En un caso real, obtendríamos todos los tickers de interés
    // Por ahora, solo obtenemos BTC/MXN para simplificar
    const ticker = await bitsoApi.getTicker('btc_mxn');
    return { 'btc_mxn': ticker };
  }
  
  /**
   * Obtiene los balances de la cuenta
   */
  private async getBalances(): Promise<Record<string, number>> {
    const balances = await bitsoApi.getBalance();
    
    // Convertir a un objeto más simple
    return balances.reduce((acc, balance) => {
      acc[balance.currency] = parseFloat(balance.available);
      return acc;
    }, {} as Record<string, number>);
  }
  
  /**
   * Obtiene las órdenes abiertas
   */
  private async getOpenOrders(): Promise<BitsoOrder[]> {
    return bitsoApi.getOpenOrders();
  }
  
  /**
   * Verifica los límites de riesgo generales
   */
  private checkRiskLimits(
    balances: Record<string, number>,
    openOrders: BitsoOrder[]
  ): boolean {
    // Verificar número máximo de operaciones abiertas
    if (openOrders.length >= this.riskParameters.maxOpenTrades) {
      return false;
    }
    
    // Verificar pérdida diaria máxima
    const dailyPnL = this.calculateDailyPnL();
    const totalBalance = this.calculateTotalBalance(balances);
    
    if (dailyPnL < 0 && Math.abs(dailyPnL) > (totalBalance * this.riskParameters.maxDailyLoss / 100)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Calcula la ganancia/pérdida diaria
   */
  private calculateDailyPnL(): number {
    // En un caso real, calcularíamos la P&L diaria basada en operaciones
    // Por ahora, devolvemos 0 para simplificar
    return 0;
  }
  
  /**
   * Calcula el balance total en MXN
   */
  private calculateTotalBalance(balances: Record<string, number>): number {
    // En un caso real, convertiríamos todo a MXN
    // Por ahora, solo devolvemos el balance de MXN para simplificar
    return balances['mxn'] || 0;
  }
  
  /**
   * Valida una señal de trading contra los parámetros de riesgo
   */
  private validateSignal(
    signal: TradingSignal,
    balances: Record<string, number>
  ): boolean {
    // Verificar tamaño máximo de posición
    const totalBalance = this.calculateTotalBalance(balances);
    const signalValue = signal.price 
      ? signal.amount * signal.price 
      : signal.amount * this.getMarketPrice(signal.book);
    
    if (signalValue > (totalBalance * this.riskParameters.maxPositionSize / 100)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Obtiene el precio de mercado actual para un libro
   */
  private getMarketPrice(book: string): number {
    // En un caso real, obtendríamos el precio actual
    // Por ahora, devolvemos un valor fijo para simplificar
    return 500000; // Precio ficticio para BTC/MXN
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
      const order = await bitsoApi.placeOrder(
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
      console.error('Error executing trading signal:', error);
      
      return {
        id: Math.random().toString(36).substring(2, 15),
        strategy: strategy.id,
        signal,
        order: {} as BitsoOrder, // Orden vacía en caso de error
        timestamp: Date.now(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Agrega una nueva estrategia
   */
  public addStrategy(strategy: Omit<TradingStrategy, 'execute'>): TradingStrategy {
    const newStrategy = {
      ...strategy,
      execute: this.getStrategyExecuteFunction(strategy.id)
    };
    
    this.strategies.push(newStrategy);
    this.saveStrategies();
    
    return newStrategy;
  }
  
  /**
   * Actualiza una estrategia existente
   */
  public updateStrategy(
    strategyId: string,
    updates: Partial<Omit<TradingStrategy, 'id' | 'execute'>>
  ): TradingStrategy | null {
    const index = this.strategies.findIndex(s => s.id === strategyId);
    
    if (index === -1) return null;
    
    this.strategies[index] = {
      ...this.strategies[index],
      ...updates
    };
    
    this.saveStrategies();
    
    return this.strategies[index];
  }
  
  /**
   * Elimina una estrategia
   */
  public removeStrategy(strategyId: string): boolean {
    const initialLength = this.strategies.length;
    this.strategies = this.strategies.filter(s => s.id !== strategyId);
    
    if (this.strategies.length !== initialLength) {
      this.saveStrategies();
      return true;
    }
    
    return false;
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
   * Actualiza los parámetros de riesgo
   */
  public updateRiskParameters(params: Partial<RiskParameters>): RiskParameters {
    this.riskParameters = {
      ...this.riskParameters,
      ...params
    };
    
    return this.riskParameters;
  }
  
  /**
   * Obtiene los parámetros de riesgo actuales
   */
  public getRiskParameters(): RiskParameters {
    return { ...this.riskParameters };
  }
}

// Instancia singleton para usar en toda la aplicación
export const tradingService = new TradingService();
