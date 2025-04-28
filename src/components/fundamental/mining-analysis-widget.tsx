import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { miningAnalysisService, MiningStats, MinerDevice, MiningProfitability } from '@/services/mining-analysis';

interface MiningAnalysisWidgetProps {
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function MiningAnalysisWidget({ onRemove, onConfigure }: MiningAnalysisWidgetProps) {
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMiner, setSelectedMiner] = useState<MinerDevice | null>(null);
  const [powerCost, setPowerCost] = useState<number>(0.12); // USD/kWh
  const [ltcPrice, setLtcPrice] = useState<number>(80); // USD
  const [profitability, setProfitability] = useState<MiningProfitability | null>(null);
  const [minerComparison, setMinerComparison] = useState<any[]>([]);
  const [customHashRate, setCustomHashRate] = useState<number>(500);
  const [customPower, setCustomPower] = useState<number>(800);

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#AAAAAA'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedMiner) {
      calculateProfitability();
    }
  }, [selectedMiner, powerCost, ltcPrice]);

  useEffect(() => {
    calculateCustomProfitability();
  }, [customHashRate, customPower, powerCost, ltcPrice]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const stats = await miningAnalysisService.getMiningStats();
      setMiningStats(stats);
      
      // Actualizar precio de LTC en el servicio
      miningAnalysisService.setLtcPrice(ltcPrice);
      
      // Cargar comparación de mineros
      compareMiners();
    } catch (error) {
      console.error('Error loading mining stats:', error);
      toast.error('Error al cargar estadísticas de minería');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfitability = () => {
    if (!selectedMiner) return;
    
    try {
      const result = miningAnalysisService.calculateMinerProfitability(
        selectedMiner,
        powerCost,
        ltcPrice
      );
      
      setProfitability(result);
    } catch (error) {
      console.error('Error calculating profitability:', error);
      toast.error('Error al calcular rentabilidad');
    }
  };

  const calculateCustomProfitability = () => {
    try {
      const result = miningAnalysisService.calculateProfitability(
        customHashRate,
        customPower,
        powerCost,
        ltcPrice
      );
      
      setProfitability(result);
    } catch (error) {
      console.error('Error calculating custom profitability:', error);
    }
  };

  const compareMiners = () => {
    try {
      const miners = miningAnalysisService.getPopularMiners();
      const comparison = miningAnalysisService.compareMiners(miners, powerCost, ltcPrice);
      setMinerComparison(comparison);
    } catch (error) {
      console.error('Error comparing miners:', error);
    }
  };

  const handleSelectMiner = (miner: MinerDevice) => {
    setSelectedMiner(miner);
  };

  const handlePowerCostChange = (value: number) => {
    setPowerCost(value);
  };

  const handleLtcPriceChange = (value: number) => {
    setLtcPrice(value);
    miningAnalysisService.setLtcPrice(value);
    compareMiners();
  };

  const formatHashRate = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} GH/s`;
    }
    return `${value.toFixed(2)} MH/s`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
  };

  const formatPower = (value: number): string => {
    return `${value.toFixed(0)} W`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Análisis de Minería</CardTitle>
          <CardDescription>
            Estadísticas y rentabilidad de la minería de Litecoin
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
        {isLoading && !miningStats ? (
          <div className="flex justify-center items-center py-8">
            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="profitability">Rentabilidad</TabsTrigger>
              <TabsTrigger value="comparison">Comparación</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {miningStats && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      title="Hash Rate Total"
                      value={`${miningStats.totalHashRate.toFixed(2)} TH/s`}
                    />
                    <StatCard
                      title="Dificultad"
                      value={miningStats.difficulty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    />
                    <StatCard
                      title="Tiempo de Bloque"
                      value={`${miningStats.averageBlockTime.toFixed(2)} min`}
                    />
                    <StatCard
                      title="Recompensa por Bloque"
                      value={`${miningStats.blockReward} LTC`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="text-sm font-medium mb-4">Distribución de Hash Rate</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={miningStats.pools}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="hashRate"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {miningStats.pools.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [`${value.toFixed(2)} TH/s`, 'Hash Rate']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-4">Bloques Minados (24h)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={miningStats.pools}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              formatter={(value: any) => [value, 'Bloques']}
                            />
                            <Bar
                              dataKey="blocksLast24h"
                              name="Bloques"
                              fill="#8884d8"
                            >
                              {miningStats.pools.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Próximo Cambio de Dificultad</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <StatCard
                        title="Dificultad Estimada"
                        value={miningStats.nextDifficultyEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      />
                      <StatCard
                        title="Cambio Esperado"
                        value={`${miningStats.nextDifficultyChangePercentage > 0 ? '+' : ''}${miningStats.nextDifficultyChangePercentage.toFixed(2)}%`}
                        valueClassName={miningStats.nextDifficultyChangePercentage > 0 ? 'text-red-500' : 'text-green-500'}
                      />
                      <StatCard
                        title="Impacto en Rentabilidad"
                        value={`${miningStats.nextDifficultyChangePercentage > 0 ? '-' : '+'}${Math.abs(miningStats.nextDifficultyChangePercentage).toFixed(2)}%`}
                        valueClassName={miningStats.nextDifficultyChangePercentage > 0 ? 'text-red-500' : 'text-green-500'}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="profitability" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Calculadora de Rentabilidad</h3>
                  
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="space-y-2">
                      <Label>Seleccionar Minero</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {miningAnalysisService.getPopularMiners().map((miner, index) => (
                          <Button
                            key={index}
                            variant={selectedMiner?.name === miner.name ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => handleSelectMiner(miner)}
                          >
                            <div className="text-left">
                              <div>{miner.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatHashRate(miner.hashRate)} | {formatPower(miner.power)}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Personalizado</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Hash Rate (MH/s)</Label>
                          <Input
                            type="number"
                            value={customHashRate}
                            onChange={(e) => setCustomHashRate(parseFloat(e.target.value))}
                            min={1}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Consumo (W)</Label>
                          <Input
                            type="number"
                            value={customPower}
                            onChange={(e) => setCustomPower(parseFloat(e.target.value))}
                            min={1}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Costo de Electricidad (USD/kWh)</Label>
                        <span className="text-sm">${powerCost.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[powerCost]}
                        min={0.01}
                        max={0.5}
                        step={0.01}
                        onValueChange={(value) => handlePowerCostChange(value[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Precio de LTC (USD)</Label>
                        <span className="text-sm">${ltcPrice.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[ltcPrice]}
                        min={10}
                        max={500}
                        step={1}
                        onValueChange={(value) => handleLtcPriceChange(value[0])}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Resultados</h3>
                  
                  {profitability ? (
                    <div className="border rounded-md p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard
                          title="Recompensa Diaria"
                          value={`${profitability.dailyReward.toFixed(6)} LTC`}
                        />
                        <StatCard
                          title="Ingresos Diarios"
                          value={formatCurrency(profitability.dailyRevenue)}
                        />
                        <StatCard
                          title="Costos Diarios"
                          value={formatCurrency(profitability.dailyCost)}
                        />
                        <StatCard
                          title="Beneficio Diario"
                          value={formatCurrency(profitability.dailyProfit)}
                          valueClassName={profitability.dailyProfit >= 0 ? 'text-green-500' : 'text-red-500'}
                        />
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <StatCard
                            title="Beneficio Mensual"
                            value={formatCurrency(profitability.monthlyProfit)}
                            valueClassName={profitability.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500'}
                          />
                          <StatCard
                            title="Recuperación"
                            value={profitability.breakEvenDays > 0 ? `${Math.round(profitability.breakEvenDays)} días` : 'Nunca'}
                          />
                          <StatCard
                            title="ROI Anual"
                            value={`${profitability.roi.toFixed(2)}%`}
                            valueClassName={profitability.roi >= 0 ? 'text-green-500' : 'text-red-500'}
                          />
                        </div>
                      </div>
                      
                      {profitability.dailyProfit < 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                          <p className="text-sm text-red-800">
                            ⚠️ Esta configuración no es rentable. Los costos de electricidad superan los ingresos.
                          </p>
                        </div>
                      )}
                      
                      {profitability.dailyProfit > 0 && profitability.breakEvenDays > 365 * 2 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Período de recuperación largo. Considera los riesgos de cambios en la dificultad y el precio.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-md p-8 text-center">
                      <p className="text-muted-foreground">
                        Selecciona un minero o configura parámetros personalizados para ver los resultados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Comparación de Mineros</h3>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Minero</TableHead>
                        <TableHead>Hash Rate</TableHead>
                        <TableHead>Consumo</TableHead>
                        <TableHead>Eficiencia</TableHead>
                        <TableHead>Beneficio Mensual</TableHead>
                        <TableHead>Recuperación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {minerComparison.map((miner, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{miner.name}</TableCell>
                          <TableCell>{formatHashRate(miner.hashRate)}</TableCell>
                          <TableCell>{formatPower(miner.powerConsumption)}</TableCell>
                          <TableCell>{miner.efficiency.toFixed(3)} MH/W</TableCell>
                          <TableCell className={miner.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {formatCurrency(miner.monthlyProfit)}
                          </TableCell>
                          <TableCell>
                            {miner.paybackPeriod > 0 ? `${Math.round(miner.paybackPeriod)} días` : 'Nunca'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="h-64 mt-6">
                  <h3 className="text-sm font-medium mb-4">Comparación de Beneficio Mensual</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={minerComparison}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(value), 'Beneficio Mensual']}
                      />
                      <Bar
                        dataKey="monthlyProfit"
                        name="Beneficio Mensual"
                        fill="#8884d8"
                      >
                        {minerComparison.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.monthlyProfit >= 0 ? '#4ade80' : '#f87171'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-xs text-muted-foreground mt-4">
                  <p>
                    Esta comparación se basa en el precio actual de LTC (${ltcPrice.toFixed(2)}) y un costo de electricidad de ${powerCost.toFixed(2)}/kWh.
                    Los resultados pueden variar según las condiciones del mercado y la dificultad de la red.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  valueClassName?: string;
}

function StatCard({ title, value, valueClassName }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border p-3">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className={`text-lg font-bold mt-1 ${valueClassName || ''}`}>{value}</div>
    </div>
  );
}
