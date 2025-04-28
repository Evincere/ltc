import dynamic from 'next/dynamic';
import { LoadingCard, LoadingSpinner } from '@/components/ui/loading';

// Análisis Técnico
export const VolumeAnalysis = dynamic(
  () => import('@/components/analysis/VolumeAnalysis').then(mod => mod.VolumeAnalysis),
  { loading: () => <LoadingCard />, ssr: false }
);

export const TechnicalIndicators = dynamic(
  () => import('@/components/analysis/TechnicalIndicators').then(mod => mod.TechnicalIndicators),
  { loading: () => <LoadingCard />, ssr: false }
);

export const DrawingToolsBar = dynamic(
  () => import('@/components/analysis/DrawingToolsBar').then(mod => mod.DrawingToolsBar),
  { loading: () => <LoadingSpinner />, ssr: false }
);

// Widgets
export const PriceWidget = dynamic(
  () => import('@/components/widgets/PriceWidget').then(mod => mod.PriceWidget),
  { loading: () => <LoadingCard />, ssr: false }
);

export const PredictionWidget = dynamic(
  () => import('@/components/widgets/PredictionWidget').then(mod => mod.PredictionWidget),
  { loading: () => <LoadingCard />, ssr: false }
);

export const MetricsWidget = dynamic(
  () => import('@/components/widgets/MetricsWidget').then(mod => mod.MetricsWidget),
  { loading: () => <LoadingCard />, ssr: false }
);

export const SentimentWidget = dynamic(
  () => import('@/components/widgets/SentimentWidget').then(mod => mod.SentimentWidget),
  { loading: () => <LoadingCard />, ssr: false }
);

// Alertas y Notificaciones
export const AlertsPanel = dynamic(
  () => import('@/components/alerts/AlertsPanel').then(mod => mod.AlertsPanel),
  { loading: () => <LoadingCard />, ssr: false }
);

export const NotificationsCenter = dynamic(
  () => import('@/components/notifications/NotificationsCenter').then(mod => mod.NotificationsCenter),
  { loading: () => <LoadingCard />, ssr: false }
); 