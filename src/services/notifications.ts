"use client";

import { AlertConfig } from "@/components/dashboard/alerts/alert-config"

interface Notification {
  id: string
  type: "price" | "technical" | "sentiment" | "indicator" | "volume" | "pattern"
  title: string
  message: string
  timestamp: number
  read: boolean
  alertId?: string
}

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private ws: WebSocket | null = null
  private listeners: ((notification: Notification) => void)[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    // Solo conectar si estamos en el navegador
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  private connect() {
    try {
      this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:9002/ws')

      this.ws.onopen = () => {
        console.log('WebSocket conectado')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          this.notifyListeners(notification)
        } catch (error) {
          console.error('Error al procesar mensaje de WebSocket:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket desconectado')
        this.reconnect()
      }

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error)
      }
    } catch (error) {
      console.error('Error al conectar WebSocket:', error)
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts)
    }
  }

  public subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(notification: Notification) {
    this.listeners.forEach(listener => listener(notification))
  }

  public sendAlert(alert: AlertConfig & { title?: string, message?: string }) {
    // Generar título y mensaje según el tipo de alerta
    let title = alert.title || '';
    let message = alert.message || '';
    let type: Notification['type'] = 'price';

    if (!title || !message) {
      switch (alert.alertType) {
        case 'price':
          type = 'price';
          title = `Alerta de Precio ${alert.type === "above" ? "superior" : "inferior"}`;
          message = `El precio ha ${alert.type === "above" ? "superado" : "caído por debajo de"} $${alert.price?.toFixed(2)}`;
          break;

        case 'indicator':
          type = 'indicator';
          if (alert.indicator) {
            title = `Alerta de Indicador ${alert.indicator.name.toUpperCase()}`;
            message = `${alert.indicator.name.toUpperCase()} ha ${
              alert.indicator.condition === "above" ? "superado" :
              alert.indicator.condition === "below" ? "caído por debajo de" :
              alert.indicator.condition === "cross-above" ? "cruzado por encima de" :
              "cruzado por debajo de"
            } ${alert.indicator.value}`;
          }
          break;

        case 'volume':
          type = 'volume';
          if (alert.volume) {
            title = "Alerta de Volumen";
            if (alert.volume.condition === "above" || alert.volume.condition === "below") {
              message = `El volumen está ${
                alert.volume.condition === "above" ? "por encima de" : "por debajo de"
              } $${alert.volume.value.toLocaleString()}`;
            } else {
              message = `El volumen ha ${
                alert.volume.condition === "increase" ? "aumentado" : "disminuido"
              } un ${alert.volume.percentChange}%`;
            }
          }
          break;

        case 'pattern':
          type = 'pattern';
          if (alert.pattern) {
            title = "Patrón Detectado";
            message = `Se ha detectado un patrón ${
              alert.pattern.name === "doji" ? "Doji" :
              alert.pattern.name === "hammer" ? "Hammer" :
              alert.pattern.name === "engulfing" ? "Engulfing" :
              alert.pattern.name === "morning-star" ? "Morning Star" :
              "Evening Star"
            } en el timeframe ${alert.pattern.timeframe}`;
          }
          break;
      }
    }

    // Crear notificación
    const notification: Notification = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      alertId: alert.id
    };

    // Enviar a través de WebSocket
    if (typeof window !== 'undefined' && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          type: 'alert',
          data: notification
        }));
      } catch (error) {
        console.error('Error al enviar alerta por WebSocket:', error);
      }
    }

    // Enviar notificación push si está habilitado
    this.sendPushNotification({
      title,
      body: message,
      tag: `alert-${alert.id}`,
      data: { alertId: alert.id }
    });

    // Notificar a los listeners locales
    this.notifyListeners(notification);

    return notification;
  }

  // Método para enviar notificaciones push
  private sendPushNotification(options: PushNotificationOptions) {
    // Solo ejecutar en el navegador
    if (typeof window === 'undefined') {
      return;
    }

    // Verificar si las notificaciones push están disponibles
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones push');
      return;
    }

    try {
      // Verificar permiso
      if (Notification.permission === 'granted') {
        // Crear y mostrar notificación
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          tag: options.tag,
          data: options.data
        });

        notification.onclick = function() {
          window.focus();
          this.close();
        };
      }
      // Solicitar permiso si no está denegado
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.sendPushNotification(options);
          }
        });
      }
    } catch (error) {
      console.error('Error al enviar notificación push:', error);
    }
  }

  public markAsRead(notificationId: string) {
    if (typeof window !== 'undefined' && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          type: 'mark_read',
          data: { id: notificationId }
        }));
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    }
  }
}

export const notificationService = new NotificationService()