import { HistoricalData } from '@/types/market';

export interface DrawingTool {
  id: string;
  type: 'line' | 'ray' | 'segment' | 'rectangle' | 'fibonacci' | 'channel';
  points: { x: number; y: number }[];
  style: {
    color: string;
    width: number;
    dash?: number[];
  };
  metadata?: {
    label?: string;
    fibonacciLevels?: number[];
    channelWidth?: number;
  };
}

export class DrawingToolsService {
  private static instance: DrawingToolsService;
  private drawings: Map<string, DrawingTool[]>;

  private constructor() {
    this.drawings = new Map();
  }

  public static getInstance(): DrawingToolsService {
    if (!DrawingToolsService.instance) {
      DrawingToolsService.instance = new DrawingToolsService();
    }
    return DrawingToolsService.instance;
  }

  public addDrawing(chartId: string, tool: DrawingTool): void {
    const existingDrawings = this.drawings.get(chartId) || [];
    this.drawings.set(chartId, [...existingDrawings, tool]);
  }

  public removeDrawing(chartId: string, toolId: string): void {
    const existingDrawings = this.drawings.get(chartId) || [];
    this.drawings.set(
      chartId,
      existingDrawings.filter(tool => tool.id !== toolId)
    );
  }

  public getDrawings(chartId: string): DrawingTool[] {
    return this.drawings.get(chartId) || [];
  }

  public clearDrawings(chartId: string): void {
    this.drawings.delete(chartId);
  }

  // Métodos para crear herramientas específicas
  public createTrendLine(
    chartId: string,
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    style: Partial<DrawingTool['style']> = {}
  ): DrawingTool {
    const tool: DrawingTool = {
      id: `trend_${Date.now()}`,
      type: 'line',
      points: [startPoint, endPoint],
      style: {
        color: style.color || '#000000',
        width: style.width || 1,
        dash: style.dash || []
      }
    };
    this.addDrawing(chartId, tool);
    return tool;
  }

  public createFibonacciRetracement(
    chartId: string,
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    style: Partial<DrawingTool['style']> = {}
  ): DrawingTool {
    const tool: DrawingTool = {
      id: `fib_${Date.now()}`,
      type: 'fibonacci',
      points: [startPoint, endPoint],
      style: {
        color: style.color || '#000000',
        width: style.width || 1,
        dash: style.dash || [5, 5]
      },
      metadata: {
        fibonacciLevels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
      }
    };
    this.addDrawing(chartId, tool);
    return tool;
  }

  public createChannel(
    chartId: string,
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    width: number,
    style: Partial<DrawingTool['style']> = {}
  ): DrawingTool {
    const tool: DrawingTool = {
      id: `channel_${Date.now()}`,
      type: 'channel',
      points: [startPoint, endPoint],
      style: {
        color: style.color || '#000000',
        width: style.width || 1,
        dash: style.dash || []
      },
      metadata: {
        channelWidth: width
      }
    };
    this.addDrawing(chartId, tool);
    return tool;
  }

  public createRectangle(
    chartId: string,
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    style: Partial<DrawingTool['style']> = {}
  ): DrawingTool {
    const tool: DrawingTool = {
      id: `rect_${Date.now()}`,
      type: 'rectangle',
      points: [startPoint, endPoint],
      style: {
        color: style.color || '#000000',
        width: style.width || 1,
        dash: style.dash || []
      }
    };
    this.addDrawing(chartId, tool);
    return tool;
  }

  // Método para calcular niveles de Fibonacci
  public calculateFibonacciLevels(
    startPrice: number,
    endPrice: number,
    levels: number[] = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
  ): { level: number; price: number }[] {
    const priceRange = endPrice - startPrice;
    return levels.map(level => ({
      level,
      price: startPrice + priceRange * level
    }));
  }

  // Método para calcular puntos del canal
  public calculateChannelPoints(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    width: number
  ): { x: number; y: number }[] {
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const perpendicularAngle = angle + Math.PI / 2;
    
    const offsetX = Math.cos(perpendicularAngle) * width;
    const offsetY = Math.sin(perpendicularAngle) * width;

    return [
      startPoint,
      endPoint,
      { x: endPoint.x + offsetX, y: endPoint.y + offsetY },
      { x: startPoint.x + offsetX, y: startPoint.y + offsetY }
    ];
  }
}

export const drawingToolsService = DrawingToolsService.getInstance(); 