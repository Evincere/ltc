import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssetSelectorProps {
  selectedAssets: string[];
  onSelectionChange: (assets: string[]) => void;
}

const availableAssets = [
  { id: 'bitcoin', name: 'Bitcoin (BTC)' },
  { id: 'ethereum', name: 'Ethereum (ETH)' },
  { id: 'binancecoin', name: 'Binance Coin (BNB)' },
  { id: 'cardano', name: 'Cardano (ADA)' },
  { id: 'solana', name: 'Solana (SOL)' },
  { id: 'polkadot', name: 'Polkadot (DOT)' },
  { id: 'ripple', name: 'Ripple (XRP)' },
  { id: 'dogecoin', name: 'Dogecoin (DOGE)' }
];

export function AssetSelector({ selectedAssets, onSelectionChange }: AssetSelectorProps) {
  const handleAssetToggle = (assetId: string) => {
    const newSelection = selectedAssets.includes(assetId)
      ? selectedAssets.filter(id => id !== assetId)
      : [...selectedAssets, assetId];
    onSelectionChange(newSelection);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleccionar Activos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {availableAssets.map((asset) => (
            <div key={asset.id} className="flex items-center space-x-2">
              <Checkbox
                id={asset.id}
                checked={selectedAssets.includes(asset.id)}
                onCheckedChange={() => handleAssetToggle(asset.id)}
              />
              <Label htmlFor={asset.id}>{asset.name}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 