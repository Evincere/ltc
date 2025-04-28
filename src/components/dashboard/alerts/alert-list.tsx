import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { AlertConfig } from "./alert-config"
import { cn } from "@/lib/utils"

interface AlertListProps {
  alerts: AlertConfig[]
  onEdit: (alert: AlertConfig) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function AlertList({ alerts, onEdit, onDelete, onToggle }: AlertListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Activas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No hay alertas configuradas
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  {/* Icono según el tipo de alerta */}
                  <div className="flex items-center space-x-2">
                    {alert.alertType === "price" && (
                      <>
                        <Icons.dollarSign className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {alert.type === "above" ? "Precio por encima de" : "Precio por debajo de"}
                        </span>
                        <span className="font-bold">${alert.price?.toFixed(2)}</span>
                      </>
                    )}

                    {alert.alertType === "indicator" && alert.indicator && (
                      <>
                        <Icons.lineChart className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">
                          {alert.indicator.name.toUpperCase()}
                          {alert.indicator.condition === "above" && " por encima de "}
                          {alert.indicator.condition === "below" && " por debajo de "}
                          {alert.indicator.condition === "cross-above" && " cruza hacia arriba "}
                          {alert.indicator.condition === "cross-below" && " cruza hacia abajo "}
                          <span className="font-bold">{alert.indicator.value}</span>
                        </span>
                      </>
                    )}

                    {alert.alertType === "volume" && alert.volume && (
                      <>
                        <Icons.barChart className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          Volumen
                          {alert.volume.condition === "above" && " por encima de "}
                          {alert.volume.condition === "below" && " por debajo de "}
                          {alert.volume.condition === "increase" && " aumenta "}
                          {alert.volume.condition === "decrease" && " disminuye "}
                          <span className="font-bold">
                            {alert.volume.condition === "above" || alert.volume.condition === "below"
                              ? `$${alert.volume.value.toLocaleString()}`
                              : `${alert.volume.percentChange}%`}
                          </span>
                        </span>
                      </>
                    )}

                    {alert.alertType === "pattern" && alert.pattern && (
                      <>
                        <Icons.candlestickChart className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">
                          Patrón
                          <span className="font-bold">
                            {alert.pattern.name === "doji" && " Doji"}
                            {alert.pattern.name === "hammer" && " Hammer"}
                            {alert.pattern.name === "engulfing" && " Engulfing"}
                            {alert.pattern.name === "morning-star" && " Morning Star"}
                            {alert.pattern.name === "evening-star" && " Evening Star"}
                          </span>
                          {" en timeframe "}
                          <span className="font-bold">{alert.pattern.timeframe}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Información de notificación */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {alert.notificationType === "email" && <Icons.mail className="h-4 w-4" />}
                    {alert.notificationType === "push" && <Icons.bell className="h-4 w-4" />}
                    {alert.notificationType === "both" && <Icons.bell className="h-4 w-4" />}
                    <span>
                      {alert.notificationType === "email" && "Email"}
                      {alert.notificationType === "push" && "Notificación Push"}
                      {alert.notificationType === "both" && "Email y Push"}
                    </span>

                    {alert.expiresAt && (
                      <>
                        <span className="mx-1">•</span>
                        <span>Expira: {new Date(alert.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggle(alert.id)}
                  >
                    <Icons.power
                      className={cn(
                        "h-4 w-4",
                        alert.isActive ? "text-green-500" : "text-red-500"
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(alert)}
                  >
                    <Icons.edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(alert.id)}
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}