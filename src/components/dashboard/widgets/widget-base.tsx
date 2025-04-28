import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface WidgetBaseProps {
  title: string
  children: React.ReactNode
  className?: string
  onRemove?: () => void
  onConfigure?: () => void
  isDraggable?: boolean
}

export function WidgetBase({
  title,
  children,
  className,
  onRemove,
  onConfigure,
  isDraggable = true
}: WidgetBaseProps) {
  return (
    <Card className={cn(
      "relative group",
      isDraggable && "cursor-move",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onConfigure && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onConfigure}
            >
              <Icons.settings className="h-4 w-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onRemove}
            >
              <Icons.x className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}