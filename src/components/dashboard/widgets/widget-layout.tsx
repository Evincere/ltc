import React, { useState } from "react"
import { WidgetBase } from "./widget-base"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface WidgetLayoutProps {
  children: React.ReactNode
  className?: string
  onAddWidget?: () => void
}

export function WidgetLayout({
  children,
  className,
  onAddWidget
}: WidgetLayoutProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Mi Dashboard</h2>
        <div className="flex items-center space-x-2">
          {onAddWidget && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddWidget}
            >
              <Icons.plus className="h-4 w-4 mr-2" />
              Agregar Widget
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Icons.edit className="h-4 w-4 mr-2" />
            {isEditing ? "Guardar" : "Editar"}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === WidgetBase) {
            return React.cloneElement(child, {
              isDraggable: isEditing,
              onRemove: isEditing ? child.props.onRemove : undefined,
              onConfigure: isEditing ? child.props.onConfigure : undefined
            })
          }
          return child
        })}
      </div>
    </div>
  )
} 