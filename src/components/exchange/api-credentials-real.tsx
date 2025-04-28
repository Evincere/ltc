"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { bitsoApiReal } from '@/services/exchange/bitso-api-real';
import { BitsoCredentials } from '@/services/exchange/bitso-api';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch";

interface ApiCredentialsRealProps {
  onSaved?: () => void;
}

export function ApiCredentialsReal({ onSaved }: ApiCredentialsRealProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [rememberCredentials, setRememberCredentials] = useState<boolean>(true);
  const [validationStatus, setValidationStatus] = useState<'none' | 'success' | 'error'>('none');

  useEffect(() => {
    // Verificar si ya hay credenciales configuradas
    const hasCredentials = bitsoApiReal.hasCredentials();
    setIsConfigured(hasCredentials);

    // Cargar credenciales guardadas
    if (!hasCredentials) {
      const loaded = bitsoApiReal.loadCredentials();
      setIsConfigured(loaded);
    }

    // Intentar cargar credenciales desde localStorage para mostrarlas en el formulario
    if (typeof window !== 'undefined') {
      const savedCredentials = localStorage.getItem('bitsoCredentials');
      if (savedCredentials) {
        try {
          const credentials = JSON.parse(savedCredentials);
          setApiKey(credentials.apiKey || '');
          // No mostramos el API Secret por seguridad, solo indicamos que está guardado
          setApiSecret(credentials.apiSecret ? '••••••••••••••••••••••••••••••••' : '');
        } catch (error) {
          console.error('Error loading API credentials:', error);
        }
      }
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey || !apiSecret) {
      setError('Por favor, ingresa tanto la API Key como el API Secret');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credentials: BitsoCredentials = { apiKey, apiSecret };

      // Configurar la API
      bitsoApiReal.setCredentials(credentials);

      // Guardar en localStorage solo si el usuario lo permite
      if (rememberCredentials) {
        localStorage.setItem('bitsoCredentials', JSON.stringify(credentials));
      }

      setIsConfigured(true);
      toast.success('Credenciales guardadas correctamente');

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving API credentials:', error);
      setError('Error al guardar las credenciales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!apiKey || !apiSecret) {
      setError('Por favor, ingresa tanto la API Key como el API Secret');
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationStatus('none');

    try {
      const credentials: BitsoCredentials = { apiKey, apiSecret };

      // Configurar la API temporalmente para validar
      bitsoApiReal.setCredentials(credentials);

      // Intentar obtener el balance para validar las credenciales
      await bitsoApiReal.getBalance();

      setValidationStatus('success');
      toast.success('Credenciales validadas correctamente');
    } catch (error) {
      console.error('Error validating API credentials:', error);
      setError('Las credenciales no son válidas o no tienen permisos suficientes');
      setValidationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setApiSecret('');
    setIsConfigured(false);
    setError(null);
    setValidationStatus('none');

    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bitsoCredentials');
    }

    toast.info('Credenciales eliminadas');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Credenciales de API de Bitso</CardTitle>
        <CardDescription>
          Configura tus credenciales de API para conectar con Bitso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <Icons.alertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {validationStatus === 'success' && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <Icons.check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Validación exitosa</AlertTitle>
            <AlertDescription className="text-green-600">
              Las credenciales son válidas y tienen los permisos necesarios
            </AlertDescription>
          </Alert>
        )}

        {isConfigured && validationStatus !== 'error' && (
          <Alert>
            <Icons.check className="h-4 w-4" />
            <AlertTitle>Configurado</AlertTitle>
            <AlertDescription>
              Las credenciales de API están configuradas y listas para usar
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Tu API Key de Bitso"
            disabled={isLoading || isValidating}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="api-secret">API Secret</Label>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="h-6 px-2 text-xs"
            >
              {showSecret ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          <Input
            id="api-secret"
            type={showSecret ? 'text' : 'password'}
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="Tu API Secret de Bitso"
            disabled={isLoading || isValidating}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="remember-credentials"
            checked={rememberCredentials}
            onCheckedChange={setRememberCredentials}
          />
          <Label htmlFor="remember-credentials">Recordar credenciales</Label>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Para obtener tus credenciales de API:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Inicia sesión en tu cuenta de Bitso</li>
            <li>Ve a Configuración &gt; API</li>
            <li>Crea una nueva API Key con permisos de lectura y trading</li>
            <li>Copia la API Key y el API Secret</li>
          </ol>
          <p className="mt-2 text-xs text-red-500">
            Importante: Guarda tu API Secret en un lugar seguro. No podrás verlo nuevamente en Bitso.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {isConfigured && (
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading || isValidating}
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isLoading || isValidating || !apiKey || !apiSecret}
          >
            {isValidating ? (
              <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.check className="mr-2 h-4 w-4" />
            )}
            Validar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isValidating || !apiKey || !apiSecret}
          >
            {isLoading ? (
              <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
