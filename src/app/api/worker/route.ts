// [ARQUIVO STUB] - Esta funcionalidade foi movida para src/scripts/worker.js
// Mantido apenas para evitar erros de build

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Esta API foi descontinuada. O processamento agora é feito via worker.js Node.js separado.'
  }, { status: 410 }); // 410 Gone - indica que o recurso foi intencionalmente removido
} 