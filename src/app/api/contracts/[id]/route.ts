import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Tipos para os highlights
interface HighlightPosition {
  boundingRect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    pageNumber: number;
  };
  rects: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    pageNumber: number;
  }>;
  pageNumber: number;
}

interface Highlight {
  id: string;
  content: {
    text: string;
  };
  position: HighlightPosition;
  comment: {
    type: 'critical' | 'warning' | 'improvement';
    message: string;
    suggestion: string;
  };
}

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    if (contract.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Log dos dados brutos
    console.log('Raw contract data:', {
      issues: contract.issues,
      suggestedClauses: contract.suggestedClauses,
      type: {
        issues: typeof contract.issues,
        suggestedClauses: typeof contract.suggestedClauses
      }
    });

    let processedIssues = [];
    let processedClauses = [];

    // Processar issues
    try {
      if (typeof contract.issues === 'string') {
        processedIssues = JSON.parse(contract.issues);
      } else if (contract.issues && typeof contract.issues === 'object') {
        processedIssues = Array.isArray(contract.issues) ? contract.issues : [];
      }
    } catch (e) {
      console.error('Error processing issues:', e);
    }

    // Processar suggested clauses  
    try {
      if (typeof contract.suggestedClauses === 'string') {
        processedClauses = JSON.parse(contract.suggestedClauses);
      } else if (contract.suggestedClauses && typeof contract.suggestedClauses === 'object') {
        processedClauses = Array.isArray(contract.suggestedClauses) ? contract.suggestedClauses : [];
      }
    } catch (e) {
      console.error('Error processing suggested clauses:', e);
    }

    const processedContract = {
      ...contract,
      issues: processedIssues,
      suggestedClauses: processedClauses,
      // Manter campos antigos para compatibilidade
      highlights: [],
      changes: []
    };

    // Log do contrato processado
    console.log('Processed contract:', {
      issuesCount: processedContract.issues.length,
      suggestedClausesCount: processedContract.suggestedClauses.length,
      sampleIssue: processedContract.issues[0],
      sampleClause: processedContract.suggestedClauses[0]
    });

    await prisma.$disconnect();
    
    // Definir explicitamente o tipo de conteúdo
    return new NextResponse(JSON.stringify(processedContract), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Server error:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Função auxiliar para converter o formato antigo para o novo
function convertHighlightPosition(oldPosition: any): HighlightPosition {
  const x = oldPosition.x || oldPosition.boundingRect?.left || 0;
  const y = oldPosition.y || oldPosition.boundingRect?.top || 0;
  const width = oldPosition.width || oldPosition.boundingRect?.width || 0;
  const height = oldPosition.height || oldPosition.boundingRect?.height || 0;
  const pageNumber = oldPosition.pageNumber || 1;

  const boundingRect = {
    x1: x,
    y1: y,
    x2: x + width,
    y2: y + height,
    width,
    height,
    pageNumber
  };

  return {
    boundingRect,
    rects: [boundingRect],
    pageNumber
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    
    // Converter highlights para o novo formato antes de salvar
    if (body.highlights) {
      body.highlights = body.highlights.map((h: any) => ({
        id: h.id,
        content: {
          text: h.content?.text || ''
        },
        position: convertHighlightPosition(h.position),
        comment: {
          type: h.type || h.comment?.type,
          message: h.message || h.comment?.message,
          suggestion: h.suggestion || h.comment?.suggestion
        }
      }));

      // Validar a estrutura dos highlights
      const isValidHighlight = (h: any): h is Highlight => {
        return (
          h.id &&
          h.position?.boundingRect &&
          h.position?.rects &&
          h.comment?.type &&
          h.comment?.message &&
          h.comment?.suggestion
        );
      };

      if (!Array.isArray(body.highlights) || !body.highlights.every(isValidHighlight)) {
        return NextResponse.json(
          { error: 'Invalid highlight format' },
          { status: 400 }
        );
      }
    }

    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: body.status,
        highlights: body.highlights,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      contract: updatedContract,
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
