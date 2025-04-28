import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AdoptionMetrics } from '@/services/adoption-metrics';

interface AdoptionMetricsCardProps {
  metrics: AdoptionMetrics | null;
  isLoading: boolean;
  onRefresh: () => void;
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function AdoptionMetricsCard({ 
  metrics, 
  isLoading, 
  onRefresh, 
  onRemove, 
  onConfigure 
}: AdoptionMetricsCardProps) {
  
  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  const formatLTC = (value: number): string => {
    return `${value.toFixed(2)} LTC`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Métricas de Adopción</CardTitle>
          <CardDescription>
            Análisis de la adopción de Litecoin
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
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
        {isLoading && !metrics ? (
          <div className="flex justify-center items-center py-8">
            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              title="Direcciones Activas"
              value={formatNumber(metrics.activeAddresses)}
              icon={<Icons.users className="h-4 w-4 text-blue-500" />}
            />
            <MetricCard
              title="Nuevas Direcciones"
              value={formatNumber(metrics.newAddresses)}
              icon={<Icons.userPlus className="h-4 w-4 text-green-500" />}
            />
            <MetricCard
              title="Transacciones"
              value={formatNumber(metrics.transactionCount)}
              icon={<Icons.arrowRightLeft className="h-4 w-4 text-purple-500" />}
            />
            <MetricCard
              title="Volumen de Transacciones"
              value={formatNumber(metrics.transactionVolume)}
              icon={<Icons.barChart className="h-4 w-4 text-amber-500" />}
            />
            <MetricCard
              title="Valor Medio de Transacción"
              value={formatLTC(metrics.averageTransactionValue)}
              icon={<Icons.calculator className="h-4 w-4 text-red-500" />}
            />
            <MetricCard
              title="Valor Mediano de Transacción"
              value={formatLTC(metrics.medianTransactionValue)}
              icon={<Icons.calculator className="h-4 w-4 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        )}
        
        {metrics && (
          <div className="text-xs text-muted-foreground text-center mt-4">
            Última actualización: {new Date(metrics.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg border p-3">
      <div className="flex items-center space-x-2">
        {icon}
        <div className="text-xs font-medium text-muted-foreground">{title}</div>
      </div>
      <div className="text-lg font-bold mt-2">{value}</div>
    </div>
  );
}
