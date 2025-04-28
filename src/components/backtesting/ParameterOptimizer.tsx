import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { toast } from 'sonner';
import { CustomStrategy, StrategyParameter } from './StrategyEditor';

interface ParameterOptimizerProps {
  strategy: CustomStrategy;
  onOptimize: (optimizedParameters: StrategyParameter[]) => void;
  onCancel: () => void;
  historicalData: any[];
}

interface ParameterRange {
  parameter: StrategyParameter;
  min: number;
  max: number;
  step: number;
  enabled: boolean;
}

interface OptimizationResult {
  parameters: Record<string, number | string>;
  profit: number;
  trades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export function ParameterOptimizer({ strategy, onOptimize, onCancel, historicalData }: ParameterOptimizerProps) {
  const [parameterRanges, setParameterRanges] = useState<ParameterRange[]>(
    strategy.parameters
      .filter(param => param.type === 'number')
      .map(param => ({
        parameter: param,
        min: typeof param.value === 'number' ? param.value * 0.5 : 1,
        max: typeof param.value === 'number' ? param.value * 1.5 : 100,
        step: 1,
        enabled: true
      }))
  );

  const [optimizationMetric, setOptimizationMetric] = useState<string>('profit');
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [bestResult, setBestResult] = useState<OptimizationResult | null>(null);

  const updateParameterRange = (index: number, field: keyof ParameterRange, value: any) => {
    const updatedRanges = [...parameterRanges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      [field]: value
    };
    setParameterRanges(updatedRanges);
  };

  const runOptimization = async () => {
    const enabledParameters = parameterRanges.filter(range => range.enabled);
    
    if (enabledParameters.length === 0) {
      toast.error("Por favor, habilita al menos un parámetro para optimizar");
      return;
    }

    setIsOptimizing(true);
    setOptimizationProgress(0);
    setResults([]);
    setBestResult(null);

    try {
      // Simulación de optimización (en un proyecto real, esto se haría con un worker o en el backend)
      const totalCombinations = calculateTotalCombinations(enabledParameters);
      let processedCombinations = 0;
      
      // Generar todas las combinaciones de parámetros
      const parameterCombinations = generateParameterCombinations(enabledParameters);
      
      const optimizationResults: OptimizationResult[] = [];
      
      // Simular la ejecución de cada combinación
      for (const combination of parameterCombinations) {
        // Simular backtesting con esta combinación de parámetros
        const result = await simulateBacktest(combination);
        optimizationResults.push(result);
        
        processedCombinations++;
        setOptimizationProgress(Math.round((processedCombinations / totalCombinations) * 100));
        
        // Simular un retraso para mostrar el progreso
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Ordenar resultados según la métrica seleccionada
      optimizationResults.sort((a, b) => {
        if (optimizationMetric === 'maxDrawdown') {
          return a[optimizationMetric] - b[optimizationMetric]; // Para drawdown, menor es mejor
        }
        return b[optimizationMetric] - a[optimizationMetric]; // Para el resto, mayor es mejor
      });
      
      setResults(optimizationResults);
      setBestResult(optimizationResults[0]);
      
      toast.success("Optimización completada");
    } catch (error) {
      console.error("Error en la optimización:", error);
      toast.error("Error al ejecutar la optimización");
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(100);
    }
  };

  const calculateTotalCombinations = (enabledParameters: ParameterRange[]): number => {
    return enabledParameters.reduce((total, param) => {
      const steps = Math.floor((param.max - param.min) / param.step) + 1;
      return total * steps;
    }, 1);
  };

  const generateParameterCombinations = (enabledParameters: ParameterRange[]): Record<string, number | string>[] => {
    // Esta es una implementación simplificada para la demostración
    // En un caso real, se generarían todas las combinaciones posibles
    
    const combinations: Record<string, number | string>[] = [];
    
    // Para simplificar, generamos 20 combinaciones aleatorias
    for (let i = 0; i < 20; i++) {
      const combination: Record<string, number | string> = {};
      
      // Asignar valores aleatorios dentro del rango para cada parámetro
      enabledParameters.forEach(param => {
        const range = param.max - param.min;
        const randomValue = param.min + Math.random() * range;
        const steppedValue = Math.round(randomValue / param.step) * param.step;
        combination[param.parameter.name] = steppedValue;
      });
      
      // Incluir parámetros no optimizados con sus valores originales
      strategy.parameters
        .filter(param => !enabledParameters.some(ep => ep.parameter.name === param.name))
        .forEach(param => {
          combination[param.name] = param.value;
        });
      
      combinations.push(combination);
    }
    
    return combinations;
  };

  const simulateBacktest = async (parameters: Record<string, number | string>): Promise<OptimizationResult> => {
    // Simulación de resultados de backtesting
    // En un caso real, esto llamaría al servicio de backtesting con los parámetros
    
    const profit = Math.random() * 50 - 10; // -10% a +40%
    const trades = Math.floor(Math.random() * 100) + 10;
    const winRate = Math.random() * 70 + 30; // 30% a 100%
    const maxDrawdown = Math.random() * 30; // 0% a 30%
    const sharpeRatio = Math.random() * 3; // 0 a 3
    
    return {
      parameters,
      profit,
      trades,
      winRate,
      maxDrawdown,
      sharpeRatio
    };
  };

  const applyOptimizedParameters = () => {
    if (!bestResult) {
      toast.error("No hay resultados de optimización disponibles");
      return;
    }
    
    // Actualizar los parámetros de la estrategia con los valores optimizados
    const optimizedParameters = strategy.parameters.map(param => {
      const optimizedValue = bestResult.parameters[param.name];
      return {
        ...param,
        value: optimizedValue !== undefined ? optimizedValue : param.value
      };
    });
    
    onOptimize(optimizedParameters);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Optimización de Parámetros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Parámetros a Optimizar</h3>
            {parameterRanges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay parámetros numéricos disponibles para optimizar
              </p>
            ) : (
              <div className="space-y-4">
                {parameterRanges.map((range, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{range.parameter.label}</Label>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`enable-${index}`} className="text-sm">Habilitar</Label>
                        <Switch
                          id={`enable-${index}`}
                          checked={range.enabled}
                          onCheckedChange={(checked) => updateParameterRange(index, 'enabled', checked)}
                        />
                      </div>
                    </div>
                    
                    {range.enabled && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Mínimo</Label>
                            <Input
                              type="number"
                              value={range.min}
                              onChange={(e) => updateParameterRange(index, 'min', parseFloat(e.target.value))}
                              disabled={!range.enabled}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Máximo</Label>
                            <Input
                              type="number"
                              value={range.max}
                              onChange={(e) => updateParameterRange(index, 'max', parseFloat(e.target.value))}
                              disabled={!range.enabled}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Paso</Label>
                            <Input
                              type="number"
                              value={range.step}
                              onChange={(e) => updateParameterRange(index, 'step', parseFloat(e.target.value))}
                              disabled={!range.enabled}
                              min={0.01}
                              step={0.01}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs">{range.min}</span>
                            <span className="text-xs">{range.max}</span>
                          </div>
                          <Slider
                            value={[range.min, range.max]}
                            min={range.parameter.min || 0}
                            max={range.parameter.max || 100}
                            step={range.step}
                            onValueChange={([min, max]) => {
                              updateParameterRange(index, 'min', min);
                              updateParameterRange(index, 'max', max);
                            }}
                            disabled={!range.enabled}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Métrica de Optimización</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button
                variant={optimizationMetric === 'profit' ? 'default' : 'outline'}
                onClick={() => setOptimizationMetric('profit')}
                className="w-full"
              >
                Beneficio
              </Button>
              <Button
                variant={optimizationMetric === 'winRate' ? 'default' : 'outline'}
                onClick={() => setOptimizationMetric('winRate')}
                className="w-full"
              >
                Win Rate
              </Button>
              <Button
                variant={optimizationMetric === 'maxDrawdown' ? 'default' : 'outline'}
                onClick={() => setOptimizationMetric('maxDrawdown')}
                className="w-full"
              >
                Drawdown
              </Button>
              <Button
                variant={optimizationMetric === 'sharpeRatio' ? 'default' : 'outline'}
                onClick={() => setOptimizationMetric('sharpeRatio')}
                className="w-full"
              >
                Sharpe
              </Button>
              <Button
                variant={optimizationMetric === 'trades' ? 'default' : 'outline'}
                onClick={() => setOptimizationMetric('trades')}
                className="w-full"
              >
                Trades
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={runOptimization} 
              disabled={isOptimizing || parameterRanges.filter(r => r.enabled).length === 0}
              className="w-full"
            >
              {isOptimizing ? 'Optimizando...' : 'Iniciar Optimización'}
            </Button>
            
            {isOptimizing && (
              <div className="space-y-1">
                <Progress value={optimizationProgress} />
                <p className="text-xs text-center text-muted-foreground">
                  Progreso: {optimizationProgress}%
                </p>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Resultados de Optimización</h3>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="profit" 
                      name="Beneficio" 
                      unit="%" 
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="sharpeRatio" 
                      name="Sharpe Ratio" 
                      domain={[0, 'auto']}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="trades" 
                      range={[50, 400]} 
                      name="Trades"
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value: any, name: string) => {
                        if (name === 'Beneficio') return [`${value.toFixed(2)}%`, name];
                        return [value.toFixed(2), name];
                      }}
                    />
                    <Scatter 
                      name="Resultados" 
                      data={results} 
                      fill="#8884d8"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parámetros</TableHead>
                      <TableHead>Beneficio</TableHead>
                      <TableHead>Win Rate</TableHead>
                      <TableHead>Drawdown</TableHead>
                      <TableHead>Sharpe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.slice(0, 5).map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {Object.entries(result.parameters)
                            .filter(([key]) => parameterRanges.some(r => r.enabled && r.parameter.name === key))
                            .map(([key, value]) => (
                              <div key={key} className="text-xs">
                                {strategy.parameters.find(p => p.name === key)?.label}: {value}
                              </div>
                            ))}
                        </TableCell>
                        <TableCell className={result.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {result.profit.toFixed(2)}%
                        </TableCell>
                        <TableCell>{result.winRate.toFixed(2)}%</TableCell>
                        <TableCell>{result.maxDrawdown.toFixed(2)}%</TableCell>
                        <TableCell>{result.sharpeRatio.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {bestResult && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mejor Combinación</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Beneficio</div>
                          <div className={`text-lg font-bold ${bestResult.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {bestResult.profit.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Win Rate</div>
                          <div className="text-lg font-bold">{bestResult.winRate.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Drawdown</div>
                          <div className="text-lg font-bold">{bestResult.maxDrawdown.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Sharpe</div>
                          <div className="text-lg font-bold">{bestResult.sharpeRatio.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Trades</div>
                          <div className="text-lg font-bold">{bestResult.trades}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-xs font-medium mb-2">Parámetros Optimizados</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(bestResult.parameters)
                            .filter(([key]) => parameterRanges.some(r => r.enabled && r.parameter.name === key))
                            .map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{strategy.parameters.find(p => p.name === key)?.label}:</span> {value}
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button 
                  onClick={applyOptimizedParameters}
                  disabled={!bestResult}
                >
                  Aplicar Parámetros Optimizados
                </Button>
              </div>
            </div>
          )}
          
          {!isOptimizing && results.length === 0 && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
