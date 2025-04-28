import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MerchantAdoption, RegionalAdoption } from '@/services/adoption-metrics';

interface AdoptionDistributionProps {
  merchantData: MerchantAdoption[] | null;
  regionalData: RegionalAdoption[] | null;
  isLoading: boolean;
}

export function AdoptionDistribution({ 
  merchantData, 
  regionalData, 
  isLoading 
}: AdoptionDistributionProps) {
  
  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#AAAAAA'];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Distribución de Adopción</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (merchantData && regionalData) ? (
          <Tabs defaultValue="regional">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="regional">Por Región</TabsTrigger>
              <TabsTrigger value="merchant">Por Comerciantes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="regional" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Distribución por Región</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={regionalData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          nameKey="region"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {regionalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${value.toFixed(2)}%`, 'Porcentaje']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Crecimiento por Región</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={regionalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax']} />
                        <YAxis dataKey="region" type="category" width={100} />
                        <Tooltip
                          formatter={(value: any) => [`${value.toFixed(2)}%`, 'Crecimiento Anual']}
                        />
                        <Bar
                          dataKey="yearOverYearGrowth"
                          name="Crecimiento Anual"
                          fill="#8884d8"
                        >
                          {regionalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                <p>
                  Los datos regionales se basan en el volumen de transacciones y el número de usuarios activos por región.
                  El crecimiento anual muestra el cambio porcentual respecto al año anterior.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="merchant" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Distribución por Categoría</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={merchantData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          nameKey="category"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {merchantData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${value.toFixed(2)}%`, 'Porcentaje']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Crecimiento por Categoría</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={merchantData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax']} />
                        <YAxis dataKey="category" type="category" width={100} />
                        <Tooltip
                          formatter={(value: any) => [`${value.toFixed(2)}%`, 'Crecimiento Anual']}
                        />
                        <Bar
                          dataKey="yearOverYearGrowth"
                          name="Crecimiento Anual"
                          fill="#8884d8"
                        >
                          {merchantData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                <p>
                  Los datos de comerciantes muestran la distribución y el crecimiento de la adopción de Litecoin por categoría de negocio.
                  El crecimiento anual indica el aumento porcentual en el número de comerciantes que aceptan Litecoin.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay datos de distribución disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
