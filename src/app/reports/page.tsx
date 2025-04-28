'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportConfigForm } from '@/components/reports/report-config-form';
import { ReportList } from '@/components/reports/report-list';
import { ReportViewer } from '@/components/reports/report-viewer';
import { CorrelationAnalysis } from '@/components/reports/correlation-analysis';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleReportGenerated = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('view');
  };

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('view');
  };

  const handleCloseViewer = () => {
    setSelectedReportId(null);
    setActiveTab('history');
  };
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema de Reportes</h1>
        <p className="text-muted-foreground">
          Genera y gestiona reportes personalizados
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="generate">Generar Reporte</TabsTrigger>
          <TabsTrigger value="history">Historial de Reportes</TabsTrigger>
          <TabsTrigger value="correlation">Análisis de Correlación</TabsTrigger>
          <TabsTrigger value="view" disabled={!selectedReportId}>Ver Reporte</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ReportConfigForm onReportGenerated={handleReportGenerated} />
            </div>
            <div>
              <div className="bg-muted p-6 rounded-lg h-full">
                <h2 className="text-xl font-semibold mb-4">Información sobre Reportes</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Tipos de Reportes</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Rendimiento:</strong> Análisis del precio y rendimiento de Litecoin</li>
                      <li><strong>Trading:</strong> Resumen de operaciones y estrategias de trading</li>
                      <li><strong>Análisis Fundamental:</strong> Métricas de red, minería y adopción</li>
                      <li><strong>Personalizado:</strong> Combinación de los anteriores según tus necesidades</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Formatos Disponibles</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>PDF:</strong> Documento con formato para visualización e impresión</li>
                      <li><strong>CSV:</strong> Datos tabulares para análisis en hojas de cálculo</li>
                      <li><strong>JSON:</strong> Formato estructurado para integración con otras aplicaciones</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Períodos de Análisis</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Último día:</strong> Análisis de las últimas 24 horas</li>
                      <li><strong>Última semana:</strong> Resumen de los últimos 7 días</li>
                      <li><strong>Último mes:</strong> Análisis de los últimos 30 días</li>
                      <li><strong>Último año:</strong> Visión general del último año</li>
                      <li><strong>Personalizado:</strong> Selecciona un rango de fechas específico</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ReportList onViewReport={handleViewReport} />
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          <CorrelationAnalysis />
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          {selectedReportId && (
            <ReportViewer reportId={selectedReportId} onClose={handleCloseViewer} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
