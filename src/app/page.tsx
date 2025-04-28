'use client';

import React, { useState, useEffect } from 'react';

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {Icons} from '@/components/icons';
import {Button} from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {toast} from '@/hooks/use-toast';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import { ThemeToggle } from "@/components/theme-toggle"
import { PriceChart } from "@/components/charts/price-chart"
import { TechnicalIndicators } from "@/components/indicators/technical-indicators"
import { WidgetLayout } from "@/components/dashboard/widgets/widget-layout"
import { PriceWidget } from "@/components/dashboard/widgets/price-widget"
import { IndicatorsWidget } from "@/components/dashboard/widgets/indicators-widget"
import { AlertsWidget } from "@/components/dashboard/alerts/alerts-widget"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { SentimentWidget } from "@/components/dashboard/sentiment/sentiment-widget"
import { CorrelationAnalysis } from "@/components/analysis/CorrelationAnalysis"

import { getHistoricalPrice, getBiLSTMPrediction, calculateTechnicalIndicators, getLitecoinOnChainMetrics, getLitecoinSentiment } from '@/services/coingecko';
import { lstmPredictionService } from '@/services/lstm-prediction'
import { coinmarketcapService } from '@/services/coinmarketcap-service'
import { technicalIndicatorsService } from '@/services/technical-indicators'
import { HistoricalPrice, TechnicalIndicators } from '@/types'

interface Prediction {
  price: number
  confidence: number
}

interface TechnicalIndicatorsData {
  rsi: number[]
  macd: Array<{ MACD: number; signal: number; histogram: number }>
  sma: number[]
}

interface OnChainMetrics {
  transactions: number
  volume: number
  activeAddresses: number
}

interface SentimentData {
  sentiment: string
  score: number
}

