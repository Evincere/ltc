import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { ReportConfig, ReportType, ReportFormat, ReportPeriod, reportService } from '@/services/report-service';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReportConfigFormProps {
  onReportGenerated?: (reportId: string) => void;
}

export function ReportConfigForm({ onReportGenerated }: ReportConfigFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    type: 'performance',
    format: 'pdf',
    period: 'month',
    includeCharts: true,
    includeTables: true
  });
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const handleTypeChange = (value: ReportType) => {
    setConfig({ ...config, type: value });
  };
  
  const handleFormatChange = (value: ReportFormat) => {
    setConfig({ ...config, format: value });
  };
  
  const handlePeriodChange = (value: ReportPeriod) => {
    setConfig({ ...config, period: value });
    
    // Limpiar fechas personalizadas si no es período personalizado
    if (value !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
      setConfig({
        ...config,
        period: value,
        customDateRange: undefined
      });
    } else if (startDate && endDate) {
      // Si ya hay fechas seleccionadas, actualizar el rango
      setConfig({
        ...config,
        period: value,
        customDateRange: { startDate, endDate }
      });
    }
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate) {
      setConfig({
        ...config,
        customDateRange: { startDate: date, endDate }
      });
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (startDate && date) {
      setConfig({
        ...config,
        customDateRange: { startDate, endDate: date }
      });
    }
  };
  
  const handleChartsChange = (checked: boolean) => {
    setConfig({ ...config, includeCharts: checked });
  };
  
  const handleTablesChange = (checked: boolean) => {
    setConfig({ ...config, includeTables: checked });
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, customTitle: e.target.value });
  };
  
  const handleGenerateReport = async () => {
    // Validar configuración
    if (config.period === 'custom' && (!startDate || !endDate)) {
      toast.error('Por favor, selecciona un rango de fechas para el período personalizado');
      return;
    }
    
    if (startDate && endDate && startDate > endDate) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const report = await reportService.generateReport(config);
      toast.success(`Reporte "${report.title}" generado correctamente`);
      
      if (onReportGenerated) {
        onReportGenerated(report.id);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Reporte</CardTitle>
        <CardDescription>
          Personaliza y genera un nuevo reporte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Tipo de Reporte</Label>
          <RadioGroup
            value={config.type}
            onValueChange={handleTypeChange}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="performance"
                id="performance"
                className="peer sr-only"
              />
              <Label
                htmlFor="performance"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.lineChart className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Rendimiento</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="trading"
                id="trading"
                className="peer sr-only"
              />
              <Label
                htmlFor="trading"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.arrowRightLeft className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Trading</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="fundamental"
                id="fundamental"
                className="peer sr-only"
              />
              <Label
                htmlFor="fundamental"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.barChart2 className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Análisis Fundamental</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="custom"
                id="custom"
                className="peer sr-only"
              />
              <Label
                htmlFor="custom"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.settings className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Personalizado</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select
              value={config.format}
              onValueChange={handleFormatChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Período</Label>
            <Select
              value={config.period}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Último día</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {config.period === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Icons.calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Icons.calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Título personalizado (opcional)</Label>
          <Input
            placeholder="Título del reporte"
            value={config.customTitle || ''}
            onChange={handleTitleChange}
          />
        </div>
        
        <div className="space-y-4">
          <Label>Opciones adicionales</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="includeCharts" className="cursor-pointer">
                Incluir gráficos
              </Label>
              <Switch
                id="includeCharts"
                checked={config.includeCharts}
                onCheckedChange={handleChartsChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="includeTables" className="cursor-pointer">
                Incluir tablas
              </Label>
              <Switch
                id="includeTables"
                checked={config.includeTables}
                onCheckedChange={handleTablesChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Icons.fileCode className="mr-2 h-4 w-4" />
              Generar Reporte
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
