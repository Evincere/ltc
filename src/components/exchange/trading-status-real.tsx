"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { tradingServiceReal, TradeResult } from '@/services/exchange/trading-service-real';
import { bitsoApiReal } from '@/services/exchange/bitso-api-real';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card as CardUI } from "@/components/ui/card";

export function TradingStatusReal() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [tradeHistory, setTradeHistory] = useState<TradeResult[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeStrategies, setActiveStrategies] = useState<number>(0);
  const [totalStrategies, setTotalStrategies] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  useEffect(() => {
    // Suscribirse a eventos del servicio de trading
    const startedListener = () => {
      setIsRunning(true);
      toast.success('Trading automatizado iniciado');
    };

    const stoppedListener = () => {
      setIsRunning(false);
      toast.info('Trading automatizado detenido');
    };

    const tradeExecutedListener = (result: TradeResult) => {
      setTradeHistory(prev => [result, ...prev].slice(0, 10));
      toast.success(`Operación ejecutada: ${result.signal.action.toUpperCase()} ${result.signal.amount} en ${result.signal.book}`);
      loadBalances();
    };

    const errorListener = (error: Error) => {
      toast.error(`Error en el servicio de trading: ${error.message}`);
    };

    const strategyToggledListener = () => {
      updateStrategyCount();
    };

    tradingServiceReal.on('started', startedListener);
    tradingServiceReal.on('stopped', stoppedListener);
    tradingServiceReal.on('trade_executed', tradeExecutedListener);
    tradingServiceReal.on('error', errorListener);
    tradingServiceReal.on('strategy_toggled', strategyToggledListener);
    tradingServiceReal.on('strategy_added', strategyToggledListener);
    tradingServiceReal.on('strategy_removed', strategyToggledListener);

    // Cargar datos iniciales
    loadInitialData();

    // Configurar intervalo de actualización
    const interval = setInterval(() => {
      if (isRunning) {
        loadBalances();
      }
    }, 60000); // Actualizar cada minuto

    return () => {
      tradingServiceReal.off('started', startedListener);
      tradingServiceReal.off('stopped', stoppedListener);
      tradingServiceReal.off('trade_executed', tradeExecutedListener);
      tradingServiceReal.off('error', errorListener);
      tradingServiceReal.off('strategy_toggled', strategyToggledListener);
      tradingServiceReal.off('strategy_added', strategyToggledListener);
      tradingServiceReal.off('strategy_removed', strategyToggledListener);
      clearInterval(interval);
    };
  }, [isRunning]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Cargar historial de operaciones
      const history = tradingServiceReal.getTradeHistory();
      setTradeHistory(history.slice(0, 10));

      // Cargar balances
      await loadBalances();

      // Actualizar conteo de estrategias
      updateStrategyCount();

      // Verificar si el servicio está en ejecución
      // En un caso real, esto sería una propiedad del servicio
      setIsRunning(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar los datos iniciales');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStrategyCount = () => {
    const strategies = tradingServiceReal.getStrategies();
    setTotalStrategies(strategies.length);
    setActiveStrategies(strategies.filter(s => s.isActive).length);
  };

  const loadBalances = async () => {
    try {
      if (!bitsoApiReal.hasCredentials()) {
        return;
      }

      const apiBalances = await bitsoApiReal.getBalance();
      
      // Convertir a un objeto más simple
      const balanceObj = apiBalances.reduce((acc, balance) => {
        acc[balance.currency] = parseFloat(balance.available);
        return acc;
      }, {} as Record<string, number>);
      
      setBalances(balanceObj);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const handleStartTrading = () => {
    try {
      if (!bitsoApiReal.hasCredentials()) {
        toast.error('Configura tus credenciales de API primero');
        return;
      }

      tradingServiceReal.start();
    } catch (error) {
      console.error('Error starting trading service:', error);
      toast.error('Error al iniciar el servicio de trading');
    }
  };

  const handleStopTrading = () => {
    try {
      tradingServiceReal.stop();
    } catch (error) {
      console.error('Error stopping trading service:', error);
      toast.error('Error al detener el servicio de trading');
    }
  };

  const formatCurrency = (value: number, currency: string): string => {
    if (currency === 'mxn') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(value);
    }
    
    return `${value.toFixed(8)} ${currency.toUpperCase()}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const calculateProfitLoss = (): { amount: number; percentage: number } => {
    // En un caso real, esto se calcularía basado en el historial de operaciones
    // y los balances actuales vs iniciales
    const trades = tradeHistory.filter(t => t.status === 'success');
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    
    return {
      amount: totalProfit,
      percentage: trades.length > 0 ? (totalProfit / trades.length) * 10 : 0
    };
  };

  const profitLoss = calculateProfitLoss();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Estado del Trading Automatizado</CardTitle>
            <CardDescription>
              Monitorea el estado y las operaciones del trading automatizado
            </CardDescription>
          </div>
          <Badge
            variant={isRunning ? "default" : "outline"}
            className={isRunning ? "bg-green-500" : ""}
          >
            {isRunning ? "En ejecución" : "Detenido"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Control del Servicio</h3>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Última actualización: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={loadBalances}
                  disabled={isLoading || !bitsoApiReal.hasCredentials()}
                >
                  <Icons.refresh className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
                {isRunning ? (
                  <Button
                    variant="destructive"
                    onClick={handleStopTrading}
                    disabled={isLoading}
                  >
                    <Icons.stop className="mr-2 h-4 w-4" />
                    Detener
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartTrading}
                    disabled={isLoading || !bitsoApiReal.hasCredentials() || activeStrategies === 0}
                  >
                    <Icons.play className="mr-2 h-4 w-4" />
                    Iniciar
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="overview" onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="balances">Balances</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 pt-4">
                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CardUI>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground uppercase">
                        Estrategias Activas
                      </div>
                      <div className="text-2xl font-bold">
                        {activeStrategies} / {totalStrategies}
                      </div>
                    </CardContent>
                  </CardUI>
                  
                  <CardUI>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground uppercase">
                        Operaciones Totales
                      </div>
                      <div className="text-2xl font-bold">{tradeHistory.length}</div>
                    </CardContent>
                  </CardUI>
                  
                  <CardUI>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground uppercase">
                        Rendimiento
                      </div>
                      <div className={`text-2xl font-bold ${profitLoss.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitLoss.amount >= 0 ? '+' : ''}{profitLoss.amount.toFixed(2)} MXN
                      </div>
                      <div className={`text-xs ${profitLoss.percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitLoss.percentage >= 0 ? '+' : ''}{profitLoss.percentage.toFixed(2)}%
                      </div>
                    </CardContent>
                  </CardUI>
                </div>
                
                {/* Métricas de rendimiento */}
                <CardUI>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-medium mb-4">Rendimiento</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Operaciones Exitosas</span>
                          <span className="text-sm font-medium">
                            {tradeHistory.filter(t => t.status === 'success').length} / {tradeHistory.length}
                          </span>
                        </div>
                        <Progress
                          value={
                            tradeHistory.length
                              ? (tradeHistory.filter(t => t.status === 'success').length / tradeHistory.length) * 100
                              : 0
                          }
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Compras</div>
                          <div className="text-lg font-bold">
                            {tradeHistory.filter(t => t.signal.action === 'buy').length}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Ventas</div>
                          <div className="text-lg font-bold">
                            {tradeHistory.filter(t => t.signal.action === 'sell').length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CardUI>
              </TabsContent>
              
              <TabsContent value="balances" className="pt-4">
                {/* Balances */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Balances</h3>
                  {Object.keys(balances).length === 0 ? (
                    <div className="text-center py-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">
                        No hay información de balances disponible
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(balances)
                        .filter(([_, value]) => value > 0)
                        .map(([currency, value]) => (
                          <CardUI key={currency}>
                            <CardContent className="pt-6">
                              <div className="text-xs text-muted-foreground uppercase">
                                {currency}
                              </div>
                              <div className="text-2xl font-bold">
                                {formatCurrency(value, currency)}
                              </div>
                            </CardContent>
                          </CardUI>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="pt-4">
                {/* Historial de operaciones */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Últimas Operaciones</h3>
                  {tradeHistory.length === 0 ? (
                    <div className="text-center py-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">
                        No hay operaciones recientes
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estrategia</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>Par</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tradeHistory.map((trade) => (
                            <TableRow key={trade.id}>
                              <TableCell className="text-xs">
                                {formatDate(trade.timestamp)}
                              </TableCell>
                              <TableCell>{trade.strategy}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    trade.signal.action === 'buy'
                                      ? 'border-green-500 text-green-500'
                                      : 'border-red-500 text-red-500'
                                  }
                                >
                                  {trade.signal.action === 'buy' ? 'Compra' : 'Venta'}
                                </Badge>
                              </TableCell>
                              <TableCell>{trade.signal.book.toUpperCase()}</TableCell>
                              <TableCell>{trade.signal.amount}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={trade.status === 'success' ? 'default' : 'destructive'}
                                >
                                  {trade.status === 'success' ? 'Éxito' : 'Error'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
