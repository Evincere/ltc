import { HistoricalData } from '@/types/market';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>>;
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutos por defecto

  private constructor() {
    this.cache = new Map();
    this.loadFromLocalStorage();
    this.startCleanupInterval();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    this.cache.set(key, item);
    this.saveToLocalStorage();
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.saveToLocalStorage();
      return null;
    }

    return item.data;
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): void {
    this.cache.delete(key);
    this.saveToLocalStorage();
  }

  public clear(): void {
    this.cache.clear();
    this.saveToLocalStorage();
  }

  // Métodos específicos para datos de mercado
  public setMarketData(key: string, data: HistoricalData[], ttl: number = this.defaultTTL): void {
    this.set<HistoricalData[]>(`market_${key}`, data, ttl);
  }

  public getMarketData(key: string): HistoricalData[] | null {
    return this.get<HistoricalData[]>(`market_${key}`);
  }

  // Métodos para indicadores técnicos
  public setIndicator(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.set<any>(`indicator_${key}`, data, ttl);
  }

  public getIndicator(key: string): any | null {
    return this.get<any>(`indicator_${key}`);
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.cache.delete(key);
        }
      }
      this.saveToLocalStorage();
    }, 60000); // Limpiar cada minuto
  }

  private saveToLocalStorage(): void {
    try {
      const serializedCache = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem('app_cache', serializedCache);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const serializedCache = localStorage.getItem('app_cache');
      if (serializedCache) {
        const entries = JSON.parse(serializedCache);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
      this.cache = new Map();
    }
  }
}

export const cacheService = CacheService.getInstance(); 