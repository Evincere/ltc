# LTC Price Prophet

Sistema de predicción de precios de Litecoin utilizando inteligencia artificial.

## Características Principales

- Predicción de precios en tiempo real
- Análisis técnico avanzado
- Dashboard interactivo
- Sistema de alertas personalizadas
- Notificaciones en tiempo real
- Visualización de métricas on-chain
- Análisis de sentimiento del mercado

## Tecnologías Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- TensorFlow.js / PyTorch
- WebSocket para actualizaciones en tiempo real
- APIs externas:
  - CoinMarketCap API (precios y datos de mercado)
  - Bitso API (trading en tiempo real)
  - Blockchair API (datos on-chain, planificado)
- MongoDB / PostgreSQL para almacenamiento persistente
- Node.js para backend de WebSockets
- Sistema de notificaciones push
- Web Push API

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/ltc-price-prophet.git

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas principales
├── components/            # Componentes reutilizables
│   ├── dashboard/        # Componentes del dashboard
│   ├── charts/          # Componentes de gráficos
│   └── ui/              # Componentes de UI base
├── services/            # Servicios y API clients
├── lib/                 # Utilidades y helpers
└── types/              # Definiciones de tipos
```

## Estado Actual del Proyecto

### Sprint 6: Integración de Datos Reales (Planificado)
- Integración con APIs reales (CoinGecko, Bitso, Blockchair)
- Implementación de análisis técnico con datos reales
- Desarrollo de modelo de predicción LSTM real
- Implementación de backend para WebSockets y notificaciones
- Configuración de base de datos para almacenamiento persistente

### Sprint 5: Características Avanzadas (Completado)
- Implementación de sistema de trading automatizado
- Análisis fundamental y métricas de red
- Sistema de reportes personalizados
- Análisis de correlación entre activos

### Sprint 4: Optimización y Mejoras (Completado)
- Optimización de rendimiento y caché
- Mejoras en análisis técnico y patrones
- Sistema de backtesting avanzado
- Mejoras en sistema de alertas

### Sprint 3: Sistema de Alertas y Notificaciones (Completado)
- Implementación de sistema de alertas
- Integración de notificaciones en tiempo real
- Mejoras en la visualización de predicciones
- Optimización del rendimiento

### Sprint 2: Implementación de Widgets Principales (Completado)
- Implementación del dashboard interactivo
- Integración de análisis técnico
- Visualización de métricas on-chain
- Sistema de predicción de precios

### Sprint 1: Configuración Inicial (Completado)
- Configuración inicial del proyecto
- Integración con API de CoinGecko
- Implementación de modelos de ML
- Sistema básico de predicción

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
