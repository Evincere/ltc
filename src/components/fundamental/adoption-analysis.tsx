import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";

interface AdoptionAnalysisProps {
  analysis: {
    trend: 'increasing' | 'stable' | 'decreasing';
    growthRate: number;
    keyInsights: string[];
  } | null;
  isLoading: boolean;
}

export function AdoptionAnalysis({ analysis, isLoading }: AdoptionAnalysisProps) {
  
  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return <Icons.trendingUp className="h-5 w-5 text-green-500" />;
      case 'stable':
        return <Icons.minus className="h-5 w-5 text-yellow-500" />;
      case 'decreasing':
        return <Icons.trendingDown className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getTrendTitle = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return 'Tendencia Creciente';
      case 'stable':
        return 'Tendencia Estable';
      case 'decreasing':
        return 'Tendencia Decreciente';
    }
  };
  
  const getTrendDescription = (trend: 'increasing' | 'stable' | 'decreasing', growthRate: number) => {
    switch (trend) {
      case 'increasing':
        return `La adopción de Litecoin está creciendo a un ritmo del ${growthRate.toFixed(1)}%, mostrando un interés creciente en la red.`;
      case 'stable':
        return `La adopción de Litecoin se mantiene estable con un cambio del ${growthRate.toFixed(1)}%, indicando una base de usuarios consistente.`;
      case 'decreasing':
        return `La adopción de Litecoin está disminuyendo a un ritmo del ${Math.abs(growthRate).toFixed(1)}%, lo que podría indicar desafíos en la adopción.`;
    }
  };
  
  const getTrendColor = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return 'bg-green-50 border-green-200';
      case 'stable':
        return 'bg-yellow-50 border-yellow-200';
      case 'decreasing':
        return 'bg-red-50 border-red-200';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análisis de Adopción</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <Alert className={getTrendColor(analysis.trend)}>
              <div className="flex items-center space-x-2">
                {getTrendIcon(analysis.trend)}
                <AlertTitle>{getTrendTitle(analysis.trend)}</AlertTitle>
              </div>
              <AlertDescription>
                {getTrendDescription(analysis.trend, analysis.growthRate)}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Insights Clave</h3>
              <ul className="space-y-2">
                {analysis.keyInsights.map((insight, index) => (
                  <li key={index} className="bg-card rounded-md border p-3 text-sm">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-xs text-muted-foreground mt-4">
              <p>
                Este análisis se basa en las tendencias de los últimos 12 meses, considerando métricas como direcciones activas,
                volumen de transacciones y nuevos usuarios. Los insights son generados automáticamente y no constituyen asesoramiento financiero.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay análisis disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
