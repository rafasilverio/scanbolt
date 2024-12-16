"use client";

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BlurredPreviewProps {
  tempId: string;
  onViewFullAnalysis: () => void;
  contract: any;
}

export function BlurredPreview({ tempId, onViewFullAnalysis, contract }: BlurredPreviewProps) {
  useEffect(() => {
    const savePreview = async () => {
      // Criar dados do preview usando os dados reais do contrato
      const previewData = {
        id: tempId,
        data: {
          title: contract.title,
          content: contract.content,
          fileUrl: contract.fileUrl,
          fileType: contract.fileType,
          fileName: contract.fileName || 'contract.pdf',
          highlights: contract.highlights || [
            ...Array(DEFAULT_PREVIEW_STATS.critical.count).fill({ type: 'critical' }),
            ...Array(DEFAULT_PREVIEW_STATS.warning.count).fill({ type: 'warning' }),
            ...Array(DEFAULT_PREVIEW_STATS.improvement.count).fill({ type: 'improvement' })
          ]
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // expira em 24 horas
      };

      console.log('Saving preview data:', previewData);

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('preview_cache')
        .upsert(previewData)
        .select();

      if (error) {
        console.error('Error saving preview:', error);
      } else {
        console.log('Preview saved successfully:', data);
      }
    };

    savePreview();
  }, [tempId, contract]);

  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center p-8">
        <button 
          onClick={onViewFullAnalysis}
          className="bg-[#2563EB] hover:bg-[#5000f7] text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
        >
          View Full Analysis
        </button>
      </div>
    </div>
  );
}