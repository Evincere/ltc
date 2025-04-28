import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdoptionTrend } from '@/services/adoption-metrics';

interface AdoptionTrendsChartProps {
  trends: AdoptionTrend | null;
  isLoading: boolean;
}

export function AdoptionTrendsChart({ trends, isLoading }: AdoptionTrendsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('activeAddresses');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const getChartData = () => {
    if (!trends) return [];
    
    const data = trends[selectedPeriod];
    
    return data.map(item => ({
      date: formatDate(item.timestamp, selectedPeriod),
      [selectedMetric]: item[selectedMetric as keyof typeof item],
    }));
  };
  
  const formatDate = (timestamp: number, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): string => {
    const date = new Date(timestamp);
    
    switch (period) {
      case 'daily':
        return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
      case 'weekly':
        return `Sem ${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString([], { month: 'short' })}`;
      case 'monthly':
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
      case 'yearly':
        return date.getFullYear().toString();
    }
  };
  
  const getMetricName = (metric: string): string => {
    switch (metric) {
      case 'activeAddresses':
        return 'Direcciones Activas';
      case 'newAddresses':
        return 'Nuevas Direcciones';
      case 'transactionCount':
        return 'Transacciones';
      case 'transactionVolume':
        return 'Volumen de Transacciones';
      case 'averageTransactionValue':
        return 'Valor Medio de Transacción';
      case 'medianTransactionValue':
        return 'Valor Mediano de Transacción';
      default:
        return metric;
    }
  };
  
  const formatTooltipValue = (value: number, metric: string): string => {
    if (metric === 'averageTransactionValue' || metric === 'medianTransactionValue') {
      return `${value.toFixed(2)} LTC`;
    }
    return value.toLocaleString();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tendencias de Adopción</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : trends ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activeAddresses">Direcciones Activas</SelectItem>
                    <SelectItem value="newAddresses">Nuevas Direcciones</SelectItem>
                    <SelectItem value="transactionCount">Transacciones</SelectItem>
                    <SelectItem value="transactionVolume">Volumen de Transacciones</SelectItem>
                    <SelectItem value="averageTransactionValue">Valor Medio de Transacción</SelectItem>
                    <SelectItem value="medianTransactionValue">Valor Mediano de Transacción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('daily')}
                >
                  Diario
                </Button>
                <Button
                  variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('weekly')}
                >
                  Semanal
                </Button>
                <Button
                  variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('monthly')}
                >
                  Mensual
                </Button>
                <Button
                  variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('yearly')}
                >
                  Anual
                </Button>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [
                      formatTooltipValue(value, selectedMetric),
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
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay datos de tendencias disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
