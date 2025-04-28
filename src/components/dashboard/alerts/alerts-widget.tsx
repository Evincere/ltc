"use client";

import React, { useState, useEffect } from "react"
import { WidgetBase } from "../widgets/widget-base"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { AlertConfig, AlertConfig as AlertConfigType } from "./alert-config"
import { AlertList } from "./alert-list"
import { AlertConfig as AlertConfigComponent } from "./alert-config"
import { notificationService } from "@/services/notifications"
import { technicalIndicatorsService } from "@/services/technical-indicators"
import { marketDataService } from "@/services/market-data"
import { patternRecognitionService } from "@/services/pattern-recognition"

interface AlertsWidgetProps {
  currentPrice: number
  onRemove?: () => void
  onConfigure?: () => void
}

export function AlertsWidget({ currentPrice, onRemove, onConfigure }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<AlertConfigType[]>([])
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [editingAlert, setEditingAlert] = useState<AlertConfigType | null>(null)

  useEffect(() => {
    // Verificar alertas cada 5 segundos
    const interval = setInterval(() => {
      alerts.forEach(alert => {
        if (alert.isActive) {
          let shouldTrigger = false;

          switch (alert.alertType) {
            case "price":
              // Alertas de precio
              if (alert.price !== undefined && alert.type) {
                shouldTrigger = alert.type === "above"
                  ? currentPrice > alert.price
                  : currentPrice < alert.price;
              }
              break;

            case "indicator":
              // Alertas de indicadores técnicos
              if (alert.indicator) {
                shouldTrigger = technicalIndicatorsService.checkIndicatorCondition(
                  alert.indicator.name,
                  alert.indicator.condition,
                  alert.indicator.value
                );
              }
              break;

            case "volume":
              // Alertas de volumen
              if (alert.volume) {
                const volumeData = marketDataService.getCurrentData();

                if (volumeData) {
                  if (alert.volume.condition === "above") {
                    shouldTrigger = volumeData.volume > alert.volume.value;
                  } else if (alert.volume.condition === "below") {
                    shouldTrigger = volumeData.volume < alert.volume.value;
                  } else {
                    // Para increase/decrease, verificar el cambio porcentual
                    const volumeChange = marketDataService.getVolumeChange('1h');

                    if (alert.volume.condition === "increase" && alert.volume.percentChange) {
                      shouldTrigger = volumeChange > alert.volume.percentChange;
                    } else if (alert.volume.condition === "decrease" && alert.volume.percentChange) {
                      shouldTrigger = volumeChange < -alert.volume.percentChange;
                    }
                  }
                }
              }
              break;

            case "pattern":
              // Alertas de patrones
              if (alert.pattern) {
                shouldTrigger = patternRecognitionService.checkForPattern(
                  alert.pattern.name,
                  alert.pattern.timeframe
                );
              }
              break;
          }

          if (shouldTrigger) {
            notificationService.sendAlert(alert);

            // Si la alerta tiene fecha de expiración y ya se activó, desactivarla
            if (alert.expiresAt) {
              handleToggleAlert(alert.id);
            }
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [alerts, currentPrice]);

  const handleSaveAlert = (alert: AlertConfigType) => {
    if (editingAlert) {
      setAlerts(alerts.map(a => a.id === alert.id ? alert : a))
      setEditingAlert(null)
    } else {
      setAlerts([...alerts, alert])
    }
    setIsConfiguring(false)
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }

  const handleEditAlert = (alert: AlertConfigType) => {
    setEditingAlert(alert)
    setIsConfiguring(true)
  }

  return (
    <WidgetBase
      title="Sistema de Alertas"
      onRemove={onRemove}
      onConfigure={onConfigure}
    >
      <div className="space-y-4">
        {isConfiguring ? (
          <AlertConfigComponent
            currentPrice={currentPrice}
            onSave={handleSaveAlert}
            onCancel={() => {
              setIsConfiguring(false)
              setEditingAlert(null)
            }}
          />
        ) : (
          <>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsConfiguring(true)}
                className="flex items-center space-x-2"
              >
                <Icons.plus className="h-4 w-4" />
                <span>Nueva Alerta</span>
              </Button>
            </div>
            <AlertList
              alerts={alerts}
              onEdit={handleEditAlert}
              onDelete={handleDeleteAlert}
              onToggle={handleToggleAlert}
            />
          </>
        )}
      </div>
    </WidgetBase>
  )
}