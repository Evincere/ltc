import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { reportService, ReportResult } from '@/services/report-service';
import { reportDataService, ReportData, ReportSection, ReportChart, ReportTable } from '@/services/report-data-service';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportViewerProps {
  reportId: string;
  onClose?: () => void;
}

export function ReportViewer({ reportId, onClose }: ReportViewerProps) {
  const [report, setReport] = useState<ReportResult | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadReport();
  }, [reportId]);
  
  const loadReport = async () => {
    setIsLoading(true);
    try {
      const reportInfo = reportService.getReportById(reportId);
      if (!reportInfo) {
        toast.error('Reporte no encontrado');
        if (onClose) onClose();
        return;
      }
      
      setReport(reportInfo);
      
      // Simular carga de datos del reporte
      const data = await reportDataService.generateReportData(
        reportInfo.type,
        'month' // Por defecto usamos el último mes
      );
      
      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!report) return;
    
    try {
      reportService.downloadReport(report.id);
      toast.success('Descargando reporte...');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar el reporte');
    }
  };
  
  const renderChart = (chart: ReportChart) => {
    switch (chart.type) {
      case 'line':
        return (
          <div className="h-64 w-full" key={chart.title}>
            <h4 className="text-sm font-medium mb-2">{chart.title}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chart.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.config.xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {chart.config.lines ? (
                  // Múltiples líneas
                  chart.config.lines.map((line: any, index: number) => (
                    <Line
                      key={line.key}
                      type="monotone"
                      dataKey={line.key}
                      name={line.name}
                      stroke={line.color}
                      activeDot={{ r: 8 }}
                    />
                  ))
                ) : (
                  // Una sola línea
                  <Line
                    type="monotone"
                    dataKey={chart.config.yKey}
                    stroke={chart.config.color}
                    activeDot={{ r: 8 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'bar':
        return (
          <div className="h-64 w-full" key={chart.title}>
            <h4 className="text-sm font-medium mb-2">{chart.title}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chart.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.config.xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey={chart.config.yKey}
                  fill={chart.config.color || '#8884d8'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'pie':
        return (
          <div className="h-64 w-full" key={chart.title}>
            <h4 className="text-sm font-medium mb-2">{chart.title}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chart.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={chart.config.valueKey}
                  nameKey={chart.config.nameKey}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chart.data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chart.config.colors ? chart.config.colors[index % chart.config.colors.length] : `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return <div key={chart.title}>Tipo de gráfico no soportado: {chart.type}</div>;
    }
  };
  
  const renderTable = (table: ReportTable) => {
    return (
      <div className="mt-4 mb-6" key={table.title}>
        <h4 className="text-sm font-medium mb-2">{table.title}</h4>
        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {table.headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderSection = (section: ReportSection, index: number) => {
    return (
      <div key={index} className="mb-8">
        <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
        <p className="text-gray-700 mb-4">{section.content}</p>
        
        {section.tables && section.tables.map(table => renderTable(table))}
        
        {section.charts && (
          <div className="mt-4 space-y-6">
            {section.charts.map(chart => renderChart(chart))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{report?.title || 'Cargando reporte...'}</CardTitle>
            <CardDescription>
              {reportData?.timestamp ? `Generado el ${new Date(reportData.timestamp).toLocaleString()}` : ''}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!report}
            >
              <Icons.arrowRight className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <Icons.x className="mr-2 h-4 w-4" />
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Resumen</h3>
              <p>{reportData.summary}</p>
            </div>
            
            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Contenido</TabsTrigger>
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-6 pt-4">
                {reportData.sections.map((section, index) => renderSection(section, index))}
              </TabsContent>
              
              <TabsContent value="preview" className="pt-4">
                <div className="border rounded-md p-6 bg-white">
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-center mb-6">{reportData.title}</h1>
                    <p className="text-gray-600 text-center mb-8">{new Date(reportData.timestamp).toLocaleString()}</p>
                    
                    <div className="bg-gray-100 p-4 rounded-md mb-8">
                      <p className="italic">{reportData.summary}</p>
                    </div>
                    
                    {reportData.sections.map((section, index) => (
                      <div key={index} className="mb-8">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">{section.title}</h2>
                        <p className="mb-4">{section.content}</p>
                        
                        {section.tables && section.tables.map(table => renderTable(table))}
                        
                        {section.charts && (
                          <div className="mt-6 space-y-8">
                            {section.charts.map(chart => renderChart(chart))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudo cargar el reporte</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
