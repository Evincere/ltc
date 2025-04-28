# Changelog

## [Sprint 6: Integración de Datos Reales] - 2024-05-15

### Añadido
- Integración con CoinMarketCap API
  - Cliente API con manejo de rate limits y caché
  - Servicio para obtener precios actuales y datos históricos
  - Endpoint de prueba para verificar la integración
- Integración con Bitso API
  - Cliente API mejorado con manejo de rate limits y caché
  - Servicio de trading con soporte para operaciones reales
  - Componentes de UI para configurar credenciales y monitorear operaciones
  - Nueva página de trading con datos reales

### Planificado
- Integración con APIs adicionales (Blockchair para datos on-chain)
- Implementación de análisis técnico con datos reales
- Desarrollo de modelo de predicción LSTM real
- Implementación de backend para WebSockets y notificaciones
- Configuración de base de datos para almacenamiento persistente
- Pruebas de integración y optimización de rendimiento

## [Sprint 3] - 2024-03-20

### Añadido
- Implementación de sistema de alertas de precios
- Integración de notificaciones en tiempo real
- Mejoras en la visualización de predicciones
- Optimización del rendimiento del dashboard
- Sistema de configuración de alertas personalizadas

### Corregido
- Error de React no definido en componentes
- Conflictos de tipos en TechnicalIndicators
- Problemas con íconos no definidos
- Mejoras en la gestión de estado

### Cambiado
- Refactorización de componentes del dashboard
- Mejora en la estructura de archivos
- Optimización de imports