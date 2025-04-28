"use client";

import crypto from 'crypto';
import { 
  BitsoCredentials, 
  BitsoBalance, 
  BitsoOrder, 
  BitsoTicker, 
  BitsoOrderBook, 
  BitsoTrade 
} from './bitso-api';

// Configuración
const API_BASE_URL = 'https://api.bitso.com/v3';
const CACHE_DURATION = 10 * 1000; // 10 segundos para datos públicos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Interfaces adicionales
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
}

// Clase principal para interactuar con la API de Bitso
export class BitsoApiReal {
  private static instance: BitsoApiReal;
  private credentials: BitsoCredentials | null = null;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private rateLimit: RateLimitInfo = { remaining: 300, reset: 0 }; // Valores por defecto
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  private constructor() {}

  public static getInstance(): BitsoApiReal {
    if (!BitsoApiReal.instance) {
      BitsoApiReal.instance = new BitsoApiReal();
    }
    return BitsoApiReal.instance;
  }

  /**
   * Establece las credenciales para la API
   */
  public setCredentials(credentials: BitsoCredentials): void {
    this.credentials = credentials;
    // Guardar en localStorage (en producción, usar un método más seguro)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bitsoCredentials', JSON.stringify(credentials));
    }
  }

  /**
   * Carga las credenciales desde localStorage
   */
  public loadCredentials(): boolean {
    if (typeof window !== 'undefined') {
      const savedCredentials = localStorage.getItem('bitsoCredentials');
      if (savedCredentials) {
        try {
          this.credentials = JSON.parse(savedCredentials);
          return true;
        } catch (error) {
          console.error('Error loading Bitso credentials:', error);
        }
      }
    }
    return false;
  }

  /**
   * Verifica si las credenciales están configuradas
   */
  public hasCredentials(): boolean {
    return this.credentials !== null;
  }

  /**
   * Genera los encabezados de autenticación para las solicitudes privadas
   */
  private generateAuthHeaders(
    httpMethod: string,
    requestPath: string,
    requestBody: string = ''
  ): Record<string, string> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const nonce = new Date().getTime();
    const message = `${nonce}${httpMethod}${requestPath}${requestBody}`;
    
    const signature = crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(message)
      .digest('hex');

    return {
      'Authorization': `Bitso ${this.credentials.apiKey}:${nonce}:${signature}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Gestiona el rate limiting
   */
  private async handleRateLimit(): Promise<void> {
    // Si estamos cerca del límite, añadir a la cola
    if (this.rateLimit.remaining < 10) {
      const now = Date.now();
      const resetTime = this.rateLimit.reset * 1000; // Convertir a milisegundos
      
      if (now < resetTime) {
        // Esperar hasta que se reinicie el rate limit
        const waitTime = resetTime - now + 100; // Añadir 100ms de margen
        console.log(`Rate limit casi alcanzado, esperando ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Actualiza la información de rate limit basada en las cabeceras de respuesta
   */
  private updateRateLimit(headers: Headers): void {
    const remaining = headers.get('X-Bitso-Limit-Remaining');
    const reset = headers.get('X-Bitso-Limit-Reset');
    
    if (remaining) {
      this.rateLimit.remaining = parseInt(remaining, 10);
    }
    
    if (reset) {
      this.rateLimit.reset = parseInt(reset, 10);
    }
  }

  /**
   * Procesa la cola de solicitudes
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      await this.handleRateLimit();
      
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Error processing queued request:', error);
        }
      }
      
      // Pequeña pausa entre solicitudes
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Añade una solicitud a la cola y comienza a procesarla
   */
  private enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      // Iniciar procesamiento de la cola si no está en curso
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Realiza una solicitud con reintentos
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = MAX_RETRIES
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // Actualizar información de rate limit
      this.updateRateLimit(response.headers);
      
      if (!response.ok) {
        // Si es un error 429 (Too Many Requests), esperar y reintentar
        if (response.status === 429 && retries > 0) {
          console.log(`Rate limit excedido, reintentando en ${RETRY_DELAY}ms`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return this.fetchWithRetry(url, options, retries - 1);
        }
        
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (retries > 0) {
        console.log(`Error en la solicitud, reintentando en ${RETRY_DELAY}ms`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Realiza una solicitud pública a la API (no requiere autenticación)
   */
  private async publicRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, any> = {},
    useCache: boolean = true
  ): Promise<T> {
    // Construir la URL con los parámetros
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (method === 'GET' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
    }
    
    const urlString = url.toString();
    const cacheKey = `${method}:${urlString}`;
    
    // Verificar caché para solicitudes GET
    if (method === 'GET' && useCache) {
      const cachedEntry = this.cache.get(cacheKey);
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_DURATION) {
        console.log(`Usando datos en caché para: ${cacheKey}`);
        return cachedEntry.data;
      }
    }
    
    return this.enqueueRequest(async () => {
      try {
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (method === 'POST' && Object.keys(params).length > 0) {
          options.body = JSON.stringify(params);
        }

        const response = await this.fetchWithRetry(urlString, options);
        const data = await response.json();
        
        if (data.success !== true) {
          throw new Error(data.error?.message || 'Unknown API error');
        }

        // Guardar en caché para solicitudes GET
        if (method === 'GET' && useCache) {
          this.cache.set(cacheKey, { data: data.payload, timestamp: Date.now() });
        }

        return data.payload as T;
      } catch (error) {
        console.error('Error in Bitso API request:', error);
        throw error;
      }
    });
  }

  /**
   * Realiza una solicitud privada a la API (requiere autenticación)
   */
  private async privateRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    params: Record<string, any> = {}
  ): Promise<T> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    return this.enqueueRequest(async () => {
      try {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        let requestPath = endpoint;
        let body = '';
        
        if (method === 'GET' && Object.keys(params).length > 0) {
          Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
          });
          requestPath = `${endpoint}?${url.searchParams.toString()}`;
        } else if (method === 'POST' && Object.keys(params).length > 0) {
          body = JSON.stringify(params);
        }

        const headers = this.generateAuthHeaders(method, requestPath, body);
        
        const options: RequestInit = {
          method,
          headers
        };

        if (body) {
          options.body = body;
        }

        const response = await this.fetchWithRetry(url.toString(), options);
        const data = await response.json();
        
        if (data.success !== true) {
          throw new Error(data.error?.message || 'Unknown API error');
        }

        return data.payload as T;
      } catch (error) {
        console.error('Error in Bitso API private request:', error);
        throw error;
      }
    });
  }

  /**
   * Limpia la caché
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // Métodos públicos de la API

  /**
   * Obtiene el ticker de un libro de órdenes
   */
  public async getTicker(book: string): Promise<BitsoTicker> {
    return this.publicRequest<BitsoTicker>(`/ticker/?book=${book}`);
  }

  /**
   * Obtiene múltiples tickers
   */
  public async getTickers(books: string[]): Promise<Record<string, BitsoTicker>> {
    const results: Record<string, BitsoTicker> = {};
    
    // Realizar solicitudes en paralelo
    await Promise.all(
      books.map(async (book) => {
        try {
          results[book] = await this.getTicker(book);
        } catch (error) {
          console.error(`Error fetching ticker for ${book}:`, error);
        }
      })
    );
    
    return results;
  }

  /**
   * Obtiene el libro de órdenes
   */
  public async getOrderBook(book: string, aggregate: boolean = true): Promise<BitsoOrderBook> {
    return this.publicRequest<BitsoOrderBook>(
      `/order_book/?book=${book}&aggregate=${aggregate}`
    );
  }

  /**
   * Obtiene las operaciones recientes
   */
  public async getTrades(book: string, limit: number = 25): Promise<BitsoTrade[]> {
    return this.publicRequest<BitsoTrade[]>(
      `/trades/?book=${book}&limit=${limit}`
    );
  }

  /**
   * Obtiene los libros disponibles
   */
  public async getAvailableBooks(): Promise<string[]> {
    interface Book {
      book: string;
      minimum_amount: string;
      maximum_amount: string;
      minimum_price: string;
      maximum_price: string;
      minimum_value: string;
      maximum_value: string;
    }
    
    const books = await this.publicRequest<Book[]>('/available_books');
    return books.map(book => book.book);
  }

  // Métodos privados de la API (requieren autenticación)

  /**
   * Obtiene el balance de la cuenta
   */
  public async getBalance(): Promise<BitsoBalance[]> {
    return this.privateRequest<BitsoBalance[]>('/balance');
  }

  /**
   * Obtiene las órdenes abiertas
   */
  public async getOpenOrders(book?: string): Promise<BitsoOrder[]> {
    const params: Record<string, any> = {};
    if (book) {
      params.book = book;
    }
    return this.privateRequest<BitsoOrder[]>('/open_orders', 'GET', params);
  }

  /**
   * Crea una nueva orden
   */
  public async placeOrder(
    book: string,
    side: 'buy' | 'sell',
    type: 'limit' | 'market',
    amount: string,
    price?: string,
    timeInForce?: 'goodtillcancelled' | 'fillorkill' | 'immediateorcancel'
  ): Promise<BitsoOrder> {
    // Validar parámetros
    if (!book) throw new Error('Book is required');
    if (!side) throw new Error('Side is required');
    if (!type) throw new Error('Type is required');
    if (!amount) throw new Error('Amount is required');
    if (type === 'limit' && !price) throw new Error('Price is required for limit orders');
    
    const params: Record<string, any> = {
      book,
      side,
      type,
      amount
    };

    if (price && type === 'limit') {
      params.price = price;
    }

    if (timeInForce) {
      params.time_in_force = timeInForce;
    }

    return this.privateRequest<BitsoOrder>('/orders', 'POST', params);
  }

  /**
   * Cancela una orden
   */
  public async cancelOrder(orderId: string): Promise<string> {
    if (!orderId) throw new Error('Order ID is required');
    return this.privateRequest<string>(`/orders/${orderId}`, 'DELETE');
  }

  /**
   * Cancela todas las órdenes abiertas
   */
  public async cancelAllOrders(): Promise<string[]> {
    return this.privateRequest<string[]>('/orders/all', 'DELETE');
  }

  /**
   * Obtiene el historial de órdenes
   */
  public async getOrderHistory(
    book?: string,
    limit: number = 25,
    marker?: string
  ): Promise<BitsoOrder[]> {
    const params: Record<string, any> = { limit: limit.toString() };
    
    if (book) {
      params.book = book;
    }
    
    if (marker) {
      params.marker = marker;
    }
    
    return this.privateRequest<BitsoOrder[]>('/user_trades', 'GET', params);
  }

  /**
   * Obtiene información de la cuenta
   */
  public async getAccountInfo(): Promise<any> {
    return this.privateRequest<any>('/account_status');
  }

  /**
   * Valida las credenciales de API
   */
  public async validateCredentials(): Promise<boolean> {
    try {
      await this.getBalance();
      return true;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }
}

// Instancia singleton para usar en toda la aplicación
export const bitsoApiReal = new BitsoApiReal();
