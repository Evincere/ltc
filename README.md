# LTC Price Prophet

## Descripción

LTC Price Prophet es una aplicación diseñada para predecir los precios futuros de Litecoin (LTC).  Utiliza un modelo de inteligencia artificial (IA) avanzado basado en redes neuronales Bi-LSTM para generar predicciones precisas.  La aplicación ofrece a inversores, traders y analistas una plataforma integral para tomar decisiones informadas, combinando predicciones del modelo con análisis técnico y métricas adicionales.

## Características

*   **Predicción de Precios con Bi-LSTM:**  La aplicación emplea un modelo Bi-LSTM para predecir el precio de LTC en las próximas 24 horas.  El modelo se basa en datos históricos de precios y es servido a través de la API "geaia" de Google.
*   **Análisis Técnico:**  Se incluyen indicadores técnicos clave como el Índice de Fuerza Relativa (RSI), la Convergencia/Divergencia de la Media Móvil (MACD) y la Media Móvil Simple (SMA) para complementar las predicciones del modelo.
*   **Métricas On-Chain (Simuladas):**  El dashboard muestra métricas simuladas de la actividad de la blockchain de Litecoin, como el número de transacciones, el volumen total y las direcciones activas.  (Nota:  Estas métricas son actualmente datos de ejemplo y no reflejan valores reales).
*   **Sentimiento del Mercado (Simulado):**  Se presenta un análisis de sentimiento del mercado simulado, representando el sentimiento general en redes sociales y otras fuentes.  (Nota:  Este análisis es actualmente un dato de ejemplo y no refleja el sentimiento real del mercado).
*   **Alertas de Precio:**  Los usuarios pueden configurar alertas para ser notificados cuando el precio predicho de LTC supere un umbral específico.

## Tecnologías

*   **Frontend:** React,  TypeScript,  recharts (para gráficos),  shadcn/ui (para componentes de interfaz).
*   **Backend:**  API "geaia" de Google (utilizando un modelo Bi-LSTM).
*   **Bibliotecas:**  technicalindicators (para cálculos de indicadores técnicos).

## Instalación y Uso

1.  **Frontend:**
    *   Asegúrate de tener Node.js y npm instalados.
    *   Clona el repositorio del proyecto.
    *   Navega al directorio del proyecto en tu terminal.
    *   Ejecuta `npm install` para instalar las dependencias.
    *   Ejecuta `npm run dev` para iniciar el servidor de desarrollo.
    *   Abre tu navegador y visita la URL que se muestra en la terminal (normalmente `http://localhost:3000`).

2.  **Backend:**
    *   El backend utiliza la API "geaia" de Google.  Para ejecutarlo o configurarlo, consulta la documentación interna o contacta al equipo de desarrollo responsable de esta API.  (Nota:  Esta es una suposición debido a la falta de información sobre la implementación del backend).

## Contribución

[Si el proyecto es de código abierto, agrega información sobre cómo otros pueden contribuir, por ejemplo, un enlace a las guías de contribución o instrucciones sobre cómo crear una solicitud de extracción (Pull Request).]

## Licencia

[Si aplica, indica la licencia bajo la cual se distribuye el proyecto.]

## Contacto

[Agrega tu información de contacto o la del mantenedor del proyecto.]
