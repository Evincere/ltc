import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

interface StrategyEditorProps {
  onSave: (strategy: CustomStrategy) => void;
  onCancel: () => void;
  initialStrategy?: CustomStrategy;
}

export interface CustomStrategy {
  id: string;
  name: string;
  description: string;
  type: 'predefined' | 'custom' | 'combined';
  parameters: StrategyParameter[];
  conditions: StrategyCondition[];
  code?: string;
}

export interface StrategyParameter {
  name: string;
  label: string;
  type: 'number' | 'select';
  value: number | string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface StrategyCondition {
  indicator: string;
  operator: 'greater' | 'less' | 'equal' | 'cross-above' | 'cross-below';
  value: number | string;
  action: 'buy' | 'sell';
}

export function StrategyEditor({ onSave, onCancel, initialStrategy }: StrategyEditorProps) {
  const [strategy, setStrategy] = useState<CustomStrategy>(
    initialStrategy || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      type: 'predefined',
      parameters: [
        { name: 'period', label: 'Período', type: 'number', value: 14 }
      ],
      conditions: [
        { 
          indicator: 'rsi', 
          operator: 'less', 
          value: 30, 
          action: 'buy' 
        }
      ],
      code: ''
    }
  );

  const [newCondition, setNewCondition] = useState<StrategyCondition>({
    indicator: 'rsi',
    operator: 'less',
    value: 30,
    action: 'buy'
  });

  const [newParameter, setNewParameter] = useState<StrategyParameter>({
    name: '',
    label: '',
    type: 'number',
    value: 0
  });

  const handleSave = () => {
    if (!strategy.name) {
      toast.error("Por favor, ingresa un nombre para la estrategia");
      return;
    }

    if (strategy.type === 'custom' && !strategy.code) {
      toast.error("Por favor, ingresa el código de la estrategia personalizada");
      return;
    }

    onSave(strategy);
  };

  const addCondition = () => {
    setStrategy({
      ...strategy,
      conditions: [...strategy.conditions, { ...newCondition }]
    });
    
    // Reset new condition form
    setNewCondition({
      indicator: 'rsi',
      operator: 'less',
      value: 30,
      action: 'buy'
    });
  };

  const removeCondition = (index: number) => {
    const updatedConditions = [...strategy.conditions];
    updatedConditions.splice(index, 1);
    setStrategy({
      ...strategy,
      conditions: updatedConditions
    });
  };

  const addParameter = () => {
    if (!newParameter.name || !newParameter.label) {
      toast.error("Por favor, completa todos los campos del parámetro");
      return;
    }

    setStrategy({
      ...strategy,
      parameters: [...strategy.parameters, { ...newParameter }]
    });
    
    // Reset new parameter form
    setNewParameter({
      name: '',
      label: '',
      type: 'number',
      value: 0
    });
  };

  const removeParameter = (index: number) => {
    const updatedParameters = [...strategy.parameters];
    updatedParameters.splice(index, 1);
    setStrategy({
      ...strategy,
      parameters: updatedParameters
    });
  };

