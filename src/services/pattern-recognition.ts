// Servicio para reconocimiento de patrones de velas

interface CandlePattern {
  name: "doji" | "hammer" | "engulfing" | "morning-star" | "evening-star";
  timeframe: "1h" | "4h" | "1d";
  timestamp: number;
  bullish: boolean; // true para patrones alcistas, false para bajistas
}

class PatternRecognitionService {
  private detectedPatterns: CandlePattern[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Iniciar actualizaciones periódicas
    this.startUpdates();
  }
  
  private startUpdates() {
    // Actualizar cada hora
    this.updateInterval = setInterval(() => {
      this.detectPatterns();
    }, 3600000);
    
    // Detectar patrones iniciales
    this.detectPatterns();
  }
  
  private detectPatterns() {
    // En un caso real, esto analizaría datos de velas reales
    // Aquí simulamos detecciones aleatorias para demostración
    
    const timestamp = Date.now();
    const patternTypes: Array<"doji" | "hammer" | "engulfing" | "morning-star" | "evening-star"> = [
      "doji", "hammer", "engulfing", "morning-star", "evening-star"
    ];
    const timeframes: Array<"1h" | "4h" | "1d"> = ["1h", "4h", "1d"];
    
    // Limpiar patrones antiguos (más de 24 horas)
    this.detectedPatterns = this.detectedPatterns.filter(
      pattern => (timestamp - pattern.timestamp) < 24 * 60 * 60 * 1000
    );
    
    // Simular detección de 0-3 patrones nuevos
    const numNewPatterns = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numNewPatterns; i++) {
      const randomPattern: CandlePattern = {
        name: patternTypes[Math.floor(Math.random() * patternTypes.length)],
        timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
        timestamp,
        bullish: Math.random() > 0.5
      };
      
      this.detectedPatterns.push(randomPattern);
    }
  }
  
  // Métodos públicos
  
  public getDetectedPatterns(): CandlePattern[] {
    return [...this.detectedPatterns];
  }
  
  public checkForPattern(
    patternName: "doji" | "hammer" | "engulfing" | "morning-star" | "evening-star",
    timeframe: "1h" | "4h" | "1d"
  ): boolean {
    // Verificar si se ha detectado el patrón especificado en el timeframe dado
    return this.detectedPatterns.some(
      pattern => pattern.name === patternName && pattern.timeframe === timeframe
    );
  }
  
  public getLatestPattern(): CandlePattern | null {
    if (this.detectedPatterns.length === 0) return null;
    
    // Ordenar por timestamp (más reciente primero)
    const sortedPatterns = [...this.detectedPatterns].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    
    return sortedPatterns[0];
  }
}

export const patternRecognitionService = new PatternRecognitionService();
