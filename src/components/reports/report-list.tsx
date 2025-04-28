import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { reportService, ReportResult, ReportType, ReportFormat } from '@/services/report-service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportListProps {
  onViewReport?: (reportId: string) => void;
}

export function ReportList({ onViewReport }: ReportListProps) {
  const [reports, setReports] = useState<ReportResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    loadReports();
  }, []);
  
  const loadReports = () => {
    setIsLoading(true);
    try {
      const loadedReports = reportService.getReports();
      setReports(loadedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = (reportId: string) => {
    try {
      reportService.downloadReport(reportId);
      toast.success('Descargando reporte...');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar el reporte');
    }
  };
  
  const handleDelete = (reportId: string) => {
    setReportToDelete(reportId);
  };
  
  const confirmDelete = () => {
    if (!reportToDelete) return;
    
    try {
      reportService.deleteReport(reportToDelete);
      setReports(reports.filter(report => report.id !== reportToDelete));
      toast.success('Reporte eliminado correctamente');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar el reporte');
    } finally {
      setReportToDelete(null);
    }
  };
  
  const handleView = (reportId: string) => {
    if (onViewReport) {
      onViewReport(reportId);
    }
  };
  
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };
  
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  const getTypeLabel = (type: ReportType): string => {
    switch (type) {
      case 'performance':
        return 'Rendimiento';
      case 'trading':
        return 'Trading';
      case 'fundamental':
        return 'Análisis Fundamental';
      case 'custom':
        return 'Personalizado';
      default:
        return type;
    }
  };
  
  const getFormatLabel = (format: ReportFormat): string => {
    return format.toUpperCase();
  };
  
  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'performance':
        return <Icons.lineChart className="h-4 w-4" />;
      case 'trading':
        return <Icons.arrowRightLeft className="h-4 w-4" />;
      case 'fundamental':
        return <Icons.barChart2 className="h-4 w-4" />;
      case 'custom':
        return <Icons.settings className="h-4 w-4" />;
      default:
        return <Icons.fileCode className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Reportes Generados</CardTitle>
            <CardDescription>
              Listado de reportes generados recientemente
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            disabled={isLoading}
          >
            {isLoading ? (
              <Icons.loader className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.refresh className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <Icons.fileCode className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No hay reportes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aún no se ha generado ningún reporte
            </p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(report.type)}
                        <span>{report.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(report.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getFormatLabel(report.format)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{formatSize(report.size)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(report.id)}
                        >
                          <Icons.eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report.id)}
                        >
                          <Icons.arrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <AlertDialog open={reportToDelete !== null} onOpenChange={(open) => !open && setReportToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
