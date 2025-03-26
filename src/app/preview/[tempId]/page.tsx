"use client";

import { useState, useEffect } from 'react';
import { Contract, ContractIssue } from '@/types/contract';
import { useRouter, redirect } from 'next/navigation';
import { DocumentWrapper } from '@/components/contracts/DocumentWrapper';
import { NewContractContent } from '@/components/contracts/NewContractContent';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';
import { PreviewRegisterDialog } from '@/components/auth/PreviewRegisterDialog';
import { BlurredPreview } from '@/components/preview/BlurredPreview';
import { PrismaClient } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const prisma = new PrismaClient();

// Função para contar o número de problemas no contrato
function countIssues(issues: any): number {
  if (!issues) return 0;
  if (Array.isArray(issues)) return issues.length;
  return 0;
}

// Interface para o contrato
interface RawContract {
  id: string;
  title: string;
  content: string;
  status: string;
  issues: any;
}

export default async function PreviewPage({ params }: { params: { tempId: string } }) {
  try {
    // Usar query bruta para buscar por tempId
    const contracts = await prisma.$queryRaw<RawContract[]>`
      SELECT * FROM "contract" 
      WHERE "tempId" = ${params.tempId}
      LIMIT 1
    `;
    
    const contract = contracts[0];

    // Se o contrato não existe, redirecionar para home
    if (!contract) {
      redirect('/');
    }

    // Verificar o status do contrato
    if (contract.status !== 'preview_ready') {
      // Se ainda não está pronto, exibir página de carregamento
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Analisando seu contrato</h1>
            <p className="text-gray-500 mb-8">
              Seu contrato está sendo processado. Por favor, aguarde...
            </p>
            <div className="flex justify-center mb-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Status atual: <span className="font-medium">{contract.status}</span>
            </p>
            <div className="mt-8">
              <Link href={`/preview/${params.tempId}`}>
                <Button>Atualizar página</Button>
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-8">
              ID temporário: {params.tempId}
            </p>
          </div>
        </div>
      );
    }

    // Se o contrato está pronto, exibir a análise
    const issueCount = countIssues(contract.issues);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Seu contrato está pronto!</h1>
          <p className="text-gray-500 mb-8">
            A análise do seu contrato "{contract.title}" foi concluída com sucesso.
          </p>
          <div className="p-4 bg-green-50 rounded-md text-green-700 mb-8">
            <p>O contrato possui {issueCount} problemas identificados.</p>
          </div>
          <div className="border border-gray-200 rounded-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Conteúdo do contrato</h2>
            <p className="text-sm text-gray-600 text-left whitespace-pre-wrap">
              {contract.content.substring(0, 500)}...
            </p>
          </div>
          <p className="text-sm text-gray-400">
            ID do contrato: {contract.id}
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar a página de preview:', error);
    redirect('/');
  }
}