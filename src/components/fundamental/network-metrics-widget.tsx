import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { networkMetricsService, NetworkMetrics, NetworkMetricsChange } from '@/services/network-metrics';

interface NetworkMetricsWidgetProps {
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function NetworkMetricsWidget({ onRemove, onConfigure }: NetworkMetricsWidgetProps) {
  const [currentMetrics, setCurrentMetrics] = useState<NetworkMetrics | null>(null);
  const [metricsChanges, setMetricsChanges] = useState<NetworkMetricsChange | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('hashRate');
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [networkHealth, setNetworkHealth] = useState<{
    overall: 'healthy' | 'neutral' | 'concerning';
    details: Record<string, { status: 'healthy' | 'neutral' | 'concerning'; reason: string }>;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadHistoryData();
  }, [selectedMetric, selectedPeriod]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metrics, changes, health] = await Promise.all([
        networkMetricsService.getCurrentMetrics(),
        networkMetricsService.getMetricsChanges('24h'),
        networkMetricsService.analyzeNetworkHealth()
      ]);
      
      setCurrentMetrics(metrics);
      setMetricsChanges(changes);
      setNetworkHealth(health);
      
      await loadHistoryData();
    } catch (error) {
      console.error('Error loading network metrics:', error);
      toast.error('Error al cargar métricas de red');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryData = async () => {
    try {
      const history = await networkMetricsService.getMetricsHistory();
      
      let data;
      switch (selectedPeriod) {
        case '24h':
          data = history.daily;
          break;
        case '7d':
          data = history.weekly;
          break;
        case '30d':
          data = history.monthly;
          break;
      }
      
      // Formatear datos para el gráfico
      const formattedData = data.map(item => ({
        timestamp: new Date(item.timestamp).toLocaleString(),
        [selectedMetric]: item[selectedMetric as keyof NetworkMetrics],
        // Añadir fecha formateada para el eje X
        date: formatDate(item.timestamp, selectedPeriod)
      }));
      
      setHistoryData(formattedData);
    } catch (error) {
      console.error('Error loading history data:', error);
    }
  };

  const formatDate = (timestamp: number, period: '24h' | '7d' | '30d'): string => {
    const date = new Date(timestamp);
    
    switch (period) {
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString([], { weekday: 'short' });
      case '30d':
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };

  const formatMetricValue = (value: number, metric: string): string => {
    switch (metric) {
      case 'hashRate':
        return `${value.toFixed(2)} TH/s`;
      case 'difficulty':
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      case 'activeAddresses':
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      case 'transactionCount':
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      case 'averageFee':
        return `${value.toFixed(5)} LTC`;
      case 'blockTime':
        return `${value.toFixed(2)} min`;
      case 'blockSize':
        return `${value.toFixed(2)} KB`;
      case 'mempoolSize':
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      default:
        return value.toString();
    }
  };

  const getMetricName = (metric: string): string => {
    switch (metric) {
      case 'hashRate':
        return 'Hash Rate';
      case 'difficulty':
        return 'Dificultad';
      case 'activeAddresses':
        return 'Direcciones Activas';
      case 'transactionCount':
        return 'Transacciones';
      case 'averageFee':
        return 'Comisión Media';
      case 'blockTime':
        return 'Tiempo de Bloque';
      case 'blockSize':
        return 'Tamaño de Bloque';
      case 'mempoolSize':
        return 'Tamaño de Mempool';
      default:
        return metric;
    }
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getHealthColor = (status: 'healthy' | 'neutral' | 'concerning'): string => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'neutral':
        return 'bg-yellow-500';
      case 'concerning':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Métricas de Red</CardTitle>
          <CardDescription>
            Análisis de la red de Litecoin
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Icons.loader className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.refresh className="h-4 w-4" />
            )}
          </Button>
          {onConfigure && (
            <Button
              variant="outline"
              size="icon"
              onClick={onConfigure}
            >
              <Icons.settings className="h-4 w-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRemove}
            >
              <Icons.x className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !currentMetrics ? (
          <div className="flex justify-center items-center py-8">
            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
              <TabsTrigger value="health">Salud de la Red</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {currentMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="Hash Rate"
                    value={formatMetricValue(currentMetrics.hashRate, 'hashRate')}
                    change={metricsChanges?.hashRate}
                  />
                  <MetricCard
                    title="Dificultad"
                    value={formatMetricValue(currentMetrics.difficulty, 'difficulty')}
                    change={metricsChanges?.difficulty}
                  />
                  <MetricCard
                    title="Direcciones Activas"
                    value={formatMetricValue(currentMetrics.activeAddresses, 'activeAddresses')}
                    change={metricsChanges?.activeAddresses}
                  />
                  <MetricCard
                    title="Transacciones"
                    value={formatMetricValue(currentMetrics.transactionCount, 'transactionCount')}
                    change={metricsChanges?.transactionCount}
                  />
                  <MetricCard
                    title="Comisión Media"
                    value={formatMetricValue(currentMetrics.averageFee, 'averageFee')}
                    change={metricsChanges?.averageFee}
                  />
                  <MetricCard
                    title="Tiempo de Bloque"
                    value={formatMetricValue(currentMetrics.blockTime, 'blockTime')}
                  />
                  <MetricCard
                    title="Tamaño de Bloque"
                    value={formatMetricValue(currentMetrics.blockSize, 'blockSize')}
                  />
                  <MetricCard
                    title="Tamaño de Mempool"
                    value={formatMetricValue(currentMetrics.mempoolSize, 'mempoolSize')}
                  />
                </div>
              )}
              
              <div className="text-xs text-muted-foreground text-center mt-2">
                Última actualización: {currentMetrics ? new Date(currentMetrics.timestamp).toLocaleString() : 'N/A'}
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Select
                    value={selectedMetric}
                    onValueChange={setSelectedMetric}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar métrica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hashRate">Hash Rate</SelectItem>
                      <SelectItem value="difficulty">Dificultad</SelectItem>
                      <SelectItem value="activeAddresses">Direcciones Activas</SelectItem>
                      <SelectItem value="transactionCount">Transacciones</SelectItem>
                      <SelectItem value="averageFee">Comisión Media</SelectItem>
                      <SelectItem value="blockTime">Tiempo de Bloque</SelectItem>
                      <SelectItem value="blockSize">Tamaño de Bloque</SelectItem>
                      <SelectItem value="mempoolSize">Tamaño de Mempool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant={selectedPeriod === '24h' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('24h')}
                  >
                    24h
                  </Button>
                  <Button
                    variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('7d')}
                  >
                    7d
                  </Button>
                  <Button
                    variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('30d')}
                  >
                    30d
                  </Button>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatMetricValue(value, selectedMetric),
                        getMetricName(selectedMetric)
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      name={getMetricName(selectedMetric)}
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="health" className="space-y-4">
              {networkHealth && (
                <>
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getHealthColor(networkHealth.overall)}`} />
                    <div>
                      <h3 className="text-sm font-medium">Estado General de la Red</h3>
                      <p className="text-sm text-muted-foreground">
                        {networkHealth.overall === 'healthy' && 'La red está saludable y funcionando correctamente'}
                        {networkHealth.overall === 'neutral' && 'La red está en un estado neutral, sin problemas significativos'}
                        {networkHealth.overall === 'concerning' && 'La red muestra signos preocupantes que requieren atención'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-4">
                    <h3 className="text-sm font-medium">Detalles del Análisis</h3>
                    
                    {Object.entries(networkHealth.details).map(([key, detail]) => (
                      <div key={key} className="border rounded-md p-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getHealthColor(detail.status)}`} />
                          <h4 className="text-sm font-medium">
                            {key === 'hashRate' && 'Seguridad de la Red'}
                            {key === 'activity' && 'Actividad de la Red'}
                            {key === 'congestion' && 'Congestión de la Red'}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {detail.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4">
                    <p>
                      Este análisis se basa en las métricas actuales de la red y sus cambios recientes.
                      Es una evaluación automatizada y no debe considerarse como asesoramiento financiero.
                    </p>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
}

function MetricCard({ title, value, change }: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg border p-3">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
      {change !== undefined && (
        <div className={`text-xs mt-1 ${getChangeColor(change)}`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(2)}%
        </div>
      )}
    </div>
  );
}

function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
}
