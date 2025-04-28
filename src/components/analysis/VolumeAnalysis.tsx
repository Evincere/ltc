import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricalData } from '@/types/market';
import { volumeAnalysisService } from '@/services/volumeAnalysisService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VolumeAnalysisProps {
  data: HistoricalData[];
}

export function VolumeAnalysis({ data }: VolumeAnalysisProps) {
  const metrics = volumeAnalysisService.calculateVolumeMetrics(data);
  
  const chartData = data.map((item, index) => ({
    timestamp: new Date(item.timestamp).toLocaleDateString(),
    volume: item.volume,
    obv: metrics.obv[index],
    ad: metrics.accumulationDistribution[index],
    relativeVolume: metrics.volumeRelative[index]
  }));

  const latestDivergence = metrics.volumeDivergences[metrics.volumeDivergences.length - 1];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Volumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="volume"
                  stroke="#8884d8"
                  name="Volumen"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="obv"
                  stroke="#82ca9d"
                  name="OBV"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ad"
                  stroke="#ffc658"
                  name="A/D"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Volumen Relativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="relativeVolume"
                    stroke="#ff7300"
                    name="Volumen Relativo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Divergencias de Volumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Divergencia Alcista:</span>
                <span className={`font-bold ${latestDivergence.bullish ? 'text-green-500' : 'text-gray-500'}`}>
                  {latestDivergence.bullish ? 'Detectada' : 'No detectada'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Divergencia Bajista:</span>
                <span className={`font-bold ${latestDivergence.bearish ? 'text-red-500' : 'text-gray-500'}`}>
                  {latestDivergence.bearish ? 'Detectada' : 'No detectada'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fuerza de la Divergencia:</span>
                <span className="font-bold">
                  {latestDivergence.strength.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 