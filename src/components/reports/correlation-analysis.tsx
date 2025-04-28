import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { cryptoComparisonService } from '@/services/crypto-comparison';
import { coingeckoService } from '@/services/coingecko-service';

interface CorrelationAnalysisProps {
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function CorrelationAnalysis({ onRemove, onConfigure }: CorrelationAnalysisProps) {
  const [correlationData, setCorrelationData] = useState<Array<{ assetId: string; name: string; correlation: number }>>([]);
  const [scatterData, setScatterData] = useState<Array<{ x: number; y: number; z: number; name: string }>>([]);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [baseAsset, setBaseAsset] = useState<string>('litecoin');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [baseAsset, timeRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Obtener activos para comparar
      const assetIds = ['bitcoin', 'ethereum', 'litecoin', 'ripple', 'cardano', 'solana'].filter(id => id !== baseAsset);

      // Calcular correlaciones
      const correlations = await cryptoComparisonService.calculateCorrelations(assetIds, timeRange);
      setCorrelationData(correlations);

      // Generar datos para el gráfico de dispersión
      await generateScatterData(assetIds);
    } catch (error) {
      console.error('Error loading correlation data:', error);
      toast.error('Error al cargar datos de correlación');
    } finally {
      setIsLoading(false);
    }
  };

  const generateScatterData = async (assetIds: string[]) => {
    try {
      // Obtener datos de los activos
      const assets = await cryptoComparisonService.getAssets([baseAsset, ...assetIds]);

      // Crear datos para el gráfico de dispersión
      const data = assets.map(asset => {
        // Encontrar correlación con el activo base
        const correlation = correlationData.find(item => item.assetId === asset.id);
        const correlationValue = correlation ? correlation.correlation : 0;

        return {
          x: asset.priceChangePercentage24h, // Cambio de precio 24h
          y: asset.volume24h / asset.marketCap, // Ratio volumen/cap
          z: asset.marketCap / 1e9, // Tamaño de la burbuja (cap. de mercado en miles de millones)
          name: asset.name,
          id: asset.id,
          correlation: correlationValue
        };
      });

      setScatterData(data);
    } catch (error) {
      console.error('Error generating scatter data:', error);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    const days = parseInt(value);
    setTimeRange(days);
  };

  const handleBaseAssetChange = (value: string) => {
    setBaseAsset(value);
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

  const formatTooltipValue = (value: any, name: string) => {
    switch (name) {
      case 'x':
        return [`${value.toFixed(2)}%`, 'Cambio 24h'];
      case 'y':
        return [`${(value * 100).toFixed(2)}%`, 'Ratio Vol/Cap'];
      case 'z':
        return [`$${value.toFixed(2)}B`, 'Cap. de Mercado'];
      default:
        return [value, name];
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Análisis de Correlación</CardTitle>
          <CardDescription>
            Analiza la correlación entre diferentes criptomonedas
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
        {isLoading && correlationData.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="text-sm font-medium block mb-2">Activo Base</label>
                <Select
                  value={baseAsset}
                  onValueChange={handleBaseAssetChange}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Activo Base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="litecoin">Litecoin</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="ripple">XRP</SelectItem>
                    <SelectItem value="cardano">Cardano</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Período</label>
                <Select
                  value={timeRange.toString()}
                  onValueChange={handleTimeRangeChange}
                >
                  <SelectTrigger className="w-[150px]">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Tabla de Correlaciones</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activo</TableHead>
                        <TableHead>Correlación con {baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)}</TableHead>
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
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Visualización de Correlaciones</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Cambio 24h"
                        unit="%"
                        domain={['dataMin', 'dataMax']}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Ratio Vol/Cap"
                        unit="%"
                      />
                      <ZAxis
                        type="number"
                        dataKey="z"
                        range={[50, 400]}
                        name="Cap. de Mercado"
                        unit="B"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={formatTooltipValue}
                      />
                      <Legend />
                      <Scatter
                        name="Criptomonedas"
                        data={scatterData}
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <p>
                    El gráfico muestra la relación entre el cambio de precio en 24h (eje X) y el ratio volumen/capitalización (eje Y).
                    El tamaño de cada burbuja representa la capitalización de mercado.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Interpretación del Análisis</h3>
              <div className="bg-muted p-4 rounded-md">
                <p className="mb-4">
                  El análisis de correlación muestra cómo se relacionan los movimientos de precio entre {baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)} y otras criptomonedas durante los últimos {timeRange} días.
                </p>

                <h4 className="font-medium mb-2">Hallazgos Clave:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {correlationData.length > 0 && (
                    <>
                      <li>
                        {correlationData[0].name} muestra la {correlationData[0].correlation >= 0 ? 'mayor correlación positiva' : 'mayor correlación negativa'} ({formatCorrelation(correlationData[0].correlation)}) con {baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)}.
                      </li>

                      {correlationData.length > 1 && (
                        <li>
                          {correlationData[correlationData.length - 1].name} muestra la {correlationData[correlationData.length - 1].correlation >= 0 ? 'menor correlación positiva' : 'mayor correlación negativa'} ({formatCorrelation(correlationData[correlationData.length - 1].correlation)}).
                        </li>
                      )}

                      <li>
                        {correlationData.filter(item => item.correlation > 0.5).length > 0
                          ? `${correlationData.filter(item => item.correlation > 0.5).length} activos muestran una correlación fuerte (>0.5) con ${baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)}.`
                          : `Ningún activo muestra una correlación fuerte (>0.5) con ${baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)}.`
                        }
                      </li>

                      <li>
                        {correlationData.filter(item => item.correlation < 0).length > 0
                          ? `${correlationData.filter(item => item.correlation < 0).length} activos muestran una correlación negativa con ${baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)}.`
                          : `Ningún activo muestra una correlación negativa con ${baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)}.`
                        }
                      </li>
                    </>
                  )}
                </ul>

                <h4 className="font-medium mt-4 mb-2">Implicaciones para la Diversificación:</h4>
                <p>
                  Los activos con baja correlación o correlación negativa pueden ofrecer beneficios de diversificación en una cartera que incluya {baseAsset.charAt(0).toUpperCase() + baseAsset.slice(1)}.
                  {correlationData.filter(item => item.correlation < 0.3).length > 0
                    ? ` Considera incluir ${correlationData.filter(item => item.correlation < 0.3).map(item => item.name).join(', ')} para diversificar el riesgo.`
                    : ` Todas las criptomonedas analizadas muestran una correlación significativa, lo que limita los beneficios de diversificación dentro del sector cripto.`
                  }
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
