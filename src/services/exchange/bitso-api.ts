import crypto from 'crypto';

// Interfaces para la API de Bitso
export interface BitsoCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface BitsoBalance {
  currency: string;
  total: string;
  locked: string;
  available: string;
}

export interface BitsoOrder {
  id: string;
  book: string;
  type: 'buy' | 'sell';
  price: string;
  status: 'open' | 'partially filled' | 'filled' | 'cancelled';
  created_at: string;
  updated_at: string;
  original_amount: string;
  unfilled_amount: string;
}

export interface BitsoTicker {
  book: string;
  high: string;
  last: string;
  low: string;
  vwap: string;
  volume: string;
  ask: string;
  bid: string;
  created_at: string;
}

export interface BitsoOrderBook {
  asks: [string, string][];
  bids: [string, string][];
  updated_at: string;
  sequence: number;
}

export interface BitsoTrade {
  book: string;
  created_at: string;
  amount: string;
  maker_side: 'buy' | 'sell';
  price: string;
  tid: number;
}

// Clase principal para interactuar con la API de Bitso
export class BitsoApi {
  private readonly baseUrl = 'https://api.bitso.com/v3';
  private credentials: BitsoCredentials | null = null;

  constructor(credentials?: BitsoCredentials) {
    if (credentials) {
      this.setCredentials(credentials);
    }
  }

  /**
   * Establece las credenciales para la API
   */
  public setCredentials(credentials: BitsoCredentials): void {
    this.credentials = credentials;
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
   * Realiza una solicitud pública a la API (no requiere autenticación)
   */
  private async publicRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      if (method === 'GET' && Object.keys(params).length > 0) {
        Object.keys(params).forEach(key => 
          url.searchParams.append(key, params[key])
        );
      }

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (method === 'POST' && Object.keys(params).length > 0) {
        options.body = JSON.stringify(params);
      }

      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success !== true) {
        throw new Error(data.error?.message || 'Unknown API error');
      }

      return data.payload as T;
    } catch (error) {
      console.error('Error in Bitso API request:', error);
      throw error;
    }
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

    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
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

      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success !== true) {
        throw new Error(data.error?.message || 'Unknown API error');
      }

      return data.payload as T;
    } catch (error) {
      console.error('Error in Bitso API private request:', error);
      throw error;
    }
  }

  // Métodos públicos de la API

  /**
   * Obtiene el ticker de un libro de órdenes
   */
  public async getTicker(book: string): Promise<BitsoTicker> {
    return this.publicRequest<BitsoTicker>(`/ticker/?book=${book}`);
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
    return this.privateRequest<string>(`/orders/${orderId}`, 'DELETE');
  }

  /**
   * Cancela todas las órdenes abiertas
   */
  public async cancelAllOrders(): Promise<string[]> {
    return this.privateRequest<string[]>('/orders/all', 'DELETE');
  }
}

// Instancia singleton para usar en toda la aplicación
export const bitsoApi = new BitsoApi();
