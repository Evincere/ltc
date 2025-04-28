import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SocialMetrics as SocialMetricsType } from '@/services/adoption-metrics';

interface SocialMetricsProps {
  data: SocialMetricsType[] | null;
  isLoading: boolean;
}

export function SocialMetrics({ data, isLoading }: SocialMetricsProps) {
  
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };
  
  const getSentimentLabel = (sentiment: number): string => {
    if (sentiment >= 0.7) return 'Muy Positivo';
    if (sentiment >= 0.5) return 'Positivo';
    if (sentiment >= 0.3) return 'Neutral';
    if (sentiment >= 0.1) return 'Negativo';
    return 'Muy Negativo';
  };
  
  const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 0.7) return 'bg-green-500';
    if (sentiment >= 0.5) return 'bg-green-300';
    if (sentiment >= 0.3) return 'bg-yellow-300';
    if (sentiment >= 0.1) return 'bg-red-300';
    return 'bg-red-500';
  };
  
  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Métricas Sociales</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data ? (
          <>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Seguidores</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Sentimiento</TableHead>
                    <TableHead>Cambio 30d</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.platform}</TableCell>
                      <TableCell>{formatNumber(item.followers)}</TableCell>
                      <TableCell>{item.engagement.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getSentimentColor(item.sentiment)}`} />
                          <span>{getSentimentLabel(item.sentiment)}</span>
                        </div>
                      </TableCell>
                      <TableCell className={getChangeColor(item.change30d)}>
                        {item.change30d > 0 ? '+' : ''}{item.change30d.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-4">Engagement por Plataforma</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(1)}%`, 'Engagement']}
                    />
                    <Legend />
                    <Bar
                      dataKey="engagement"
                      name="Engagement"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mt-4">
              <p>
                El engagement representa el porcentaje de seguidores que interactúan activamente con el contenido.
                El sentimiento se mide en una escala de 0 (muy negativo) a 1 (muy positivo) basado en análisis de texto.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay datos sociales disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
