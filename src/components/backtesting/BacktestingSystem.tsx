import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { runBacktest } from '@/services/backtestingService';
import { useMarketData } from '@/hooks/useMarketData';
import { toast } from 'sonner';
import { Icons } from "@/components/icons";
import { StrategyEditor, CustomStrategy } from './StrategyEditor';
import { ParameterOptimizer } from './ParameterOptimizer';
import { StrategyComparison } from './StrategyComparison';
import { AdvancedMetrics } from './AdvancedMetrics';

interface BacktestResult {
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
  tradeHistory: {
    entryPrice: number;
    exitPrice: number;
    entryDate: string;
    exitDate: string;
    profit: number;
    profitPercentage: number;
  }[];
  equityCurve?: number[];
}

export function BacktestingSystem() {
  // Estados básicos
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [initialBalance, setInitialBalance] = useState<string>("1000");
  const [strategy, setStrategy] = useState<string>("rsi");
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { historicalData } = useMarketData();

  // Estados para funcionalidades avanzadas
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [customStrategies, setCustomStrategies] = useState<CustomStrategy[]>([]);
  const [selectedCustomStrategy, setSelectedCustomStrategy] = useState<CustomStrategy | null>(null);
  const [isStrategyEditorOpen, setIsStrategyEditorOpen] = useState<boolean>(false);
  const [isParameterOptimizerOpen, setIsParameterOptimizerOpen] = useState<boolean>(false);
  const [isStrategyComparisonOpen, setIsStrategyComparisonOpen] = useState<boolean>(false);
  const [strategiesToCompare, setStrategiesToCompare] = useState<CustomStrategy[]>([]);
  const [equityCurveData, setEquityCurveData] = useState<any[]>([]);

  // Cargar estrategias personalizadas guardadas
  useEffect(() => {
    const loadCustomStrategies = () => {
      try {
        const savedStrategies = localStorage.getItem('customStrategies');
        if (savedStrategies) {
          setCustomStrategies(JSON.parse(savedStrategies));
        }
      } catch (error) {
        console.error("Error al cargar estrategias personalizadas:", error);
      }
    };

    loadCustomStrategies();
  }, []);

  // Guardar estrategias personalizadas
  useEffect(() => {
    if (customStrategies.length > 0) {
      localStorage.setItem('customStrategies', JSON.stringify(customStrategies));
    }
  }, [customStrategies]);

  // Preparar datos para gráficos cuando hay resultados
  useEffect(() => {
    if (results && results.equityCurve) {
      const data = results.equityCurve.map((value, index) => ({
        day: index,
        balance: value
      }));
      setEquityCurveData(data);
    }
  }, [results]);

  const predefinedStrategies = [
    { value: "rsi", label: "RSI Overbought/Oversold" },
    { value: "macd", label: "MACD Crossover" },
    { value: "bollinger", label: "Bollinger Bands" },
    { value: "fibonacci", label: "Fibonacci Retracement" },
    { value: "custom", label: "Estrategia Personalizada" }
  ];

  const handleRunBacktest = async () => {
    if (!startDate || !endDate || !historicalData) {
      toast.error("Por favor, selecciona un rango de fechas válido");
      return;
    }

    setLoading(true);
    try {
      const config = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        initialBalance: Number(initialBalance),
        strategy
      };

      // Si es una estrategia personalizada, añadir la configuración
      if (strategy === 'custom' && selectedCustomStrategy) {
        config.customStrategy = selectedCustomStrategy;
      }

      const backtestResults = await runBacktest(config, historicalData);
      setResults(backtestResults);
      toast.success("Backtest completado exitosamente");
    } catch (error) {
      console.error("Error en backtesting:", error);
      toast.error("Error al ejecutar el backtest");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStrategy = (strategy: CustomStrategy) => {
    // Verificar si ya existe una estrategia con el mismo ID
    const existingIndex = customStrategies.findIndex(s => s.id === strategy.id);

    if (existingIndex >= 0) {
      // Actualizar estrategia existente
      const updatedStrategies = [...customStrategies];
      updatedStrategies[existingIndex] = strategy;
      setCustomStrategies(updatedStrategies);
    } else {
      // Añadir nueva estrategia
      setCustomStrategies([...customStrategies, strategy]);
    }

    setIsStrategyEditorOpen(false);
    toast.success(`Estrategia "${strategy.name}" guardada correctamente`);
  };

  const handleEditStrategy = (strategy: CustomStrategy) => {
    setSelectedCustomStrategy(strategy);
    setIsStrategyEditorOpen(true);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    const updatedStrategies = customStrategies.filter(s => s.id !== strategyId);
    setCustomStrategies(updatedStrategies);

    if (selectedCustomStrategy?.id === strategyId) {
      setSelectedCustomStrategy(null);
      setStrategy('rsi'); // Volver a una estrategia predefinida
    }

    toast.success("Estrategia eliminada correctamente");
  };

  const handleOptimizeParameters = (optimizedParameters: any[]) => {
    if (!selectedCustomStrategy) return;

    // Actualizar la estrategia con los parámetros optimizados
    const updatedStrategy = {
      ...selectedCustomStrategy,
      parameters: optimizedParameters
    };

    // Actualizar en la lista de estrategias
    const updatedStrategies = customStrategies.map(s =>
      s.id === updatedStrategy.id ? updatedStrategy : s
    );

    setCustomStrategies(updatedStrategies);
    setSelectedCustomStrategy(updatedStrategy);
    setIsParameterOptimizerOpen(false);

    toast.success("Parámetros optimizados aplicados correctamente");
  };

  const handleCompareStrategies = () => {
    // Verificar si hay estrategias seleccionadas para comparar
    if (strategiesToCompare.length < 2) {
      toast.error("Selecciona al menos 2 estrategias para comparar");
      return;
    }

    setIsStrategyComparisonOpen(true);
  };

  const handleAddToComparison = (strategy: CustomStrategy) => {
    // Verificar si ya está en la lista
    if (strategiesToCompare.some(s => s.id === strategy.id)) {
      toast.error("Esta estrategia ya está en la comparación");
      return;
    }

    setStrategiesToCompare([...strategiesToCompare, strategy]);
    toast.success(`Estrategia "${strategy.name}" añadida a la comparación`);
  };

  const handleRemoveFromComparison = (strategyId: string) => {
    const updatedStrategies = strategiesToCompare.filter(s => s.id !== strategyId);
    setStrategiesToCompare(updatedStrategies);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sistema de Backtesting Avanzado</CardTitle>
        <CardDescription>
          Prueba y optimiza estrategias de trading con datos históricos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            <TabsTrigger value="strategies">Estrategias</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                />
              </div>
              <div className="space-y-2">
                <Label>Balance Inicial (USD)</Label>
                <Input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Estrategia</Label>
                <Select
                  value={strategy}
                  onValueChange={(value) => {
                    setStrategy(value);
                    if (value !== 'custom') {
                      setSelectedCustomStrategy(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una estrategia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rsi">RSI Overbought/Oversold</SelectItem>
                    <SelectItem value="macd">MACD Crossover</SelectItem>
                    <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                    <SelectItem value="fibonacci">Fibonacci Retracement</SelectItem>
                    {customStrategies.length > 0 && (
                      <>
                        <SelectItem value="custom" disabled>
                          --- Estrategias Personalizadas ---
                        </SelectItem>
                        {customStrategies.map((cs) => (
                          <SelectItem
                            key={cs.id}
                            value={`custom_${cs.id}`}
                            onSelect={() => {
                              setStrategy('custom');
                              setSelectedCustomStrategy(cs);
                            }}
                          >
                            {cs.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {strategy === 'custom' && selectedCustomStrategy && (
              <Card className="p-4 border-dashed">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">{selectedCustomStrategy.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedCustomStrategy.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStrategy(selectedCustomStrategy)}
                    >
                      <Icons.edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsParameterOptimizerOpen(true)}
                    >
                      <Icons.settings className="h-4 w-4 mr-1" />
                      Optimizar
                    </Button>
                  </div>
                </div>

                {selectedCustomStrategy.parameters.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedCustomStrategy.parameters.map((param, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{param.label}:</span> {param.value}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            <Button
              onClick={handleRunBacktest}
              disabled={loading || !startDate || !endDate || !historicalData || (strategy === 'custom' && !selectedCustomStrategy)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Icons.loader className="h-4 w-4 mr-2 animate-spin" />
                  Ejecutando Backtest...
                </>
              ) : (
                <>
                  <Icons.play className="h-4 w-4 mr-2" />
                  Ejecutar Backtest
                </>
              )}
            </Button>

            {results && (
              <div className="mt-6 space-y-6">
                <h3 className="text-lg font-semibold">Resultados del Backtest</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Balance Final</div>
                      <div className="text-2xl font-bold">${results.finalBalance.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Beneficio</div>
                      <div className={`text-2xl font-bold ${results.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {results.profit >= 0 ? '+' : ''}${results.profit.toFixed(2)} ({results.profitPercentage.toFixed(2)}%)
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
                      <div className="text-2xl font-bold">{results.winRate.toFixed(2)}%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Ratio Sharpe</div>
                      <div className="text-2xl font-bold">{results.sharpeRatio.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>

                {equityCurveData.length > 0 && (
                  <div className="h-64 w-full">
                    <h3 className="text-sm font-medium mb-2">Curva de Equity</h3>
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
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Balance']}
                          labelFormatter={(label) => `Día ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          stroke="#8884d8"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("advanced")}
                  >
                    Ver Métricas Avanzadas
                  </Button>
                </div>

                {results.tradeHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Historial de Trades</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Fecha Entrada</th>
                            <th className="text-left py-2">Precio Entrada</th>
                            <th className="text-left py-2">Fecha Salida</th>
                            <th className="text-left py-2">Precio Salida</th>
                            <th className="text-left py-2">Beneficio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.tradeHistory.map((trade, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{new Date(trade.entryDate).toLocaleDateString()}</td>
                              <td className="py-2">${trade.entryPrice.toFixed(2)}</td>
                              <td className="py-2">{new Date(trade.exitDate).toLocaleDateString()}</td>
                              <td className="py-2">${trade.exitPrice.toFixed(2)}</td>
                              <td className={`py-2 ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)} ({trade.profitPercentage.toFixed(2)}%)
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {results ? (
              <AdvancedMetrics backtestResult={results} />
            ) : (
              <div className="text-center py-12">
                <Icons.barChart className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No hay resultados disponibles</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ejecuta un backtest primero para ver métricas avanzadas
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setActiveTab("basic")}
                >
                  Ir a Backtest Básico
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Estrategias Personalizadas</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCustomStrategy(null);
                    setIsStrategyEditorOpen(true);
                  }}
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Nueva Estrategia
                </Button>
                {strategiesToCompare.length >= 2 && (
                  <Button onClick={handleCompareStrategies}>
                    <Icons.barChart className="h-4 w-4 mr-2" />
                    Comparar ({strategiesToCompare.length})
                  </Button>
                )}
              </div>
            </div>

            {customStrategies.length === 0 ? (
              <div className="text-center py-12 border rounded-md">
                <Icons.fileCode className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No hay estrategias personalizadas</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Crea tu primera estrategia personalizada para comenzar
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsStrategyEditorOpen(true)}
                >
                  Crear Estrategia
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customStrategies.map((strategy) => (
                  <Card key={strategy.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{strategy.name}</CardTitle>
                        <div className="flex space-x-1">
                          {strategiesToCompare.some(s => s.id === strategy.id) ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromComparison(strategy.id)}
                              title="Quitar de comparación"
                            >
                              <Icons.check className="h-4 w-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAddToComparison(strategy)}
                              title="Añadir a comparación"
                            >
                              <Icons.plus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStrategy(strategy)}
                            title="Editar estrategia"
                          >
                            <Icons.edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteStrategy(strategy.id)}
                            title="Eliminar estrategia"
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {strategy.description || "Sin descripción"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-2">
                        Tipo: {
                          strategy.type === 'predefined' ? 'Predefinida' :
                          strategy.type === 'custom' ? 'Personalizada' :
                          'Combinada'
                        }
                      </div>

                      {strategy.parameters.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium mb-1">Parámetros:</div>
                          <div className="grid grid-cols-2 gap-1">
                            {strategy.parameters.map((param, index) => (
                              <div key={index} className="text-xs">
                                <span className="font-medium">{param.label}:</span> {param.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {strategy.conditions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium mb-1">Condiciones:</div>
                          <div className="space-y-1">
                            {strategy.conditions.slice(0, 2).map((condition, index) => (
                              <div key={index} className="text-xs">
                                {condition.action === 'buy' ? '🟢' : '🔴'} {condition.indicator} {
                                  condition.operator === 'greater' ? '>' :
                                  condition.operator === 'less' ? '<' :
                                  condition.operator === 'equal' ? '=' :
                                  condition.operator === 'cross-above' ? '↗' :
                                  '↘'
                                } {condition.value}
                              </div>
                            ))}
                            {strategy.conditions.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{strategy.conditions.length - 2} más...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStrategy('custom');
                            setSelectedCustomStrategy(strategy);
                            setActiveTab('basic');
                          }}
                        >
                          Usar Estrategia
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Diálogos modales */}
        <Dialog open={isStrategyEditorOpen} onOpenChange={setIsStrategyEditorOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomStrategy ? 'Editar Estrategia' : 'Nueva Estrategia'}
              </DialogTitle>
            </DialogHeader>
            <StrategyEditor
              onSave={handleSaveStrategy}
              onCancel={() => setIsStrategyEditorOpen(false)}
              initialStrategy={selectedCustomStrategy || undefined}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isParameterOptimizerOpen} onOpenChange={setIsParameterOptimizerOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Optimización de Parámetros</DialogTitle>
            </DialogHeader>
            {selectedCustomStrategy && (
              <ParameterOptimizer
                strategy={selectedCustomStrategy}
                onOptimize={handleOptimizeParameters}
                onCancel={() => setIsParameterOptimizerOpen(false)}
                historicalData={historicalData || []}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isStrategyComparisonOpen} onOpenChange={setIsStrategyComparisonOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Comparación de Estrategias</DialogTitle>
            </DialogHeader>
            <StrategyComparison
              strategies={strategiesToCompare}
              onClose={() => setIsStrategyComparisonOpen(false)}
              historicalData={historicalData || []}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}