import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${GlobalWorkerOptions.workerVersion}/pdf.worker.min.js`;
}