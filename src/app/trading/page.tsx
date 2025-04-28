import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiCredentials } from '@/components/exchange/api-credentials';
import { StrategyManager } from '@/components/exchange/strategy-manager';
import { TradingStatus } from '@/components/exchange/trading-status';
import { RiskManager } from '@/components/exchange/risk-manager';

export default function TradingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Automatizado</h1>
        <p className="text-muted-foreground">
          Configura y gestiona tus estrategias de trading automatizado
        </p>
      </div>

      <Tabs defaultValue="status">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="status">Estado</TabsTrigger>
          <TabsTrigger value="strategies">Estrategias</TabsTrigger>
          <TabsTrigger value="risk">Gestión de Riesgo</TabsTrigger>
          <TabsTrigger value="api">Configuración API</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <TradingStatus />
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <StrategyManager />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <RiskManager />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiCredentials />
        </TabsContent>
      </Tabs>
    </div>
  );
}
