// PDF.js configuração
import * as pdfjs from 'pdfjs-dist';

// Versão do PDF.js deve corresponder à que está instalada no package.json
export const PDFJS_VERSION = '4.4.168';
export const PDF_WORKER_URL = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

// Configurar o worker global para PDF.js uma vez
export function initPdfJs() {
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    // Set the worker source
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
    
    // Pre-load the worker script
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'script';
    preloadLink.href = PDF_WORKER_URL;
    document.head.appendChild(preloadLink);
    
    // Para debug
    console.log('PDF.js worker initialized');
    
    // Também podemos carregar o script diretamente
    const script = document.createElement('script');
    script.src = PDF_WORKER_URL;
    script.async = true;
    document.head.appendChild(script);
  }
}

// Definir interface para EventBus
interface IEventBus {
  _listeners: Record<string, Function[]>;
  on(eventName: string, listener: Function): void;
  off(eventName: string, listener: Function): void;
  dispatch(eventName: string, ...args: any[]): void;
}

// EventBus polyfill (para evitar erro "EventBus is not a constructor")
if (typeof window !== 'undefined') {
  // @ts-ignore - Definindo um EventBus global se não existir
  if (!window.EventBus) {
    class EventBusImpl implements IEventBus {
      _listeners: Record<string, Function[]>;
      
      constructor() {
        this._listeners = Object.create(null);
      }
      
      on(eventName: string, listener: Function): void {
        this._listeners[eventName] = this._listeners[eventName] || [];
        this._listeners[eventName].push(listener);
      }
      
      off(eventName: string, listener: Function): void {
        if (!this._listeners[eventName]) return;
        const index = this._listeners[eventName].indexOf(listener);
        if (index >= 0) {
          this._listeners[eventName].splice(index, 1);
        }
      }
      
      dispatch(eventName: string, ...args: any[]): void {
        if (!this._listeners[eventName]) return;
        const listeners = this._listeners[eventName].slice();
        for (const listener of listeners) {
          listener.apply(null, args);
        }
      }
    }
    
    // @ts-ignore - Adicionar ao objeto window
    window.EventBus = EventBusImpl;
  }
}

export default pdfjs; 