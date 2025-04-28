"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import { toast } from 'sonner';
import { tradingService, TradingStrategy } from '@/services/exchange/trading-service';

export function StrategyManager() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<Partial<TradingStrategy>>({
    name: '',
    description: '',
    isActive: false,
    config: {}
  });
  const [selectedStrategyType, setSelectedStrategyType] = useState<string>('rsi');

  // Cargar estrategias al montar el componente
  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = () => {
    const loadedStrategies = tradingService.getStrategies();
    setStrategies(loadedStrategies);
  };

  const handleCreateStrategy = () => {
    setIsEditing(false);
    setCurrentStrategy({
      name: '',
      description: '',
      isActive: false,
      config: getDefaultConfig(selectedStrategyType)
    });
    setIsDialogOpen(true);
  };

  const handleEditStrategy = (strategy: TradingStrategy) => {
    setIsEditing(true);
    setCurrentStrategy({ ...strategy });
    setSelectedStrategyType(getStrategyType(strategy.config));
    setIsDialogOpen(true);
  };

  const handleSaveStrategy = () => {
    if (!currentStrategy.name) {
      toast.error('Por favor, ingresa un nombre para la estrategia');
      return;
    }

    try {
      if (isEditing && currentStrategy.id) {
        // Actualizar estrategia existente
        tradingService.updateStrategy(currentStrategy.id, {
          name: currentStrategy.name,
          description: currentStrategy.description || '',
          isActive: currentStrategy.isActive || false,
          config: currentStrategy.config || {}
        });
        toast.success('Estrategia actualizada correctamente');
      } else {
        // Crear nueva estrategia
        tradingService.addStrategy({
          id: Math.random().toString(36).substring(2, 15),
          name: currentStrategy.name,
          description: currentStrategy.description || '',
          isActive: currentStrategy.isActive || false,
          config: currentStrategy.config || {}
        });
        toast.success('Estrategia creada correctamente');
      }

      setIsDialogOpen(false);
      loadStrategies();
    } catch (error) {
      console.error('Error saving strategy:', error);
      toast.error('Error al guardar la estrategia');
    }
  };

  const handleDeleteStrategy = (strategyId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta estrategia?')) {
      tradingService.removeStrategy(strategyId);
      toast.success('Estrategia eliminada correctamente');
      loadStrategies();
    }
  };

  const handleToggleStrategy = (strategyId: string, isActive: boolean) => {
    tradingService.updateStrategy(strategyId, { isActive });
    toast.success(`Estrategia ${isActive ? 'activada' : 'desactivada'} correctamente`);
    loadStrategies();
  };

  const getDefaultConfig = (strategyType: string): Record<string, any> => {
    switch (strategyType) {
      case 'rsi':
        return {
          type: 'rsi',
          period: 14,
          overbought: 70,
          oversold: 30,
          book: 'btc_mxn',
          amount: 0.001
        };
      case 'macd':
        return {
          type: 'macd',
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          book: 'btc_mxn',
          amount: 0.001
        };
      case 'bollinger':
        return {
          type: 'bollinger',
          period: 20,
          stdDev: 2,
          book: 'btc_mxn',
          amount: 0.001
        };
      case 'custom':
        return {
          type: 'custom',
          book: 'btc_mxn',
          amount: 0.001,
          code: '// Escribe tu código personalizado aquí\n// Debe devolver una señal o null\n'
        };
      default:
        return {
          type: 'rsi',
          period: 14,
          overbought: 70,
          oversold: 30,
          book: 'btc_mxn',
          amount: 0.001
        };
    }
  };

  const getStrategyType = (config?: Record<string, any>): string => {
    if (!config || !config.type) return 'rsi';
    return config.type;
  };

  const updateStrategyConfig = (key: string, value: any) => {
    setCurrentStrategy({
      ...currentStrategy,
      config: {
        ...currentStrategy.config,
        [key]: value
      }
    });
  };

  const renderConfigFields = () => {
    if (!currentStrategy.config) return null;

    const config = currentStrategy.config;
    const type = getStrategyType(config);

    switch (type) {
      case 'rsi':
        return (
          <>
            <div className="space-y-2">
              <Label>Período RSI</Label>
              <Input
                type="number"
                value={config.period || 14}
                onChange={(e) => updateStrategyConfig('period', parseInt(e.target.value))}
                min={1}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nivel Sobrecompra</Label>
                <Input
                  type="number"
                  value={config.overbought || 70}
                  onChange={(e) => updateStrategyConfig('overbought', parseInt(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Nivel Sobreventa</Label>
                <Input
                  type="number"
                  value={config.oversold || 30}
                  onChange={(e) => updateStrategyConfig('oversold', parseInt(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </>
        );
      case 'macd':
        return (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Período Rápido</Label>
                <Input
                  type="number"
                  value={config.fastPeriod || 12}
                  onChange={(e) => updateStrategyConfig('fastPeriod', parseInt(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Período Lento</Label>
                <Input
                  type="number"
                  value={config.slowPeriod || 26}
                  onChange={(e) => updateStrategyConfig('slowPeriod', parseInt(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Período Señal</Label>
                <Input
                  type="number"
                  value={config.signalPeriod || 9}
                  onChange={(e) => updateStrategyConfig('signalPeriod', parseInt(e.target.value))}
                  min={1}
                />
              </div>
            </div>
          </>
        );
      case 'bollinger':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Input
                  type="number"
                  value={config.period || 20}
                  onChange={(e) => updateStrategyConfig('period', parseInt(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Desviación Estándar</Label>
                <Input
                  type="number"
                  value={config.stdDev || 2}
                  onChange={(e) => updateStrategyConfig('stdDev', parseFloat(e.target.value))}
                  min={0.1}
                  step={0.1}
                />
              </div>
            </div>
          </>
        );
      case 'custom':
        return (
          <>
            <div className="space-y-2">
              <Label>Código Personalizado</Label>
              <Textarea
                value={config.code || ''}
                onChange={(e) => updateStrategyConfig('code', e.target.value)}
                rows={10}
                className="font-mono text-sm"
                placeholder="// Escribe tu código personalizado aquí"
              />
              <p className="text-xs text-muted-foreground">
                Escribe código JavaScript que analice los datos y devuelva una señal de trading.
                La función debe devolver un objeto con la acción a realizar o null si no hay señal.
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestor de Estrategias</CardTitle>
        <CardDescription>
          Configura y gestiona tus estrategias de trading automatizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleCreateStrategy}>
            <Icons.plus className="mr-2 h-4 w-4" />
            Nueva Estrategia
          </Button>
        </div>

        {strategies.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <Icons.fileCode className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No hay estrategias configuradas</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea tu primera estrategia para comenzar con el trading automatizado
            </p>
            <Button className="mt-4" onClick={handleCreateStrategy}>
              Crear Estrategia
            </Button>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategies.map((strategy) => (
                  <TableRow key={strategy.id}>
                    <TableCell className="font-medium">{strategy.name}</TableCell>
                    <TableCell>
                      {strategy.config?.type === 'rsi' && 'RSI'}
                      {strategy.config?.type === 'macd' && 'MACD'}
                      {strategy.config?.type === 'bollinger' && 'Bollinger Bands'}
                      {strategy.config?.type === 'custom' && 'Personalizada'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={strategy.isActive}
                          onCheckedChange={(checked) => handleToggleStrategy(strategy.id, checked)}
                        />
                        <span className={strategy.isActive ? 'text-green-500' : 'text-red-500'}>
                          {strategy.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStrategy(strategy)}
                        >
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStrategy(strategy.id)}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Estrategia' : 'Nueva Estrategia'}
              </DialogTitle>
              <DialogDescription>
                Configura los parámetros de tu estrategia de trading
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Estrategia</Label>
                <Input
                  id="name"
                  value={currentStrategy.name || ''}
                  onChange={(e) => setCurrentStrategy({ ...currentStrategy, name: e.target.value })}
                  placeholder="Mi Estrategia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={currentStrategy.description || ''}
                  onChange={(e) => setCurrentStrategy({ ...currentStrategy, description: e.target.value })}
                  placeholder="Describe brevemente tu estrategia"
                  rows={2}
                />
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <Label>Tipo de Estrategia</Label>
                  <Select
                    value={selectedStrategyType}
                    onValueChange={(value) => {
                      setSelectedStrategyType(value);
                      setCurrentStrategy({
                        ...currentStrategy,
                        config: getDefaultConfig(value)
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rsi">RSI (Índice de Fuerza Relativa)</SelectItem>
                      <SelectItem value="macd">MACD (Convergencia/Divergencia)</SelectItem>
                      <SelectItem value="bollinger">Bandas de Bollinger</SelectItem>
                      <SelectItem value="custom">Estrategia Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 border p-4 rounded-md">
                <h4 className="text-sm font-medium">Configuración de la Estrategia</h4>

                <div className="space-y-4">
                  {renderConfigFields()}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Par de Trading</Label>
                      <Select
                        value={currentStrategy.config?.book || 'btc_mxn'}
                        onValueChange={(value) => updateStrategyConfig('book', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="btc_mxn">BTC/MXN</SelectItem>
                          <SelectItem value="eth_mxn">ETH/MXN</SelectItem>
                          <SelectItem value="ltc_mxn">LTC/MXN</SelectItem>
                          <SelectItem value="xrp_mxn">XRP/MXN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cantidad por Operación</Label>
                      <Input
                        type="number"
                        value={currentStrategy.config?.amount || 0.001}
                        onChange={(e) => updateStrategyConfig('amount', parseFloat(e.target.value))}
                        min={0.0001}
                        step={0.0001}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={currentStrategy.isActive || false}
                  onCheckedChange={(checked) => setCurrentStrategy({ ...currentStrategy, isActive: checked })}
                />
                <Label htmlFor="active">Activar estrategia</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveStrategy}>
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