export default function Home() {
  const [alertThreshold, setAlertThreshold] = useState<number | null>(null);

  const handleAlert = () => {
    if (alertThreshold === null) {
        toast({ title: "Alerta configurada", description: "Por favor, ingresa un precio umbral" });
        return;
    }
    toast({
      title: 'Alerta configurada',
      description: `Se te notificará cuando el precio predicho supere los $${alertThreshold.toFixed(2)}`,
    });
  };

  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [predictedPrice, setPredictedPrice] = useState<number>(0)
  const [confidence, setConfidence] = useState<number>(0)
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 0,
    macd: 0,
    bollinger: 0
  })

  const [priceData, setPriceData] = useState<any[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalPrice[]>([])
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators>({
    rsi: 0,
    macd: 0,
    bollinger: 0
  })
  const [onChainMetrics, setOnChainMetrics] = useState<OnChainMetrics | null>(null)
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const getSignal = (value: number, threshold: number = 50): "buy" | "sell" | "neutral" => {
    if (value > threshold + 10) return "sell"
    if (value < threshold - 10) return "buy"
    return "neutral"
  }

  const getStrength = (value: number, threshold: number = 50): number => {
    return Math.min(Math.abs(value - threshold) * 2, 100)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const price = await coinmarketcapService.getCurrentPrice()
        setCurrentPrice(price)

        const historical = await coinmarketcapService.getHistoricalData()
        setHistoricalData(historical)

        const indicators = await coinmarketcapService.getTechnicalIndicators()
        setTechnicalIndicators(indicators)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Actualizar cada minuto
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        // Obtener datos históricos de CoinMarketCap
        const data = await coinmarketcapService.getHistoricalData(30);

        // Formatear datos para gráficos
        const formattedData = data.map((item: HistoricalPrice) => ({
          name: formatDate(item.timestamp),
          price: item.price,
        }));

        // Obtener indicadores técnicos
        const indicators = await coinmarketcapService.getTechnicalIndicators();
        setTechnicalIndicators(indicators);

        // Obtener predicción
        const prediction = await lstmPredictionService.getPrediction(data);
        setPredictedPrice(prediction.price);
        setConfidence(prediction.confidence);

        // Obtener métricas on-chain
        const onChain = await coinmarketcapService.getLitecoinOnChainMetrics();
        setOnChainMetrics(onChain);

        // Obtener datos de sentimiento
        const sentiment = await coinmarketcapService.getLitecoinSentiment();
        setSentimentData(sentiment);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };
    fetchHistoricalData();
  }, []);






  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddWidget = () => {
    toast({
      title: "Agregar Widget",
      description: "Funcionalidad en desarrollo",
    })
  }

  const handleRemoveWidget = (widgetId: string) => {
    toast({
      title: "Eliminar Widget",
      description: "Funcionalidad en desarrollo",
    })
  }

  const handleConfigureWidget = (widgetId: string) => {
    toast({
      title: "Configurar Widget",
      description: "Funcionalidad en desarrollo",
    })
  }

  // Asegurarse de que los valores sean números y no NaN
  const getRsiValue = () => {
    const value = typeof technicalIndicators.rsi === 'number'
      ? technicalIndicators.rsi
      : Array.isArray(technicalIndicators.rsi) && technicalIndicators.rsi.length > 0
        ? technicalIndicators.rsi[technicalIndicators.rsi.length - 1]
        : 50;
    return isNaN(value) ? 50 : value;
  };

  const getMacdValue = () => {
    const value = typeof technicalIndicators.macd === 'number'
      ? technicalIndicators.macd
      : 0;
    return isNaN(value) ? 0 : value;
  };

  const getBollingerValue = () => {
    const value = typeof technicalIndicators.bollinger === 'number'
      ? technicalIndicators.bollinger
      : 0;
    return isNaN(value) ? 0 : value;
  };

  const rsiValue = getRsiValue();
  const macdValue = getMacdValue();
  const bollingerValue = getBollingerValue();

  const indicatorsData = [
    {
      name: 'RSI',
      value: rsiValue,
      signal: technicalIndicatorsService.getSignal(rsiValue, 70, 30),
      strength: technicalIndicatorsService.getStrength(rsiValue, 50)
    },
    {
      name: 'MACD',
      value: macdValue,
      signal: technicalIndicatorsService.getSignal(macdValue, 0, 0),
      strength: technicalIndicatorsService.getStrength(macdValue, 0)
    },
    {
      name: 'Bollinger',
      value: bollingerValue,
      signal: technicalIndicatorsService.getSignal(bollingerValue, 0, 0),
      strength: technicalIndicatorsService.getStrength(bollingerValue, 0)
    }
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <h2 className="font-semibold text-lg">LTC Price Prophet</h2>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.trendingUp className="mr-2 h-4 w-4" />
                      <span>Price Prediction</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.alertTriangle className="mr-2 h-4 w-4" />
                      <span>Price Alerts</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="/trading">
                        <Icons.arrowRightLeft className="mr-2 h-4 w-4" />
                        <span>Trading Automatizado</span>
                      </a>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="/fundamental">
                        <Icons.barChart2 className="mr-2 h-4 w-4" />
                        <span>Análisis Fundamental</span>
                      </a>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="/reports">
                        <Icons.fileCode className="mr-2 h-4 w-4" />
                        <span>Reportes</span>
                      </a>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Technical Analysis</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.search className="mr-2 h-4 w-4" />
                      <span>Indicators</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.info className="mr-2 h-4 w-4" />
                      <span>Analysis View</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </div>
          <WidgetLayout onAddWidget={handleAddWidget}>
            <PriceWidget
              currentPrice={currentPrice}
              predictedPrice={predictedPrice}
              confidence={confidence}
              onRemove={() => handleRemoveWidget("price")}
              onConfigure={() => handleConfigureWidget("price")}
            />
            <IndicatorsWidget
              indicators={indicatorsData}
              onRemove={() => handleRemoveWidget("indicators")}
              onConfigure={() => handleConfigureWidget("indicators")}
            />
            <AlertsWidget
              currentPrice={currentPrice}
              onRemove={() => handleRemoveWidget("alerts")}
              onConfigure={() => handleConfigureWidget("alerts")}
            />
            <SentimentWidget
              onRemove={() => handleRemoveWidget("sentiment")}
              onConfigure={() => handleConfigureWidget("sentiment")}
            />
            <CorrelationAnalysis
              onRemove={() => handleRemoveWidget("correlation")}
              onConfigure={() => handleConfigureWidget("correlation")}
            />
          </WidgetLayout>
        </main>
      </div>
    </SidebarProvider>
  );
}
