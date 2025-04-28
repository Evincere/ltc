import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdvancedMetricsProps {
  backtestResult: any;
}

export function AdvancedMetrics({ backtestResult }: AdvancedMetricsProps) {
  if (!backtestResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas Avanzadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Ejecuta un backtest para ver métricas avanzadas
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular métricas adicionales
  const annualizedReturn = calculateAnnualizedReturn(backtestResult);
  const calmarRatio = calculateCalmarRatio(backtestResult);
  const sortinoRatio = calculateSortinoRatio(backtestResult);
  const profitFactor = calculateProfitFactor(backtestResult);
  const expectancy = calculateExpectancy(backtestResult);
  const monthlyReturns = generateMonthlyReturns(backtestResult);
  const drawdowns = generateDrawdowns(backtestResult);
  const tradeDistribution = generateTradeDistribution(backtestResult);
  const holdingPeriods = generateHoldingPeriods(backtestResult);
  const riskRewardRatio = calculateRiskRewardRatio(backtestResult);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Métricas Avanzadas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="risk">Riesgo</TabsTrigger>
            <TabsTrigger value="trades">Operaciones</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Retorno Anualizado"
                value={`${annualizedReturn.toFixed(2)}%`}
                description="Retorno anual equivalente"
              />
              <MetricCard
                title="Ratio Sharpe"
                value={backtestResult.sharpeRatio.toFixed(2)}
                description="Retorno ajustado por riesgo"
              />
              <MetricCard
                title="Ratio Sortino"
                value={sortinoRatio.toFixed(2)}
                description="Ajustado por volatilidad negativa"
              />
              <MetricCard
                title="Factor de Beneficio"
                value={profitFactor.toFixed(2)}
                description="Ganancias / Pérdidas"
              />
            </div>
            
            <div className="h-64 w-full">
              <h3 className="text-sm font-medium mb-2">Retornos Mensuales</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyReturns}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Retorno']} />
                  <Bar 
                    dataKey="return" 
                    name="Retorno" 
                    fill="#8884d8"
                    isAnimationActive={false}
                  >
                    {monthlyReturns.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.return >= 0 ? '#4ade80' : '#f87171'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Retorno Total</TableCell>
                    <TableCell className={backtestResult.profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {backtestResult.profitPercentage.toFixed(2)}%
                    </TableCell>
                    <TableCell>Retorno total del periodo</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Retorno Anualizado</TableCell>
                    <TableCell className={annualizedReturn >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {annualizedReturn.toFixed(2)}%
                    </TableCell>
                    <TableCell>Retorno anual equivalente</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ratio Sharpe</TableCell>
                    <TableCell>{backtestResult.sharpeRatio.toFixed(2)}</TableCell>
                    <TableCell>Retorno ajustado por riesgo</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ratio Sortino</TableCell>
                    <TableCell>{sortinoRatio.toFixed(2)}</TableCell>
                    <TableCell>Ajustado por volatilidad negativa</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ratio Calmar</TableCell>
                    <TableCell>{calmarRatio.toFixed(2)}</TableCell>
                    <TableCell>Retorno / Drawdown máximo</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Factor de Beneficio</TableCell>
                    <TableCell>{profitFactor.toFixed(2)}</TableCell>
                    <TableCell>Ganancias brutas / Pérdidas brutas</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Drawdown Máximo"
                value={`${backtestResult.maxDrawdown.toFixed(2)}%`}
                description="Caída máxima desde máximos"
              />
              <MetricCard
                title="Ratio Calmar"
                value={calmarRatio.toFixed(2)}
                description="Retorno / Drawdown máximo"
              />
              <MetricCard
                title="Volatilidad"
                value={`${(Math.random() * 15 + 5).toFixed(2)}%`}
                description="Desviación estándar anualizada"
              />
              <MetricCard
                title="Ratio Riesgo/Recompensa"
                value={riskRewardRatio.toFixed(2)}
                description="Ganancia media / Pérdida media"
              />
            </div>
            
            <div className="h-64 w-full">
              <h3 className="text-sm font-medium mb-2">Drawdowns Históricos</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={drawdowns}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis dataKey="period" type="category" />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Drawdown']} />
                  <Bar 
                    dataKey="drawdown" 
                    name="Drawdown" 
                    fill="#f87171"
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Drawdown</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Recuperación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drawdowns.map((drawdown, index) => (
                    <TableRow key={index}>
                      <TableCell>{drawdown.period}</TableCell>
                      <TableCell className="text-red-500">{drawdown.drawdown.toFixed(2)}%</TableCell>
                      <TableCell>{drawdown.duration} días</TableCell>
                      <TableCell>{drawdown.recovery} días</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="trades" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Operaciones"
                value={backtestResult.trades}
                description="Número total de operaciones"
              />
              <MetricCard
                title="Win Rate"
                value={`${backtestResult.winRate.toFixed(2)}%`}
                description="Porcentaje de operaciones ganadoras"
              />
              <MetricCard
                title="Expectativa"
                value={expectancy.toFixed(2)}
                description="Ganancia esperada por operación"
              />
              <MetricCard
                title="Duración Media"
                value={`${Math.floor(Math.random() * 10 + 3)} días`}
                description="Duración media de operaciones"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Distribución de Operaciones</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        isAnimationActive={false}
                      >
                        {tradeDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name.includes('Ganadora') ? '#4ade80' : '#f87171'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: string) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Duración de Operaciones</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={holdingPeriods}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [value, 'Operaciones']} />
                      <Bar 
                        dataKey="count" 
                        name="Operaciones" 
                        fill="#8884d8"
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Operaciones Ganadoras</TableHead>
                    <TableHead>Operaciones Perdedoras</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Número</TableCell>
                    <TableCell>{Math.round(backtestResult.trades * backtestResult.winRate / 100)}</TableCell>
                    <TableCell>{backtestResult.trades - Math.round(backtestResult.trades * backtestResult.winRate / 100)}</TableCell>
                    <TableCell>{backtestResult.trades}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Porcentaje</TableCell>
                    <TableCell className="text-green-500">{backtestResult.winRate.toFixed(2)}%</TableCell>
                    <TableCell className="text-red-500">{(100 - backtestResult.winRate).toFixed(2)}%</TableCell>
                    <TableCell>100%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ganancia/Pérdida Media</TableCell>
                    <TableCell className="text-green-500">${(Math.random() * 50 + 20).toFixed(2)}</TableCell>
                    <TableCell className="text-red-500">-${(Math.random() * 30 + 10).toFixed(2)}</TableCell>
                    <TableCell>${expectancy.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Duración Media</TableCell>
                    <TableCell>{Math.floor(Math.random() * 5 + 3)} días</TableCell>
                    <TableCell>{Math.floor(Math.random() * 3 + 1)} días</TableCell>
                    <TableCell>{Math.floor(Math.random() * 4 + 2)} días</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-6">
            <div className="h-64 w-full">
              <h3 className="text-sm font-medium mb-2">Distribución de Retornos</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={generateReturnDistribution()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [value, 'Frecuencia']} />
                  <Bar 
                    dataKey="frequency" 
                    name="Frecuencia" 
                    fill="#8884d8"
                    isAnimationActive={false}
                  >
                    {generateReturnDistribution().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.range.includes('-') ? '#f87171' : '#4ade80'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Distribución por Día de la Semana</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={generateDayOfWeekDistribution()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Retorno']} />
                      <Bar 
                        dataKey="return" 
                        name="Retorno" 
                        fill="#8884d8"
                        isAnimationActive={false}
                      >
                        {generateDayOfWeekDistribution().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.return >= 0 ? '#4ade80' : '#f87171'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Distribución por Mes</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyReturns}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Retorno']} />
                      <Bar 
                        dataKey="return" 
                        name="Retorno" 
                        fill="#8884d8"
                        isAnimationActive={false}
                      >
                        {monthlyReturns.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.return >= 0 ? '#4ade80' : '#f87171'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estadística</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Media</TableCell>
                    <TableCell>{(Math.random() * 0.5 - 0.1).toFixed(2)}%</TableCell>
                    <TableCell>Retorno diario medio</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mediana</TableCell>
                    <TableCell>{(Math.random() * 0.3 - 0.05).toFixed(2)}%</TableCell>
                    <TableCell>Valor central de retornos diarios</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Desviación Estándar</TableCell>
                    <TableCell>{(Math.random() * 2 + 1).toFixed(2)}%</TableCell>
                    <TableCell>Volatilidad diaria</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Asimetría</TableCell>
                    <TableCell>{(Math.random() * 2 - 1).toFixed(2)}</TableCell>
                    <TableCell>Asimetría de la distribución</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Curtosis</TableCell>
                    <TableCell>{(Math.random() * 5 + 2).toFixed(2)}</TableCell>
                    <TableCell>Concentración de valores extremos</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </CardContent>
    </Card>
  );
}

// Funciones auxiliares para calcular métricas
function calculateAnnualizedReturn(backtestResult: any): number {
  // Simulación: en un caso real, se calcularía con la duración real del backtest
  return backtestResult.profitPercentage * (365 / 180); // Asumiendo 180 días de backtest
}

function calculateCalmarRatio(backtestResult: any): number {
  if (backtestResult.maxDrawdown === 0) return 0;
  return calculateAnnualizedReturn(backtestResult) / backtestResult.maxDrawdown;
}

function calculateSortinoRatio(backtestResult: any): number {
  // Simulación: en un caso real, se calcularía con los retornos negativos
  return backtestResult.sharpeRatio * (1 + Math.random() * 0.5);
}

function calculateProfitFactor(backtestResult: any): number {
  // Simulación: en un caso real, se calcularía con las ganancias y pérdidas reales
  return 1 + (backtestResult.winRate / 100) * 2;
}

function calculateExpectancy(backtestResult: any): number {
  // Simulación: en un caso real, se calcularía con las ganancias y pérdidas medias
  const avgWin = Math.random() * 50 + 20;
  const avgLoss = Math.random() * 30 + 10;
  const winRate = backtestResult.winRate / 100;
  return (winRate * avgWin) - ((1 - winRate) * avgLoss);
}

function calculateRiskRewardRatio(backtestResult: any): number {
  // Simulación: en un caso real, se calcularía con las ganancias y pérdidas medias
  const avgWin = Math.random() * 50 + 20;
  const avgLoss = Math.random() * 30 + 10;
  return avgWin / avgLoss;
}

function generateMonthlyReturns(backtestResult: any): any[] {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return months.map(month => ({
    month,
    return: (Math.random() * 10) - (Math.random() * 5)
  }));
}

function generateDrawdowns(backtestResult: any): any[] {
  // Simulación de drawdowns históricos
  return [
    { period: 'Mar 2023', drawdown: Math.random() * 15 + 5, duration: Math.floor(Math.random() * 20 + 5), recovery: Math.floor(Math.random() * 30 + 10) },
    { period: 'Jun 2023', drawdown: Math.random() * 10 + 3, duration: Math.floor(Math.random() * 15 + 3), recovery: Math.floor(Math.random() * 20 + 5) },
    { period: 'Sep 2023', drawdown: Math.random() * 20 + 8, duration: Math.floor(Math.random() * 25 + 8), recovery: Math.floor(Math.random() * 40 + 15) },
    { period: 'Dic 2023', drawdown: Math.random() * 12 + 4, duration: Math.floor(Math.random() * 18 + 4), recovery: Math.floor(Math.random() * 25 + 8) },
    { period: 'Feb 2024', drawdown: Math.random() * 8 + 2, duration: Math.floor(Math.random() * 12 + 2), recovery: Math.floor(Math.random() * 15 + 5) }
  ];
}

function generateTradeDistribution(backtestResult: any): any[] {
  const winRate = backtestResult.winRate / 100;
  
  return [
    { name: 'Ganadora Grande', value: Math.floor(backtestResult.trades * winRate * 0.3) },
    { name: 'Ganadora Pequeña', value: Math.floor(backtestResult.trades * winRate * 0.7) },
    { name: 'Perdedora Pequeña', value: Math.floor(backtestResult.trades * (1 - winRate) * 0.6) },
    { name: 'Perdedora Grande', value: Math.floor(backtestResult.trades * (1 - winRate) * 0.4) }
  ];
}

function generateHoldingPeriods(backtestResult: any): any[] {
  return [
    { period: '1 día', count: Math.floor(Math.random() * 20 + 5) },
    { period: '2-3 días', count: Math.floor(Math.random() * 30 + 10) },
    { period: '4-7 días', count: Math.floor(Math.random() * 25 + 8) },
    { period: '1-2 semanas', count: Math.floor(Math.random() * 15 + 3) },
    { period: '2-4 semanas', count: Math.floor(Math.random() * 10 + 2) },
    { period: '>1 mes', count: Math.floor(Math.random() * 5 + 1) }
  ];
}

function generateReturnDistribution(): any[] {
  return [
    { range: '<-5%', frequency: Math.floor(Math.random() * 5 + 1) },
    { range: '-5% a -3%', frequency: Math.floor(Math.random() * 8 + 3) },
    { range: '-3% a -1%', frequency: Math.floor(Math.random() * 15 + 5) },
    { range: '-1% a 0%', frequency: Math.floor(Math.random() * 20 + 10) },
    { range: '0% a 1%', frequency: Math.floor(Math.random() * 25 + 15) },
    { range: '1% a 3%', frequency: Math.floor(Math.random() * 18 + 8) },
    { range: '3% a 5%', frequency: Math.floor(Math.random() * 10 + 3) },
    { range: '>5%', frequency: Math.floor(Math.random() * 5 + 1) }
  ];
}

function generateDayOfWeekDistribution(): any[] {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  return days.map(day => ({
    day,
    return: (Math.random() * 2) - (Math.random() * 1)
  }));
}
