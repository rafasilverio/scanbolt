import dynamic from 'next/dynamic';
import { PDFViewerFallback } from './PDFViewerFallback';

export const DynamicPDFViewer = dynamic(
  () => import('./PDFViewer').then(mod => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <PDFViewerFallback />
  }
);