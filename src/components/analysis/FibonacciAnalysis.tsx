import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { HistoricalData } from '@/types/market';
import { calculateFibonacciLevels, identifyFibonacciZones } from '@/services/fibonacciService';

interface FibonacciAnalysisProps {
  historicalData: HistoricalData[];
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function FibonacciAnalysis({
  historicalData,
  onRemove,
  onConfigure
}: FibonacciAnalysisProps) {
  const [levels, setLevels] = useState<ReturnType<typeof calculateFibonacciLevels> | null>(null);
  const [zones, setZones] = useState<ReturnType<typeof identifyFibonacciZones> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (historicalData.length > 0) {
      setIsLoading(true);
      try {
        const fibLevels = calculateFibonacciLevels(historicalData);
        const fibZones = identifyFibonacciZones(historicalData);
        setLevels(fibLevels);
        setZones(fibZones);
      } catch (error) {
        console.error('Error al calcular niveles de Fibonacci:', error);
      }
      setIsLoading(false);
    }
  }, [historicalData]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Análisis de Fibonacci
        </CardTitle>
        <div className="flex items-center space-x-2">
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="p-1 hover:bg-accent rounded-md"
            >
              <Icons.settings className="h-4 w-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-accent rounded-md"
            >
              <Icons.x className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        ) : !levels || !zones ? (
          <div className="text-center text-muted-foreground py-4">
            No hay suficientes datos para calcular los niveles de Fibonacci
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Niveles de Retroceso</h3>
              <div className="space-y-2">
                {levels.retracement.map((level, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge variant="outline" className="w-16">
                      {level.level.toFixed(3)}
                    </Badge>
                    <span className="text-sm">
                      ${level.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Niveles de Extensión</h3>
              <div className="space-y-2">
                {levels.extension.map((level, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge variant="outline" className="w-16">
                      {level.level.toFixed(3)}
                    </Badge>
                    <span className="text-sm">
                      ${level.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Zonas Clave</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-muted-foreground mb-1">Soporte</h4>
                  <div className="space-y-1">
                    {zones.supportZones.map((zone, index) => (
                      <div key={index} className="text-sm">
                        ${zone.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground mb-1">Resistencia</h4>
                  <div className="space-y-1">
                    {zones.resistanceZones.map((zone, index) => (
                      <div key={index} className="text-sm">
                        ${zone.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 