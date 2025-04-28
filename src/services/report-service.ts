// Servicio para la generación de reportes

export type ReportType = 'performance' | 'trading' | 'fundamental' | 'custom';
export type ReportFormat = 'pdf' | 'csv' | 'json';
export type ReportPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  customDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  includeCharts?: boolean;
  includeTables?: boolean;
  sections?: string[];
  customTitle?: string;
}

export interface ReportResult {
  id: string;
  title: string;
  createdAt: Date;
  type: ReportType;
  format: ReportFormat;
  url: string;
  size: number; // en bytes
}

class ReportService {
  private reports: ReportResult[] = [];
  
  constructor() {
    // Cargar reportes guardados
    this.loadSavedReports();
  }
  
  /**
   * Carga los reportes guardados del almacenamiento local
   */
  private loadSavedReports(): void {
    try {
      const savedReports = localStorage.getItem('savedReports');
      if (savedReports) {
        this.reports = JSON.parse(savedReports);
      }
    } catch (error) {
      console.error('Error loading saved reports:', error);
    }
  }
  
  /**
   * Guarda los reportes en el almacenamiento local
   */
  private saveReports(): void {
    try {
      localStorage.setItem('savedReports', JSON.stringify(this.reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  }
  
  /**
   * Genera un nuevo reporte basado en la configuración proporcionada
   */
  public async generateReport(config: ReportConfig): Promise<ReportResult> {
    // Simular tiempo de generación
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generar título si no se proporciona uno personalizado
    const title = config.customTitle || this.generateDefaultTitle(config);
    
    // Crear resultado del reporte
    const report: ReportResult = {
      id: Math.random().toString(36).substring(2, 15),
      title,
      createdAt: new Date(),
      type: config.type,
      format: config.format,
      url: this.generateMockUrl(config),
      size: this.generateMockSize(config)
    };
    
    // Añadir a la lista de reportes
    this.reports.push(report);
    this.saveReports();
    
    return report;
  }
  
  /**
   * Genera un título predeterminado para el reporte
   */
  private generateDefaultTitle(config: ReportConfig): string {
    const typeLabels = {
      performance: 'Rendimiento',
      trading: 'Trading',
      fundamental: 'Análisis Fundamental',
      custom: 'Personalizado'
    };
    
    const periodLabels = {
      day: 'Diario',
      week: 'Semanal',
      month: 'Mensual',
      year: 'Anual',
      custom: 'Personalizado'
    };
    
    return `Reporte de ${typeLabels[config.type]} ${periodLabels[config.period]}`;
  }
  
  /**
   * Genera una URL simulada para el reporte
   */
  private generateMockUrl(config: ReportConfig): string {
    const timestamp = Date.now();
    const fileName = `report_${config.type}_${config.period}_${timestamp}.${config.format}`;
    return `/reports/${fileName}`;
  }
  
  /**
   * Genera un tamaño simulado para el reporte
   */
  private generateMockSize(config: ReportConfig): number {
    // Tamaño base según el formato
    let baseSize = 0;
    switch (config.format) {
      case 'pdf':
        baseSize = 500 * 1024; // 500 KB
        break;
      case 'csv':
        baseSize = 50 * 1024; // 50 KB
        break;
      case 'json':
        baseSize = 100 * 1024; // 100 KB
        break;
    }
    
    // Ajustar según el período
    let periodMultiplier = 1;
    switch (config.period) {
      case 'day':
        periodMultiplier = 1;
        break;
      case 'week':
        periodMultiplier = 7;
        break;
      case 'month':
        periodMultiplier = 30;
        break;
      case 'year':
        periodMultiplier = 365;
        break;
      case 'custom':
        if (config.customDateRange) {
          const days = Math.ceil(
            (config.customDateRange.endDate.getTime() - config.customDateRange.startDate.getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          periodMultiplier = Math.max(1, days);
        }
        break;
    }
    
    // Ajustar según inclusión de gráficos y tablas
    if (config.includeCharts) {
      baseSize += 200 * 1024; // +200 KB por gráficos
    }
    
    if (config.includeTables) {
      baseSize += 100 * 1024; // +100 KB por tablas
    }
    
    // Calcular tamaño final con algo de variación aleatoria
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 a 1.2
    return Math.round(baseSize * Math.sqrt(periodMultiplier) * randomFactor);
  }
  
  /**
   * Obtiene todos los reportes generados
   */
  public getReports(): ReportResult[] {
    return [...this.reports];
  }
  
  /**
   * Obtiene un reporte específico por ID
   */
  public getReportById(id: string): ReportResult | undefined {
    return this.reports.find(report => report.id === id);
  }
  
  /**
   * Elimina un reporte por ID
   */
  public deleteReport(id: string): boolean {
    const initialLength = this.reports.length;
    this.reports = this.reports.filter(report => report.id !== id);
    
    if (this.reports.length !== initialLength) {
      this.saveReports();
      return true;
    }
    
    return false;
  }
  
  /**
   * Descarga un reporte (simulado)
   */
  public downloadReport(id: string): void {
    const report = this.getReportById(id);
    if (!report) {
      throw new Error(`Report with ID ${id} not found`);
    }
    
    // En un entorno real, aquí redirigimos al usuario a la URL del reporte
    // Para este ejemplo, simplemente mostramos un mensaje en la consola
    console.log(`Downloading report: ${report.title} (${report.url})`);
    
    // Simular descarga creando un enlace temporal
    const link = document.createElement('a');
    link.href = report.url;
    link.download = report.url.split('/').pop() || 'report';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const reportService = new ReportService();
