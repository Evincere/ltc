import React from "react"
import { WidgetBase } from "./widget-base"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface AlertsWidgetProps {
  currentPrice: number
  onRemove?: () => void
  onConfigure?: () => void
}

export function AlertsWidget({
  currentPrice,
  onRemove,
  onConfigure
}: AlertsWidgetProps) {
  return (
    <WidgetBase
      title="Alertas de Precio"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Precio Actual</p>
          <p className="font-medium">${isNaN(currentPrice) ? '0.00' : currentPrice.toFixed(2)}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icons.arrowUp className="h-4 w-4 text-green-500" />
              <Label htmlFor="upper-alert" className="text-sm">Alerta Superior</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="upper-alert"
                type="number"
                className="w-20 h-8"
                defaultValue={isNaN(currentPrice) ? '0.00' : (currentPrice * 1.05).toFixed(2)}
              />
              <Switch defaultChecked id="upper-alert-active" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icons.arrowDown className="h-4 w-4 text-red-500" />
              <Label htmlFor="lower-alert" className="text-sm">Alerta Inferior</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="lower-alert"
                type="number"
                className="w-20 h-8"
                defaultValue={isNaN(currentPrice) ? '0.00' : (currentPrice * 0.95).toFixed(2)}
              />
              <Switch defaultChecked id="lower-alert-active" />
            </div>
          </div>
        </div>

        <Button className="w-full" size="sm">
          <Icons.bell className="mr-2 h-4 w-4" />
          Añadir Nueva Alerta
        </Button>
      </div>
    </WidgetBase>
  )
}
