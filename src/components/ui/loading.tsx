import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-4/6 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 