"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiCredentialsReal } from '@/components/exchange/api-credentials-real';
import { TradingStatusReal } from '@/components/exchange/trading-status-real';

export default function TradingRealPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Trading Automatizado con Datos Reales</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Estado</TabsTrigger>
            <TabsTrigger value="credentials">Credenciales</TabsTrigger>
            <TabsTrigger value="strategies">Estrategias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4 pt-4">
            <TradingStatusReal />
          </TabsContent>
          
          <TabsContent value="credentials" className="space-y-4 pt-4">
            <ApiCredentialsReal />
          </TabsContent>
          
          <TabsContent value="strategies" className="space-y-4 pt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
              <h3 className="font-medium">Próximamente</h3>
              <p>La configuración de estrategias personalizadas estará disponible en una próxima actualización.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
