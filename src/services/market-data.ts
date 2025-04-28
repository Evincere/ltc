// Servicio para obtener datos de mercado en tiempo real

interface MarketData {
  price: number;
  volume: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

class MarketDataService {
  private currentData: MarketData | null = null;
  private listeners: ((data: MarketData) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Iniciar actualizaciones periódicas
    this.startUpdates();
  }
  
  private startUpdates() {
    // Actualizar cada 30 segundos
    this.updateInterval = setInterval(() => {
      this.fetchLatestData();
    }, 30000);
    
    // Obtener datos iniciales
    this.fetchLatestData();
  }
  
  private async fetchLatestData() {
    try {
      // En un caso real, esto obtendría datos de una API
      // Aquí simulamos datos para demostración
      const mockData: MarketData = {
        price: Math.random() * 100 + 50, // $50-$150
        volume: Math.random() * 1000000000, // 0-1B
        change24h: (Math.random() * 10) - 5, // -5% a +5%
        high24h: Math.random() * 100 + 60, // $60-$160
        low24h: Math.random() * 50 + 40, // $40-$90
        timestamp: Date.now()
      };
      
      this.currentData = mockData;
      
      // Notificar a los listeners
      this.notifyListeners();
    } catch (error) {
      console.error("Error fetching market data:", error);
    }
  }
  
  private notifyListeners() {
    if (this.currentData) {
      this.listeners.forEach(listener => {
        listener(this.currentData!);
      });
    }
  }
  
  public getCurrentData(): MarketData | null {
    return this.currentData;
  }
  
  public subscribe(listener: (data: MarketData) => void) {
    this.listeners.push(listener);
    
    // Enviar datos actuales inmediatamente si están disponibles
    if (this.currentData) {
      listener(this.currentData);
    }
    
    // Devolver función para cancelar suscripción
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  public getVolumeChange(timeframe: '1h' | '24h'): number {
    // En un caso real, esto calcularía el cambio de volumen
    // Aquí simulamos datos para demostración
    return timeframe === '1h' ? Math.random() * 10 - 5 : Math.random() * 20 - 10;
  }
}

export const marketDataService = new MarketDataService();
