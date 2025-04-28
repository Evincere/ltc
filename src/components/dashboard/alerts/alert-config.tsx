import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface AlertConfigProps {
  currentPrice: number
  onSave: (alert: AlertConfig) => void
  onCancel: () => void
}

export interface AlertConfig {
  id: string
  alertType: "price" | "indicator" | "volume" | "pattern"
  price?: number
  type?: "above" | "below"
  indicator?: {
    name: "rsi" | "macd" | "bollinger" | "fibonacci"
    value: number
    condition: "above" | "below" | "cross-above" | "cross-below"
  }
  volume?: {
    value: number
    condition: "increase" | "decrease" | "above" | "below"
    percentChange?: number
  }
  pattern?: {
    name: "doji" | "hammer" | "engulfing" | "morning-star" | "evening-star"
    timeframe: "1h" | "4h" | "1d"
  }
  isActive: boolean
  notificationType: "email" | "push" | "both"
  expiresAt?: Date | null
}

export function AlertConfig({ currentPrice, onSave, onCancel }: AlertConfigProps) {
  // Estado general
  const [alertType, setAlertType] = useState<"price" | "indicator" | "volume" | "pattern">("price")
  const [isActive, setIsActive] = useState<boolean>(true)
  const [notificationType, setNotificationType] = useState<"email" | "push" | "both">("push")
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  // Estado para alertas de precio
  const [price, setPrice] = useState<number>(currentPrice)
  const [priceType, setPriceType] = useState<"above" | "below">("above")

  // Estado para alertas de indicadores
  const [indicator, setIndicator] = useState<{
    name: "rsi" | "macd" | "bollinger" | "fibonacci";
    value: number;
    condition: "above" | "below" | "cross-above" | "cross-below";
  }>({
    name: "rsi",
    value: 70,
    condition: "above"
  })

  // Estado para alertas de volumen
  const [volume, setVolume] = useState<{
    value: number;
    condition: "increase" | "decrease" | "above" | "below";
    percentChange?: number;
  }>({
    value: 1000000,
    condition: "above",
    percentChange: 20
  })

  // Estado para alertas de patrones
  const [pattern, setPattern] = useState<{
    name: "doji" | "hammer" | "engulfing" | "morning-star" | "evening-star";
    timeframe: "1h" | "4h" | "1d";
  }>({
    name: "engulfing",
    timeframe: "1d"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const baseAlert = {
      id: Math.random().toString(36).substr(2, 9),
      alertType,
      isActive,
      notificationType,
      expiresAt
    }

    let alertConfig: AlertConfig;

    switch (alertType) {
      case "price":
        alertConfig = {
          ...baseAlert,
          price,
          type: priceType
        }
        break;

      case "indicator":
        alertConfig = {
          ...baseAlert,
          indicator: { ...indicator }
        }
        break;

      case "volume":
        alertConfig = {
          ...baseAlert,
          volume: { ...volume }
        }
        break;

      case "pattern":
        alertConfig = {
          ...baseAlert,
          pattern: { ...pattern }
        }
        break;

      default:
        alertConfig = {
          ...baseAlert,
          alertType: "price",
          price,
          type: priceType
        }
    }

    onSave(alertConfig)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Configurar Alerta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de tipo de alerta */}
          <div className="space-y-2">
            <Label>Categoría de Alerta</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={alertType === "price" ? "default" : "outline"}
                onClick={() => setAlertType("price")}
                className="w-full"
              >
                <Icons.dollarSign className="h-4 w-4 mr-2" />
                Precio
              </Button>
              <Button
                type="button"
                variant={alertType === "indicator" ? "default" : "outline"}
                onClick={() => setAlertType("indicator")}
                className="w-full"
              >
                <Icons.lineChart className="h-4 w-4 mr-2" />
                Indicador
              </Button>
              <Button
                type="button"
                variant={alertType === "volume" ? "default" : "outline"}
                onClick={() => setAlertType("volume")}
                className="w-full"
              >
                <Icons.barChart className="h-4 w-4 mr-2" />
                Volumen
              </Button>
              <Button
                type="button"
                variant={alertType === "pattern" ? "default" : "outline"}
                onClick={() => setAlertType("pattern")}
                className="w-full"
              >
                <Icons.candlestickChart className="h-4 w-4 mr-2" />
                Patrón
              </Button>
            </div>
          </div>

          {/* Configuración específica según el tipo de alerta */}
          {alertType === "price" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="price">Precio de Alerta</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    step="0.01"
                    min="0"
                  />
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Condición</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant={priceType === "above" ? "default" : "outline"}
                    onClick={() => setPriceType("above")}
                  >
                    Por encima
                  </Button>
                  <Button
                    type="button"
                    variant={priceType === "below" ? "default" : "outline"}
                    onClick={() => setPriceType("below")}
                  >
                    Por debajo
                  </Button>
                </div>
              </div>
            </>
          )}

          {alertType === "indicator" && (
            <>
              <div className="space-y-2">
                <Label>Indicador</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={indicator.name === "rsi" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, name: "rsi"})}
                    className="w-full"
                  >
                    RSI
                  </Button>
                  <Button
                    type="button"
                    variant={indicator.name === "macd" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, name: "macd"})}
                    className="w-full"
                  >
                    MACD
                  </Button>
                  <Button
                    type="button"
                    variant={indicator.name === "bollinger" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, name: "bollinger"})}
                    className="w-full"
                  >
                    Bollinger
                  </Button>
                  <Button
                    type="button"
                    variant={indicator.name === "fibonacci" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, name: "fibonacci"})}
                    className="w-full"
                  >
                    Fibonacci
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={indicator.value}
                    onChange={(e) => setIndicator({...indicator, value: parseFloat(e.target.value)})}
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">
                    {indicator.name === "rsi" ? "0-100" :
                     indicator.name === "macd" ? "Valor" :
                     indicator.name === "bollinger" ? "Desviación" :
                     "Nivel"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Condición</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={indicator.condition === "above" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, condition: "above"})}
                    className="w-full"
                  >
                    Por encima
                  </Button>
                  <Button
                    type="button"
                    variant={indicator.condition === "below" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, condition: "below"})}
                    className="w-full"
                  >
                    Por debajo
                  </Button>
                  <Button
                    type="button"
                    variant={indicator.condition === "cross-above" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, condition: "cross-above"})}
                    className="w-full"
                  >
                    Cruza hacia arriba
                  </Button>
                  <Button
                    type="button"
                    variant={indicator.condition === "cross-below" ? "default" : "outline"}
                    onClick={() => setIndicator({...indicator, condition: "cross-below"})}
                    className="w-full"
                  >
                    Cruza hacia abajo
                  </Button>
                </div>
              </div>
            </>
          )}

          {alertType === "volume" && (
            <>
              <div className="space-y-2">
                <Label>Condición</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={volume.condition === "above" ? "default" : "outline"}
                    onClick={() => setVolume({...volume, condition: "above"})}
                    className="w-full"
                  >
                    Por encima de
                  </Button>
                  <Button
                    type="button"
                    variant={volume.condition === "below" ? "default" : "outline"}
                    onClick={() => setVolume({...volume, condition: "below"})}
                    className="w-full"
                  >
                    Por debajo de
                  </Button>
                  <Button
                    type="button"
                    variant={volume.condition === "increase" ? "default" : "outline"}
                    onClick={() => setVolume({...volume, condition: "increase"})}
                    className="w-full"
                  >
                    Aumenta
                  </Button>
                  <Button
                    type="button"
                    variant={volume.condition === "decrease" ? "default" : "outline"}
                    onClick={() => setVolume({...volume, condition: "decrease"})}
                    className="w-full"
                  >
                    Disminuye
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={volume.value}
                    onChange={(e) => setVolume({...volume, value: parseFloat(e.target.value)})}
                    step="1000"
                    min="0"
                  />
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
              </div>

              {(volume.condition === "increase" || volume.condition === "decrease") && (
                <div className="space-y-2">
                  <Label>Cambio Porcentual</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={volume.percentChange || 0}
                      onChange={(e) => setVolume({...volume, percentChange: parseFloat(e.target.value)})}
                      step="1"
                      min="0"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              )}
            </>
          )}

          {alertType === "pattern" && (
            <>
              <div className="space-y-2">
                <Label>Patrón</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={pattern.name === "doji" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, name: "doji"})}
                    className="w-full"
                  >
                    Doji
                  </Button>
                  <Button
                    type="button"
                    variant={pattern.name === "hammer" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, name: "hammer"})}
                    className="w-full"
                  >
                    Hammer
                  </Button>
                  <Button
                    type="button"
                    variant={pattern.name === "engulfing" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, name: "engulfing"})}
                    className="w-full"
                  >
                    Engulfing
                  </Button>
                  <Button
                    type="button"
                    variant={pattern.name === "morning-star" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, name: "morning-star"})}
                    className="w-full"
                  >
                    Morning Star
                  </Button>
                  <Button
                    type="button"
                    variant={pattern.name === "evening-star" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, name: "evening-star"})}
                    className="w-full"
                  >
                    Evening Star
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timeframe</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant={pattern.timeframe === "1h" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, timeframe: "1h"})}
                  >
                    1 hora
                  </Button>
                  <Button
                    type="button"
                    variant={pattern.timeframe === "4h" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, timeframe: "4h"})}
                  >
                    4 horas
                  </Button>
                  <Button
                    type="button"
                    variant={pattern.timeframe === "1d" ? "default" : "outline"}
                    onClick={() => setPattern({...pattern, timeframe: "1d"})}
                  >
                    1 día
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Configuración común para todos los tipos de alertas */}
          <div className="space-y-2">
            <Label>Tipo de Notificación</Label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant={notificationType === "email" ? "default" : "outline"}
                onClick={() => setNotificationType("email")}
              >
                <Icons.mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={notificationType === "push" ? "default" : "outline"}
                onClick={() => setNotificationType("push")}
              >
                <Icons.bell className="h-4 w-4 mr-2" />
                Push
              </Button>
              <Button
                type="button"
                variant={notificationType === "both" ? "default" : "outline"}
                onClick={() => setNotificationType("both")}
              >
                <Icons.bell className="h-4 w-4 mr-2" />
                Ambos
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">Activar alerta</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}