import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { CustomStrategy } from './StrategyEditor';
import { runBacktest } from '@/services/backtestingService';

interface StrategyComparisonProps {
  strategies: CustomStrategy[];
  onClose: () => void;
  historicalData: any[];
}

interface BacktestResult {
  strategyId: string;
  strategyName: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  profit: number;
  profitPercentage: number;
  trades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: number[];
  monthlyReturns: { month: string; return: number }[];
}

export function StrategyComparison({ strategies, onClose, historicalData }: StrategyComparisonProps) {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('profit');
  const [equityCurveData, setEquityCurveData] = useState<any[]>([]);
  const [monthlyReturnsData, setMonthlyReturnsData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    if (strategies.length > 0) {
      runComparison();
    }
  }, [strategies]);

  useEffect(() => {
    if (results.length > 0) {
      prepareChartData();
    }
  }, [results, selectedMetric]);

  const runComparison = async () => {
    if (strategies.length === 0) {
      toast.error("No hay estrategias para comparar");
      return;
    }

    setLoading(true);
    try {
      const comparisonResults: BacktestResult[] = [];

      // Configuración común para todos los backtests
      const config = {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Último año
        endDate: new Date().toISOString(),
        initialBalance: 1000
      };

      // Ejecutar backtest para cada estrategia
      for (const strategy of strategies) {
        try {
          // Simular backtesting (en un proyecto real, esto llamaría al servicio real)
          const result = await simulateBacktestForStrategy(strategy, config);
          comparisonResults.push({
            ...result,
            strategyId: strategy.id,
            strategyName: strategy.name
          });
        } catch (error) {
          console.error(`Error en backtest para estrategia ${strategy.name}:`, error);
          toast.error(`Error al ejecutar backtest para ${strategy.name}`);
        }
      }

      setResults(comparisonResults);
      toast.success("Comparación completada");
    } catch (error) {
      console.error("Error en la comparación:", error);
      toast.error("Error al ejecutar la comparación");
    } finally {
      setLoading(false);
    }
  };

  const simulateBacktestForStrategy = async (strategy: CustomStrategy, config: any): Promise<BacktestResult> => {
    // Simulación de resultados de backtesting
    // En un caso real, esto llamaría al servicio de backtesting con la estrategia
    
    const profit = Math.random() * 50 - 10; // -10% a +40%
    const trades = Math.floor(Math.random() * 100) + 10;
    const winRate = Math.random() * 70 + 30; // 30% a 100%
    const maxDrawdown = Math.random() * 30; // 0% a 30%
    const sharpeRatio = Math.random() * 3; // 0 a 3
    
    // Generar curva de equity simulada
    const days = 365;
    const equityCurve = [config.initialBalance];
    let balance = config.initialBalance;
    
    for (let i = 1; i <= days; i++) {
      const dailyReturn = (Math.random() * 2 - 0.5) * (profit / 365);
      balance = balance * (1 + dailyReturn / 100);
      equityCurve.push(balance);
    }
    
    // Generar retornos mensuales simulados
    const monthlyReturns = [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 12; i++) {
      monthlyReturns.push({
        month: months[i],
        return: (Math.random() * 10) - (Math.random() * 5)
      });
    }
    
    return {
      strategyId: strategy.id,
      strategyName: strategy.name,
      startDate: config.startDate,
      endDate: config.endDate,
      initialBalance: config.initialBalance,
      finalBalance: balance,
      profit: balance - config.initialBalance,
      profitPercentage: ((balance / config.initialBalance) - 1) * 100,
      trades,
      winRate,
      maxDrawdown,
      sharpeRatio,
      equityCurve,
      monthlyReturns
    };
  };

  const prepareChartData = () => {
    if (results.length === 0) return;

    // Preparar datos para la curva de equity
    const equityData: any[] = [];
    const maxDays = Math.max(...results.map(r => r.equityCurve.length));
    
    for (let day = 0; day < maxDays; day++) {
      const dataPoint: any = { day };
      
      results.forEach(result => {
        if (day < result.equityCurve.length) {
          dataPoint[result.strategyName] = result.equityCurve[day];
        }
      });
      
      equityData.push(dataPoint);
    }
    
    setEquityCurveData(equityData);

    // Preparar datos para retornos mensuales
    const monthlyData: any[] = [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    months.forEach((month, index) => {
      const dataPoint: any = { month };
      
      results.forEach(result => {
        const monthData = result.monthlyReturns.find(m => m.month === month);
        if (monthData) {
          dataPoint[result.strategyName] = monthData.return;
        }
      });
      
      monthlyData.push(dataPoint);
    });
    
    setMonthlyReturnsData(monthlyData);

    // Preparar datos para comparación de métricas
    const comparisonMetrics = [
      { name: 'Beneficio (%)', key: 'profitPercentage' },
      { name: 'Win Rate (%)', key: 'winRate' },
      { name: 'Drawdown (%)', key: 'maxDrawdown' },
      { name: 'Sharpe Ratio', key: 'sharpeRatio' },
      { name: 'Trades', key: 'trades' }
    ];
    
    const comparisonData: any[] = comparisonMetrics.map(metric => {
      const dataPoint: any = { name: metric.name };
      
      results.forEach(result => {
        dataPoint[result.strategyName] = result[metric.key as keyof BacktestResult];
      });
      
      return dataPoint;
    });
    
    setComparisonData(comparisonData);
  };

  const getLineColors = () => {
    return ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  };

  const getBarColors = () => {
    return ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  };

  const renderColoredCell = (value: number, isPercentage: boolean = false) => {
    const formattedValue = isPercentage ? `${value.toFixed(2)}%` : value.toFixed(2);
    
    if (value > 0) {
      return <span className="text-green-500">{formattedValue}</span>;
    } else if (value < 0) {
      return <span className="text-red-500">{formattedValue}</span>;
    }
    
    return formattedValue;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparación de Estrategias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Ejecutando comparación...</p>
            </div>
          ) : (
            <>
              {results.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {results.map((result, index) => (
                      <Badge 
                        key={result.strategyId} 
                        variant="outline"
                        style={{ borderColor: getLineColors()[index % getLineColors().length] }}
                      >
                        {result.strategyName}
                      </Badge>
                    ))}
                  </div>
                  
                  <Tabs defaultValue="equity">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="equity">Curva de Equity</TabsTrigger>
                      <TabsTrigger value="monthly">Retornos Mensuales</TabsTrigger>
                      <TabsTrigger value="metrics">Métricas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="equity" className="space-y-4">
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={equityCurveData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="day" 
                              label={{ value: 'Días', position: 'insideBottomRight', offset: -10 }}
                              tick={false}
                            />
                            <YAxis 
                              label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`$${value.toFixed(2)}`, '']}
                              labelFormatter={(label) => `Día ${label}`}
                            />
                            <Legend />
                            {results.map((result, index) => (
                              <Line
                                key={result.strategyId}
                                type="monotone"
                                dataKey={result.strategyName}
                                stroke={getLineColors()[index % getLineColors().length]}
                                dot={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="monthly" className="space-y-4">
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={monthlyReturnsData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis 
                              label={{ value: 'Retorno (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`${value.toFixed(2)}%`, '']}
                            />
                            <Legend />
                            {results.map((result, index) => (
                              <Bar
                                key={result.strategyId}
                                dataKey={result.strategyName}
                                fill={getBarColors()[index % getBarColors().length]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="metrics" className="space-y-4">
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={comparisonData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis 
                              dataKey="name" 
                              type="category"
                              width={100}
                            />
                            <Tooltip />
                            <Legend />
                            {results.map((result, index) => (
                              <Bar
                                key={result.strategyId}
                                dataKey={result.strategyName}
                                fill={getBarColors()[index % getBarColors().length]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estrategia</TableHead>
                          <TableHead>Beneficio</TableHead>
                          <TableHead>Win Rate</TableHead>
                          <TableHead>Drawdown</TableHead>
                          <TableHead>Sharpe</TableHead>
                          <TableHead>Trades</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result) => (
                          <TableRow key={result.strategyId}>
                            <TableCell className="font-medium">{result.strategyName}</TableCell>
                            <TableCell>{renderColoredCell(result.profitPercentage, true)}</TableCell>
                            <TableCell>{result.winRate.toFixed(2)}%</TableCell>
                            <TableCell>{result.maxDrawdown.toFixed(2)}%</TableCell>
                            <TableCell>{result.sharpeRatio.toFixed(2)}</TableCell>
                            <TableCell>{result.trades}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay resultados disponibles</p>
                  <Button 
                    onClick={runComparison} 
                    className="mt-4"
                    disabled={strategies.length === 0}
                  >
                    Ejecutar Comparación
                  </Button>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-end">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