  const updateParameter = (index: number, field: string, value: any) => {
    const updatedParameters = [...strategy.parameters];
    updatedParameters[index] = {
      ...updatedParameters[index],
      [field]: value
    };
    setStrategy({
      ...strategy,
      parameters: updatedParameters
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Editor de Estrategia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la Estrategia</Label>
              <Input
                value={strategy.name}
                onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
                placeholder="Nombre de la estrategia"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Estrategia</Label>
              <Select 
                value={strategy.type} 
                onValueChange={(value: 'predefined' | 'custom' | 'combined') => 
                  setStrategy({ ...strategy, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="predefined">Predefinida</SelectItem>
                  <SelectItem value="custom">Personalizada</SelectItem>
                  <SelectItem value="combined">Combinada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={strategy.description}
              onChange={(e) => setStrategy({ ...strategy, description: e.target.value })}
              placeholder="Describe brevemente la estrategia"
              rows={2}
            />
          </div>

          <Tabs defaultValue="conditions">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="conditions">Condiciones</TabsTrigger>
              <TabsTrigger value="parameters">Parámetros</TabsTrigger>
              <TabsTrigger value="code">Código</TabsTrigger>
            </TabsList>

            <TabsContent value="conditions" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Condiciones Actuales</h3>
                {strategy.conditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay condiciones definidas</p>
                ) : (
                  <div className="space-y-2">
                    {strategy.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="text-sm">
                          {condition.action === 'buy' ? '🟢 Comprar' : '🔴 Vender'} cuando {condition.indicator} es 
                          {condition.operator === 'greater' && ' mayor que '}
                          {condition.operator === 'less' && ' menor que '}
                          {condition.operator === 'equal' && ' igual a '}
                          {condition.operator === 'cross-above' && ' cruza por encima de '}
                          {condition.operator === 'cross-below' && ' cruza por debajo de '}
                          {condition.value}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCondition(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="text-sm font-medium">Agregar Nueva Condición</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Indicador</Label>
                      <Select 
                        value={newCondition.indicator} 
                        onValueChange={(value) => setNewCondition({ ...newCondition, indicator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rsi">RSI</SelectItem>
                          <SelectItem value="macd">MACD</SelectItem>
                          <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                          <SelectItem value="price">Precio</SelectItem>
                          <SelectItem value="volume">Volumen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Operador</Label>
                      <Select 
                        value={newCondition.operator} 
                        onValueChange={(value: any) => setNewCondition({ ...newCondition, operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="greater">Mayor que</SelectItem>
                          <SelectItem value="less">Menor que</SelectItem>
                          <SelectItem value="equal">Igual a</SelectItem>
                          <SelectItem value="cross-above">Cruza por encima</SelectItem>
                          <SelectItem value="cross-below">Cruza por debajo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor</Label>
                      <Input
                        type="number"
                        value={newCondition.value.toString()}
                        onChange={(e) => setNewCondition({ ...newCondition, value: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Acción</Label>
                      <Select 
                        value={newCondition.action} 
                        onValueChange={(value: 'buy' | 'sell') => setNewCondition({ ...newCondition, action: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Comprar</SelectItem>
                          <SelectItem value="sell">Vender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addCondition} className="w-full">Agregar Condición</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Parámetros Actuales</h3>
                {strategy.parameters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay parámetros definidos</p>
                ) : (
                  <div className="space-y-2">
                    {strategy.parameters.map((param, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <div className="text-sm">
                            <span className="font-medium">{param.label}:</span> {param.value}
                          </div>
                          <div className="col-span-2">
                            {param.type === 'number' ? (
                              <Input
                                type="number"
                                value={param.value.toString()}
                                onChange={(e) => updateParameter(index, 'value', parseFloat(e.target.value))}
                                className="h-8"
                              />
                            ) : (
                              <Select 
                                value={param.value.toString()} 
                                onValueChange={(value) => updateParameter(index, 'value', value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {param.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeParameter(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="text-sm font-medium">Agregar Nuevo Parámetro</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre (ID)</Label>
                      <Input
                        value={newParameter.name}
                        onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                        placeholder="period"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Etiqueta</Label>
                      <Input
                        value={newParameter.label}
                        onChange={(e) => setNewParameter({ ...newParameter, label: e.target.value })}
                        placeholder="Período"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tipo</Label>
                      <Select 
                        value={newParameter.type} 
                        onValueChange={(value: 'number' | 'select') => setNewParameter({ ...newParameter, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="select">Selección</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor Predeterminado</Label>
                      <Input
                        type={newParameter.type === 'number' ? 'number' : 'text'}
                        value={newParameter.value.toString()}
                        onChange={(e) => setNewParameter({ 
                          ...newParameter, 
                          value: newParameter.type === 'number' ? parseFloat(e.target.value) : e.target.value 
                        })}
                      />
                    </div>
                  </div>
                  <Button onClick={addParameter} className="w-full">Agregar Parámetro</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label>Código Personalizado</Label>
                <Textarea
                  value={strategy.code || ''}
                  onChange={(e) => setStrategy({ ...strategy, code: e.target.value })}
                  placeholder="// Escribe tu código JavaScript aquí
// Ejemplo:
function executeStrategy(data, params) {
  const period = params.period || 14;
  const signals = [];
  
  // Implementa tu lógica aquí
  
  return signals; // Debe retornar un array de señales {timestamp, action, price}
}"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Escribe código JavaScript para implementar tu estrategia personalizada. 
                  La función debe recibir los datos históricos y los parámetros, y devolver un array de señales.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar Estrategia</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
