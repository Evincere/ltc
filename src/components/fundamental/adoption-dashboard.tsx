import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { adoptionMetricsService } from '@/services/adoption-metrics';
import { AdoptionMetricsCard } from './adoption-metrics-card';
import { AdoptionTrendsChart } from './adoption-trends-chart';
import { AdoptionDistribution } from './adoption-distribution';
import { SocialMetrics } from './social-metrics';
import { AdoptionAnalysis } from './adoption-analysis';

export function AdoptionDashboard() {
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [merchantData, setMerchantData] = useState(null);
  const [regionalData, setRegionalData] = useState(null);
  const [socialData, setSocialData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar datos en paralelo
      const [
        metrics,
        trendData,
        merchantAdoption,
        regionalAdoption,
        socialMetrics,
        adoptionAnalysis
      ] = await Promise.all([
        adoptionMetricsService.getCurrentMetrics(),
        adoptionMetricsService.getAdoptionTrends(),
        adoptionMetricsService.getMerchantAdoption(),
        adoptionMetricsService.getRegionalAdoption(),
        adoptionMetricsService.getSocialMetrics(),
        adoptionMetricsService.analyzeAdoptionTrend()
      ]);
      
      setCurrentMetrics(metrics);
      setTrends(trendData);
      setMerchantData(merchantAdoption);
      setRegionalData(regionalAdoption);
      setSocialData(socialMetrics);
      setAnalysis(adoptionAnalysis);
      
    } catch (error) {
      console.error('Error loading adoption data:', error);
      toast.error('Error al cargar datos de adopción');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
    toast.success('Datos actualizados');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análisis de Adopción</h2>
        <Button onClick={handleRefresh} disabled={isLoading}>
          Actualizar Datos
        </Button>
      </div>
      
      <AdoptionMetricsCard
        metrics={currentMetrics}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />
      
      <Tabs defaultValue="trends">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends">
          <AdoptionTrendsChart
            trends={trends}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="distribution">
          <AdoptionDistribution
            merchantData={merchantData}
            regionalData={regionalData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="social">
          <SocialMetrics
            data={socialData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="analysis">
          <AdoptionAnalysis
            analysis={analysis}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
