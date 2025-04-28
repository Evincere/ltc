import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";

interface IndicatorData {
  name: string;
  value: number;
  signal: "buy" | "sell" | "neutral";
  strength: number;
}

interface IndicatorsWidgetProps {
  indicators: IndicatorData[];
  onRemove?: () => void;
  onConfigure?: () => void;
}

export function IndicatorsWidget({ indicators, onRemove, onConfigure }: IndicatorsWidgetProps) {
  const getSignalColor = (signal: "buy" | "sell" | "neutral"): string => {
    switch (signal) {
      case "buy":
        return "bg-green-500";
      case "sell":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSignalText = (signal: "buy" | "sell" | "neutral"): string => {
    switch (signal) {
      case "buy":
        return "Compra";
      case "sell":
        return "Venta";
      default:
        return "Neutral";
    }
  };

  const formatValue = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Indicadores Técnicos</CardTitle>
          <CardDescription>
            Análisis técnico de Litecoin
          </CardDescription>
        </div>
        <div className="flex space-x-2">
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
        <div className="space-y-4">
          {indicators.map((indicator, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{indicator.name}</div>
                <Badge className={getSignalColor(indicator.signal)}>
                  {getSignalText(indicator.signal)}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Valor: {formatValue(indicator.value)}</span>
                <span>Fuerza: {indicator.strength.toFixed(0)}%</span>
              </div>
              <Progress value={indicator.strength} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
