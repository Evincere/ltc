import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";
import { HistoricalData } from '@/types/market';
import { calculateFibonacciRetracement } from '@/utils/indicators/fibonacci';

interface FibonacciRetracementProps {
  data: HistoricalData[];
  currentPrice: number;
}

export function FibonacciRetracement({ data, currentPrice }: FibonacciRetracementProps) {
  const fibLevels = calculateFibonacciRetracement(data);
  const currentLevel = Object.entries(fibLevels).find(([_, value]) => 
    Math.abs(value - currentPrice) / value < 0.01
  );

  const chartData = [
    { x: '0%', y: fibLevels.level0 },
    { x: '23.6%', y: fibLevels.level236 },
    { x: '38.2%', y: fibLevels.level382 },
    { x: '50%', y: fibLevels.level500 },
    { x: '61.8%', y: fibLevels.level618 },
    { x: '78.6%', y: fibLevels.level786 },
    { x: '100%', y: fibLevels.level100 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fibonacci Retracement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[300px]">
            <LineChart 
              data={chartData} 
              color="#8884d8"
              height={300}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel 0%</div>
              <div className="text-lg font-semibold">${fibLevels.level0.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel 23.6%</div>
              <div className="text-lg font-semibold">${fibLevels.level236.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel 38.2%</div>
              <div className="text-lg font-semibold">${fibLevels.level382.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel 50%</div>
              <div className="text-lg font-semibold">${fibLevels.level500.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel 61.8%</div>
              <div className="text-lg font-semibold">${fibLevels.level618.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel 78.6%</div>
              <div className="text-lg font-semibold">${fibLevels.level786.toFixed(2)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel 100%</div>
              <div className="text-lg font-semibold">${fibLevels.level100.toFixed(2)}</div>
            </div>
          </div>

          {currentLevel && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground">Nivel Actual</div>
              <div className="text-lg font-semibold">
                ${currentPrice.toFixed(2)} ({currentLevel[0].replace('level', '')}%)
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 