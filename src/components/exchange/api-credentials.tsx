"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { bitsoApi, BitsoCredentials } from '@/services/exchange/bitso-api';
import { toast } from 'sonner';

interface ApiCredentialsProps {
  onSaved?: () => void;
}

export function ApiCredentials({ onSaved }: ApiCredentialsProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar credenciales guardadas
  useEffect(() => {
    const savedCredentials = localStorage.getItem('bitsoCredentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials) as BitsoCredentials;
        setApiKey(credentials.apiKey);
        setApiSecret(credentials.apiSecret);
        setIsConfigured(true);

        // Configurar la API con las credenciales guardadas
        bitsoApi.setCredentials(credentials);
      } catch (error) {
        console.error('Error loading API credentials:', error);
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

      // Guardar en localStorage
      localStorage.setItem('bitsoCredentials', JSON.stringify(credentials));

      // Configurar la API
      bitsoApi.setCredentials(credentials);

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

    try {
      const credentials: BitsoCredentials = { apiKey, apiSecret };

      // Configurar la API temporalmente para validar
      bitsoApi.setCredentials(credentials);

      // Intentar obtener el balance para validar las credenciales
      await bitsoApi.getBalance();

      toast.success('Credenciales validadas correctamente');
    } catch (error) {
      console.error('Error validating API credentials:', error);
      setError('Las credenciales no son válidas o no tienen permisos suficientes');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setApiSecret('');
    setIsConfigured(false);
    localStorage.removeItem('bitsoCredentials');
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
            <Icons.x className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isConfigured && (
          <Alert>
            <Icons.check className="h-4 w-4" />
            <AlertTitle>Configurado</AlertTitle>
            <AlertDescription>
              Las credenciales de API están configuradas y listas para usar
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ingresa tu API Key"
            type="password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiSecret">API Secret</Label>
          <Input
            id="apiSecret"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="Ingresa tu API Secret"
            type="password"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Puedes obtener tus credenciales de API en la{' '}
            <a
              href="https://bitso.com/api_setup"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              configuración de API de Bitso
            </a>
          </p>
          <p className="mt-2">
            <strong>Importante:</strong> Asegúrate de otorgar solo los permisos necesarios a tu API Key:
          </p>
          <ul className="list-disc list-inside mt-1">
            <li>Lectura de balance y operaciones</li>
            <li>Creación y cancelación de órdenes</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClear} disabled={isLoading || isValidating}>
          Limpiar
        </Button>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isLoading || isValidating || !apiKey || !apiSecret}
          >
            {isValidating ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              'Validar'
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isValidating || !apiKey || !apiSecret}
          >
            {isLoading ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
