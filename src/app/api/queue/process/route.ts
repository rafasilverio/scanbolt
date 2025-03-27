// [ARQUIVO STUB] - Esta funcionalidade foi movida para src/scripts/worker.js
// Mantido apenas para evitar erros de build

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'Esta API foi descontinuada. O processamento agora é feito via worker.js Node.js separado.'
  }, { status: 410 }); // 410 Gone
} 