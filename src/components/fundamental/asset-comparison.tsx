import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { cryptoComparisonService, CryptoAsset, ComparisonResult } from '@/services/crypto-comparison';

interface AssetComparisonProps {
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function AssetComparison({ onRemove, onConfigure }: AssetComparisonProps) {
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [historicalData, setHistoricalData] = useState<Record<string, any[]>>({});
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['bitcoin', 'ethereum', 'ripple']);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'price' | 'correlation'>('metrics');
  const [correlationData, setCorrelationData] = useState<Array<{ assetId: string; name: string; correlation: number }>>([]);
  
  // Colores para los gráficos
  const assetColors: Record<string, string> = {
    litecoin: '#345D9D',
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    ripple: '#23292F',
    cardano: '#3CC8C8',
    solana: '#14F195'
  };
  
  useEffect(() => {
    loadData();
  }, [selectedAssets]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar comparación
      const comparison = await cryptoComparisonService.compareWithOtherAssets(selectedAssets);
      setComparisonResult(comparison);
      
      // Cargar datos históricos
      await loadHistoricalData();
      
      // Cargar correlaciones
      const correlations = await cryptoComparisonService.calculateCorrelations(selectedAssets, timeRange);
      setCorrelationData(correlations);
    } catch (error) {
      console.error('Error loading comparison data:', error);
      toast.error('Error al cargar datos de comparación');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadHistoricalData = async () => {
    try {
      const assetIds = ['litecoin', ...selectedAssets.filter(id => id !== 'litecoin')];
      const historicalPrices = await cryptoComparisonService.getHistoricalPrices(assetIds, timeRange);
      
      // Formatear datos para el gráfico
      const formattedData: Record<string, any[]> = {};
      
      // Crear un array de fechas únicas
      const allDates = new Set<string>();
      Object.values(historicalPrices).forEach(prices => {
        prices.forEach(item => {
          allDates.add(new Date(item.timestamp).toISOString().split('T')[0]);
        });
      });
      
      // Ordenar fechas
      const sortedDates = Array.from(allDates).sort();
      
      // Crear datos formateados para cada fecha
      const chartData = sortedDates.map(date => {
        const dataPoint: Record<string, any> = { date };
        
        Object.entries(historicalPrices).forEach(([assetId, prices]) => {
          const priceForDate = prices.find(item => 
            new Date(item.timestamp).toISOString().split('T')[0] === date
          );
          
          if (priceForDate) {
            dataPoint[assetId] = priceForDate.price;
          }
        });
        
        return dataPoint;
      });
      
      setHistoricalData({ chartData });
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };
  
  const handleAssetChange = (assetId: string) => {
    // Verificar si el activo ya está seleccionado
    if (selectedAssets.includes(assetId)) {
      // Remover el activo
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    } else {
      // Añadir el activo
      setSelectedAssets([...selectedAssets, assetId]);
    }
  };
  
  const handleTimeRangeChange = (value: string) => {
    const days = parseInt(value);
    setTimeRange(days);
    
    // Recargar datos históricos
    loadHistoricalData();
    
    // Recargar correlaciones
    cryptoComparisonService.calculateCorrelations(selectedAssets, days)
      .then(correlations => setCorrelationData(correlations))
      .catch(error => console.error('Error loading correlations:', error));
  };
  
  const getComparisonValue = (asset: CryptoAsset, metricIndex: number): string => {
    if (!comparisonResult) return '';
    
    const metric = comparisonResult.metrics[metricIndex];
    const value = metric.getValue(asset);
    return metric.format(value);
  };
  
  const getComparisonClass = (asset: CryptoAsset, metricIndex: number): string => {
    if (!comparisonResult) return '';
    
    const metric = comparisonResult.metrics[metricIndex];
    const baseValue = metric.getValue(comparisonResult.baseAsset);
    const assetValue = metric.getValue(asset);
    
    // Si los valores no son numéricos, no aplicar clase
    if (typeof baseValue !== 'number' || typeof assetValue !== 'number') {
      return '';
    }
    
    // Determinar si el valor es mejor o peor
    const isBetter = metric.higherIsBetter ? assetValue > baseValue : assetValue < baseValue;
    
    return isBetter ? 'text-green-500 font-medium' : 'text-red-500 font-medium';
  };
  
  const formatCorrelation = (value: number): string => {
    return value.toFixed(2);
  };
  
  const getCorrelationClass = (value: number): string => {
    if (value >= 0.7) return 'text-green-500 font-medium';
    if (value >= 0.3) return 'text-yellow-500 font-medium';
    if (value >= 0) return 'text-gray-500';
    if (value >= -0.3) return 'text-gray-500';
    if (value >= -0.7) return 'text-orange-500 font-medium';
    return 'text-red-500 font-medium';
  };
  
  const getCorrelationDescription = (value: number): string => {
    if (value >= 0.7) return 'Fuerte correlación positiva';
    if (value >= 0.3) return 'Correlación positiva moderada';
    if (value >= 0) return 'Correlación positiva débil';
    if (value >= -0.3) return 'Correlación negativa débil';
    if (value >= -0.7) return 'Correlación negativa moderada';
    return 'Fuerte correlación negativa';
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Comparación con Otros Activos</CardTitle>
          <CardDescription>
            Compara Litecoin con otras criptomonedas
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
        {isLoading && !comparisonResult ? (
          <div className="flex justify-center items-center py-8">
            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={activeTab === 'metrics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('metrics')}
              >
                Métricas
              </Button>
              <Button
                variant={activeTab === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('price')}
              >
                Precio
              </Button>
              <Button
                variant={activeTab === 'correlation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('correlation')}
              >
                Correlación
              </Button>
              
              <div className="ml-auto">
                <Select
                  value={timeRange.toString()}
                  onValueChange={handleTimeRangeChange}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 días</SelectItem>
                    <SelectItem value="30">30 días</SelectItem>
                    <SelectItem value="90">90 días</SelectItem>
                    <SelectItem value="365">1 año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {activeTab === 'metrics' && comparisonResult && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Métrica</TableHead>
                      <TableHead>Litecoin</TableHead>
                      {comparisonResult.comparedAssets.map(asset => (
                        <TableHead key={asset.id}>
                          <div className="flex items-center space-x-1">
                            <span>{asset.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleAssetChange(asset.id)}
                            >
                              <Icons.x className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonResult.metrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div>
                            {metric.name}
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {metric.format(metric.getValue(comparisonResult.baseAsset))}
                        </TableCell>
                        {comparisonResult.comparedAssets.map(asset => (
                          <TableCell key={asset.id} className={getComparisonClass(asset, index)}>
                            {getComparisonValue(asset, index)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {activeTab === 'price' && historicalData.chartData && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className="bg-[#345D9D]">Litecoin</Badge>
                  {selectedAssets.map(assetId => (
                    <Badge key={assetId} className={`bg-[${assetColors[assetId] || '#888888'}]`}>
                      {assetId.charAt(0).toUpperCase() + assetId.slice(1)}
                    </Badge>
                  ))}
                </div>
                
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={historicalData.chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="litecoin"
                        name="Litecoin"
                        stroke={assetColors.litecoin}
                        activeDot={{ r: 8 }}
                      />
                      {selectedAssets.map(assetId => (
                        assetId !== 'litecoin' && (
                          <Line
                            key={assetId}
                            type="monotone"
                            dataKey={assetId}
                            name={assetId.charAt(0).toUpperCase() + assetId.slice(1)}
                            stroke={assetColors[assetId] || '#888888'}
                          />
                        )
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  Evolución del precio en los últimos {timeRange} días
                </div>
              </div>
            )}
            
            {activeTab === 'correlation' && correlationData.length > 0 && (
              <div className="space-y-6">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activo</TableHead>
                        <TableHead>Correlación con Litecoin</TableHead>
                        <TableHead>Interpretación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {correlationData.map(item => (
                        <TableRow key={item.assetId}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className={getCorrelationClass(item.correlation)}>
                            {formatCorrelation(item.correlation)}
                          </TableCell>
                          <TableCell>{getCorrelationDescription(item.correlation)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-sm">
                  <h4 className="font-medium mb-2">Interpretación de la Correlación</h4>
                  <p className="mb-2">
                    La correlación mide la relación entre los movimientos de precio de Litecoin y otros activos.
                    Los valores van de -1 (correlación negativa perfecta) a 1 (correlación positiva perfecta).
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="text-green-500 font-medium">0.7 a 1.0:</span> Fuerte correlación positiva - Los activos tienden a moverse juntos</li>
                    <li><span className="text-yellow-500 font-medium">0.3 a 0.7:</span> Correlación positiva moderada</li>
                    <li><span className="text-gray-500">-0.3 a 0.3:</span> Correlación débil - Poca relación entre los movimientos</li>
                    <li><span className="text-orange-500 font-medium">-0.7 a -0.3:</span> Correlación negativa moderada</li>
                    <li><span className="text-red-500 font-medium">-1.0 a -0.7:</span> Fuerte correlación negativa - Los activos tienden a moverse en direcciones opuestas</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Selector de activos adicionales */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Añadir Activos a la Comparación</h4>
              <div className="flex flex-wrap gap-2">
                {['bitcoin', 'ethereum', 'ripple', 'cardano', 'solana'].map(assetId => (
                  !selectedAssets.includes(assetId) && (
                    <Button
                      key={assetId}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssetChange(assetId)}
                    >
                      <Icons.plus className="mr-1 h-3 w-3" />
                      {assetId.charAt(0).toUpperCase() + assetId.slice(1)}
                    </Button>
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
