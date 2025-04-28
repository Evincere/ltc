import { useState, useEffect } from 'react';
import { HistoricalData } from '@/types/market';

export function useMarketData() {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulación de datos históricos
        const mockData: HistoricalData[] = Array.from({ length: 365 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (365 - i));
          return {
            timestamp: date.toISOString(),
            open: 100 + Math.random() * 20,
            high: 100 + Math.random() * 25,
            low: 100 + Math.random() * 15,
            close: 100 + Math.random() * 20,
            volume: Math.random() * 1000000
          };
        });
        setHistoricalData(mockData);
      } catch (err) {
        setError('Error al cargar los datos históricos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    historicalData,
    loading,
    error
  };
} 