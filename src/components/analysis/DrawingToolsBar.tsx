import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { drawingToolsService, DrawingTool } from '@/services/drawingToolsService';

interface DrawingToolsBarProps {
  chartId: string;
  onToolSelected?: (tool: DrawingTool) => void;
  onClear?: () => void;
}

export function DrawingToolsBar({
  chartId,
  onToolSelected,
  onClear
}: DrawingToolsBarProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolClick = (toolType: DrawingTool['type']) => {
    setActiveTool(toolType);
  };

  const handleClear = () => {
    drawingToolsService.clearDrawings(chartId);
    if (onClear) onClear();
  };

  const tools = [
    {
      type: 'line' as const,
      icon: <Icons.line className="h-4 w-4" />,
      label: 'Línea de tendencia'
    },
    {
      type: 'fibonacci' as const,
      icon: <Icons.fibonacci className="h-4 w-4" />,
      label: 'Retroceso Fibonacci'
    },
    {
      type: 'channel' as const,
      icon: <Icons.channel className="h-4 w-4" />,
      label: 'Canal'
    },
    {
      type: 'rectangle' as const,
      icon: <Icons.rectangle className="h-4 w-4" />,
      label: 'Rectángulo'
    }
  ];

  return (
    <div className="flex items-center space-x-2 p-2 bg-background border rounded-lg">
      {tools.map(tool => (
        <Button
          key={tool.type}
          variant={activeTool === tool.type ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleToolClick(tool.type)}
          title={tool.label}
        >
          {tool.icon}
        </Button>
      ))}
      <div className="flex-grow" />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClear}
        title="Limpiar dibujos"
      >
        <Icons.trash className="h-4 w-4" />
      </Button>
    </div>
  );
} 