"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { tradingService, RiskParameters } from '@/services/exchange/trading-service';

export function RiskManager() {
  const [riskParams, setRiskParams] = useState<RiskParameters>({
    maxPositionSize: 5,
    stopLossPercentage: 2,
    takeProfitPercentage: 5,
    maxDailyLoss: 10,
    maxOpenTrades: 3
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    loadRiskParameters();
  }, []);

  const loadRiskParameters = () => {
    try {
      const params = tradingService.getRiskParameters();
      setRiskParams(params);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading risk parameters:', error);
      toast.error('Error al cargar los parámetros de riesgo');
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    try {
      tradingService.updateRiskParameters(riskParams);
      toast.success('Parámetros de riesgo actualizados correctamente');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving risk parameters:', error);
      toast.error('Error al guardar los parámetros de riesgo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    loadRiskParameters();
  };

  const handleChange = (key: keyof RiskParameters, value: number) => {
    setRiskParams(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const getRiskLevel = (): 'low' | 'medium' | 'high' => {
    const { maxPositionSize, stopLossPercentage, maxDailyLoss } = riskParams;

    if (maxPositionSize <= 3 && stopLossPercentage <= 1 && maxDailyLoss <= 5) {
      return 'low';
    } else if (maxPositionSize <= 10 && stopLossPercentage <= 3 && maxDailyLoss <= 15) {
      return 'medium';
    } else {
      return 'high';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestión de Riesgo</CardTitle>
        <CardDescription>
          Configura los parámetros de gestión de riesgo para el trading automatizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert
          variant={
            getRiskLevel() === 'low'
              ? 'default'
              : getRiskLevel() === 'medium'
              ? 'default'
              : 'destructive'
          }
          className={
            getRiskLevel() === 'low'
              ? 'bg-green-50 text-green-800 border-green-200'
              : getRiskLevel() === 'medium'
              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
              : ''
          }
        >
          <Icons.info className="h-4 w-4" />
          <AlertTitle>
            Nivel de Riesgo: {getRiskLevel() === 'low' ? 'Bajo' : getRiskLevel() === 'medium' ? 'Medio' : 'Alto'}
          </AlertTitle>
          <AlertDescription>
            {getRiskLevel() === 'low'
              ? 'Tu configuración actual tiene un nivel de riesgo bajo, adecuado para estrategias conservadoras.'
              : getRiskLevel() === 'medium'
              ? 'Tu configuración actual tiene un nivel de riesgo medio, equilibrando rentabilidad y seguridad.'
              : 'Tu configuración actual tiene un nivel de riesgo alto. Considera ajustar los parámetros para reducir el riesgo.'}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Tamaño Máximo de Posición (%)</Label>
              <span className="text-sm">{riskParams.maxPositionSize}%</span>
            </div>
            <Slider
              value={[riskParams.maxPositionSize]}
              min={1}
              max={25}
              step={1}
              onValueChange={(value) => handleChange('maxPositionSize', value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Porcentaje máximo del balance que se puede invertir en una sola operación
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Stop Loss (%)</Label>
              <span className="text-sm">{riskParams.stopLossPercentage}%</span>
            </div>
            <Slider
              value={[riskParams.stopLossPercentage]}
              min={0.5}
              max={10}
              step={0.5}
              onValueChange={(value) => handleChange('stopLossPercentage', value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Porcentaje de pérdida que activará un stop loss automático
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Take Profit (%)</Label>
              <span className="text-sm">{riskParams.takeProfitPercentage}%</span>
            </div>
            <Slider
              value={[riskParams.takeProfitPercentage]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => handleChange('takeProfitPercentage', value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Porcentaje de ganancia que activará una toma de beneficios automática
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Pérdida Diaria Máxima (%)</Label>
              <span className="text-sm">{riskParams.maxDailyLoss}%</span>
            </div>
            <Slider
              value={[riskParams.maxDailyLoss]}
              min={1}
              max={25}
              step={1}
              onValueChange={(value) => handleChange('maxDailyLoss', value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Porcentaje máximo de pérdida diaria permitido antes de detener el trading
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Operaciones Abiertas Máximas</Label>
              <span className="text-sm">{riskParams.maxOpenTrades}</span>
            </div>
            <Slider
              value={[riskParams.maxOpenTrades]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => handleChange('maxOpenTrades', value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Número máximo de operaciones abiertas simultáneamente
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || !hasChanges}
          >
            Restablecer
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
