'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkMetricsWidget } from '@/components/fundamental/network-metrics-widget';
import { MiningAnalysisWidget } from '@/components/fundamental/mining-analysis-widget';
import { AdoptionDashboard } from '@/components/fundamental/adoption-dashboard';
import { AssetComparison } from '@/components/fundamental/asset-comparison';

export default function FundamentalAnalysisPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análisis Fundamental</h1>
        <p className="text-muted-foreground">
          Análisis de métricas fundamentales de Litecoin
        </p>
      </div>

      <Tabs defaultValue="network">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="network">Métricas de Red</TabsTrigger>
          <TabsTrigger value="mining">Análisis de Minería</TabsTrigger>
          <TabsTrigger value="adoption">Adopción</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-6">
          <NetworkMetricsWidget />
        </TabsContent>

        <TabsContent value="mining" className="space-y-6">
          <MiningAnalysisWidget />
        </TabsContent>

        <TabsContent value="adoption" className="space-y-6">
          <AdoptionDashboard />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <AssetComparison />
        </TabsContent>
      </Tabs>
    </div>
  );
}
