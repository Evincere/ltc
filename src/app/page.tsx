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

import { getHistoricalPrice, HistoricalPrice, getBiLSTMPrediction } from '@/services/coingecko';
import { calculateTechnicalIndicators, TechnicalIndicators } from '@/services/coingecko';
import { getLitecoinOnChainMetrics, getLitecoinSentiment } from '@/services/coingecko';

type OnChainMetrics = {
  transactions: number;
  volume: number;
  activeAddresses: number;
} | null;

type SentimentData = { sentiment: string; score: number } | null;

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


  const [historicalData, setHistoricalData] = useState<
    { name: string; price: number }[]
  >([]);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators | null>(null);
  const [onChainMetrics, setOnChainMetrics] = useState<OnChainMetrics>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      
      const data = await getHistoricalPrice('litecoin', 'usd', 30);
      
      const formattedData = data.map((item: HistoricalPrice) => ({
        name: formatDate(item.timestamp),
        price: item.price,
      }));

      const indicators = calculateTechnicalIndicators(data);
      setTechnicalIndicators(indicators);

      const macdData = indicators.macd.map((macdValue, index) => ({
        macd: macdValue.MACD,
        signal: macdValue.signal,
        histogram: macdValue.histogram
      }));

      const chartData = indicators.sma.map((smaValue, index) => ({
        name: formattedData[index].name,
        price: formattedData[index].price,
        sma: smaValue,
        macd: macdData[index]?.macd ?? 0,
        signal: macdData[index]?.signal ?? 0,
        histogram: macdData[index]?.histogram ?? 0,
      }));
      setHistoricalData(chartData);

      const prediction = await getBiLSTMPrediction(data)
      setPredictedPrice(prediction)

      const onChain = await getLitecoinOnChainMetrics();
      setOnChainMetrics(onChain);
      const sentiment = await getLitecoinSentiment();
      setSentimentData(sentiment);
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

        <main className="flex-1 p-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Predicted Price</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Bi-LSTM Model Prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-semibold text-primary">{predictedPrice !== null && predictedPrice !== undefined ? `$${predictedPrice.toFixed(2)}` : "Loading..."}</div>
                <div className="text-sm text-muted-foreground">Next 24 hours</div>
              </CardContent>
            </Card>
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">On-Chain Metrics</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Litecoin Blockchain Activity
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {onChainMetrics ? (
                  <>
                    <div className="text-xl font-semibold">Transactions: {onChainMetrics.transactions}</div>
                    <div className="text-xl font-semibold">Volume: {onChainMetrics.volume}</div>
                    <div className="text-xl font-semibold">Active Addresses: {onChainMetrics.activeAddresses}</div>
                  </>
                ) : (
                  "Loading..."
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-semibold text-green-500">Positive</div>
                <div className="text-sm text-muted-foreground">Reddit, Twitter</div>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg">
              <CardHeader>
              <CardTitle className="text-2xl font-bold">Market Sentiment</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Social Media & News Sentiment</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {sentimentData ? (
                  <><div className={`text-2xl font-semibold ${sentimentData.sentiment === "Positivo" ? "text-green-500" : sentimentData.sentiment === "Negativo" ? "text-red-500" : ""}`}>{sentimentData.sentiment}</div>
                  <div className="text-sm text-muted-foreground">(Score: {sentimentData.score})</div></>
                ) : "Loading..."}
              </CardContent>
            </Card>
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Technical Indicators</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Key Indicators Overview
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-xl font-semibold">RSI: {technicalIndicators?.rsi.slice(-1)[0] || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Neutral</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Interactive Chart</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  LTC Price and Indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={historicalData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="macd" stroke="#ff7300" />
                    <Line type="monotone" dataKey="signal" stroke="#387908" />
                    <Line type="monotone" dataKey="histogram" stroke="#8884d8" />                
                    {technicalIndicators?.sma && <Line type="monotone" dataKey="sma" stroke="#8884d8" />}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Set Price Alert
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Set Price Alert</AlertDialogTitle>
                  <AlertDialogDescription>
                    Receive notifications when the predicted price reaches a specified threshold.
                    <Input
                      type="number"
                      placeholder="Precio umbral"
                      value={alertThreshold !== null ? alertThreshold : ''}
                      onChange={(e) => {
                        setAlertThreshold(Number(e.target.value));
                      }}
                      className="mt-4"
                    />
                    
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAlert}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
