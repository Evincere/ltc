# **App Name**: LTC Price Prophet

## Core Features:

- Price Prediction: Use the Bi-LSTM model to predict the future price of Litecoin based on historical data and sentiment analysis. The AI model will use all the data available as a tool to output a price prediction.
- Interactive Charts: Display interactive charts showing predicted Litecoin prices, historical data, and technical indicators.
- Sentiment Display: Display sentiment analysis results derived from social media and news articles related to Litecoin.
- Price Alerts: Allow users to configure and receive alerts when the predicted price reaches a specified threshold.
- Technical Analysis View: Provide a user-friendly interface to view key technical indicators like RSI, MACD, and Moving Averages.

## Style Guidelines:

- Primary color: Dark charcoal background (#121212) to provide a modern and neutral base for a dark theme.
- Secondary color: Light teal (#64FFDA) for text and key elements to ensure readability and contrast against the dark background.
- Accent color 1: Electric purple (#BB86FC) as an accent color for interactive elements, highlights, and call-to-action buttons.
- Accent color 2: Neon green (#00FF00) for secondary interactive elements and data visualization.
- Surface color: A slightly lighter shade of charcoal (#1E1E1E) with a subtle blur effect (glassmorphism) for panels and cards to add depth and visual interest.
- Maintain clear and consistent typography for all text elements.
- Use a consistent style of crisp, modern icons to represent different data types and actions. Apply a subtle glow effect to the icons.
- Employ a clean and structured layout with clear sections for different types of information, utilizing glassmorphism effects for panel backgrounds.
- Use subtle animations to provide feedback on interactions, with a slight glow effect on hover for interactive elements.

## Original User Request:
1. Introducción
La aplicación propuesta es una herramienta de inteligencia artificial (IA) diseñada para predecir precios futuros de Litecoin (LTC) mediante modelos de aprendizaje automático avanzados. Su objetivo es ofrecer a inversores, traders y analistas una plataforma integral para tomar decisiones informadas basadas en predicciones precisas y análisis técnico.

Este informe describe la arquitectura , tecnologías utilizadas , funcionalidades clave y métricas de rendimiento , basándose en la investigación detallada en el documento proporcionado [[File]] y referencias externas.

2. Arquitectura de la Aplicación
2.1 Componentes Principales
Módulo de Recopilación de Datos
Fuentes de datos :
Precios históricos : APIs de CoinGecko, Binance y CoinMarketCap [[File]].
Métricas on-chain : Blockchain de Litecoin (transacciones, dificultad de minería).
Análisis de sentimiento : Web scraping de redes sociales (Reddit, Twitter) y NLP para clasificar opiniones [[File]].
Variables macroeconómicas : APIs como FRED (tasas de interés, inflación).
Procesamiento : Normalización con Min-Max Scaler y limpieza de datos outliers [[File]].
Módulo de Modelos de IA
Modelo principal : Bi-LSTM (Bidirectional Long Short-Term Memory) con 3 capas, 100 neuronas cada una, activación ReLU y dropout de 0.2 para evitar sobreajuste [[File]].
Modelos complementarios : GRU y LSTM para enfoque ensemble y validación cruzada.
Hiperparámetros :
Tamaño de lote: 120.
Optimizador: Adam con learning rate adaptativo.
Pérdida: MSE (Mean Squared Error).
Épocas: 100 (con early stopping).
Interfaz de Usuario (UI)
Dashboard : Visualización en tiempo real de:
Gráficos de precios históricos y predicciones.
Análisis técnico (RSI, MACD, medias móviles).
Métricas on-chain y sentimiento del mercado.
Alertas configurables : Notificaciones por correo o API al alcanzar umbrales de precio.
Explicabilidad : Mostrar factores clave (ejemplo: aumento de transacciones on-chain o sentimiento positivo en redes sociales).
Sistema de Actualización Automática
Reentrenamiento periódico : Programado cada 24 horas usando cron jobs para integrar nuevos datos.
Validación continua : Monitoreo del MAPE (0.0411% en fase de prueba) y RMSE (8.0249) [[File]].
3. Tecnologías Utilizadas
Backend
Python (TensorFlow/PyTorch), Flask/Django, Pandas, NumPy
[[File]] 6.2,
Frontend
React.js/Vue.js, Chart.js/Plotly para visualizaciones interactivas
[[File]] 6.2,
Base de datos
PostgreSQL (series temporales), MongoDB (datos no estructurados)
[[File]] 6.2,
Cloud
AWS/GCP: Kubernetes para orquestación, Docker para contenedores
[[File]] 6.2,
APIs externas
CoinGecko API, Reddit API, blockchain explorers (Blockchair)
[[File]] 5.1,

4. Funcionalidades Clave
4.1 Predicción de Precios
Método :
Procesamiento de secuencias temporales con ventana móvil (ejemplo: 60 días para predecir el próximo precio).
Salida: Precio predicho con intervalo de confianza (ejemplo: $75 ± 0.5% en el próximo día).
Precisión :
MAPE: 0.0411% (mejor que LSTM y GRU solos [[File]]).
RMSE: 8.0249 , indicando errores mínimos en predicciones.
4.2 Análisis Técnico
Indicadores técnicos :
RSI (Identificación de sobrecompra/sobreventa).
MACD (Tendencias y divergencias).
Bandas de Bollinger (Volatilidad).
Patrones de trading :
Detección automática de triángulos, doble techo/suelo y divergencias.
4.3 Datos On-Chain y Sentimiento del Mercado
Métricas on-chain :
Transacciones diarias, tarifas promedio, edad promedio de monedas.
Análisis de sentimiento :
Clasificación de tweets y comentarios (positivo, neutro, negativo).
Volumen de menciones en redes sociales.
4.4 Alertas y Exportación de Datos
Alertas :
Configurables por usuario (ejemplo: notificación si el precio supera $80).
Exportación :
Informes PDF/Excel con predicciones, gráficos y análisis técnicos [[File]].
5. Implementación y Despliegue
5.1 Fases de Desarrollo
Planificación : Definición de requisitos y arquitectura [[File]], 
.
Desarrollo :
Backend: Entrenamiento del modelo Bi-LSTM y API REST.
Frontend: Dashboard con React.js y Chart.js.
Pruebas :
Validación de predicciones con datos históricos.
Pruebas de estrés para latencia y escalabilidad.
Despliegue :
Hosting en AWS/GCP con Kubernetes para orquestación.
Integración continua con GitHub Actions.
5.2 Consideraciones Técnicas
Latencia : Respuesta subsegundaria para consultas en tiempo real.
Seguridad :
Encriptación de API keys y datos sensibles.
Autenticación OAuth2 para usuarios.
Escalabilidad :
Soporte para 1000+ usuarios simultáneos.
Escalado automático en AWS.
6. Limitaciones y Mejoras Futuras
6.1 Limitaciones
Dependencia de datos históricos : No captura eventos imprevistos (ejemplo: regulaciones).
Volatilidad extrema : Baja precisión en períodos de crisis (ejemplo: colapsos de exchanges).
Reentrenamiento frecuente : Requiere recursos computacionales para mantener precisión.
6.2 Mejoras Futuras
Modelo ensemble : Integrar GRU y Bi-LSTM para mayor robustez.
Computación cuántica : Preparación para algoritmos post-cuánticos en la red de Litecoin [[File]].
Integración de IA generativa : Generar informes automáticos basados en predicciones y análisis.
7. Conclusión
La aplicación es una herramienta ** técnológica avanzada** que combina IA de vanguardia , análisis técnico y datos en tiempo real para predecir precios de Litecoin con precisión histórica (MAPE < 0.05%). Su diseño modular y escalabilidad la convierten en una solución viable para traders profesionales y principiantes, con un enfoque en transparencia y usabilidad.
  