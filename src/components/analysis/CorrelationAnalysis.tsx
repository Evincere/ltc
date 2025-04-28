"use client";

import React, { useEffect, useState } from 'react';
import { HistoricalData } from '@/types/market';
import { calculateCorrelations } from '@/services/correlationService';
import { useMarketData } from '@/hooks/useMarketData';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AssetSelector } from './AssetSelector';
import { Icons } from '@/components/icons';
import { WidgetBase } from '@/components/dashboard/widgets/widget-base';

interface CorrelationAnalysisProps {
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function CorrelationAnalysis({ onRemove, onConfigure }: CorrelationAnalysisProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [correlations, setCorrelations] = useState<Array<{
    asset: string;
    correlation: number;
    pValue: number;
    significance: 'high' | 'medium' | 'low';
  }>>([]);
  const [loading, setLoading] = useState(false);
  const { historicalData } = useMarketData();

  useEffect(() => {
    const fetchCorrelations = async () => {
      if (!historicalData || selectedAssets.length === 0) return;

      setLoading(true);
      try {
        // Aquí deberías obtener los datos históricos de los otros activos
        // Por ahora usamos datos de ejemplo
        const otherAssetsData: { [key: string]: HistoricalData[] } = {};
        for (const asset of selectedAssets) {
          otherAssetsData[asset] = historicalData; // Reemplazar con datos reales
        }

        const results = await calculateCorrelations(historicalData, otherAssetsData);
        setCorrelations(results);
      } catch (error) {
        console.error('Error al calcular correlaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCorrelations();
  }, [historicalData, selectedAssets]);

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <WidgetBase
      title="Análisis de Correlación"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        <AssetSelector
          selectedAssets={selectedAssets}
          onSelectionChange={setSelectedAssets}
        />

        {loading ? (
          <div className="text-center py-4">Cargando análisis de correlación...</div>
        ) : correlations.length === 0 ? (
          <div className="text-center py-4">Selecciona activos para analizar correlaciones</div>
        ) : (
          <div className="space-y-4">
            {correlations.map((result) => (
              <div key={result.asset} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.asset}</span>
                  <Badge className={getSignificanceColor(result.significance)}>
                    {result.significance === 'high' ? 'Alta' :
                     result.significance === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={Math.abs(result.correlation) * 100}
                    className="h-2"
                  />
                  <span className="text-sm text-muted-foreground">
                    {result.correlation.toFixed(3)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  p-value: {result.pValue.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WidgetBase>
  );
}