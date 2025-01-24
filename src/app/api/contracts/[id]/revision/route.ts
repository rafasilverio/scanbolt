import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ContractIssue, SuggestedClause } from '@/types/contract';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI();

export const maxDuration = 60; // Set max duration to Vercel default
export const dynamic = 'force-dynamic';

function recalculatePositions(
  issues: ContractIssue[], 
  oldContent: string, 
  newContent: string
): ContractIssue[] {
  // Create a mapping of old positions to new positions
  const diffMapping = new Map<number, number>();
  let oldPos = 0;
  let newPos = 0;

  while (oldPos < oldContent.length && newPos < newContent.length) {
    diffMapping.set(oldPos, newPos);
    
    if (oldContent[oldPos] === newContent[newPos]) {
      oldPos++;
      newPos++;
    } else {
      const nextMatchOld = oldContent.indexOf(newContent[newPos], oldPos);
      const nextMatchNew = newContent.indexOf(oldContent[oldPos], newPos);
      
      if (nextMatchOld >= 0 && (nextMatchNew < 0 || nextMatchOld < nextMatchNew)) {
        oldPos = nextMatchOld;
      } else if (nextMatchNew >= 0) {
        newPos = nextMatchNew;
      } else {
        oldPos++;
        newPos++;
      }
    }
  }

  // Adjust positions for each issue
  return issues.map(issue => {
    if (!issue.position) return issue;

    const newStartIndex = diffMapping.get(issue.position.startIndex) ?? 0;
    const newEndIndex = diffMapping.get(issue.position.endIndex) ?? newContent.length;
    
    return {
      ...issue,
      position: {
        ...issue.position,
        startIndex: newStartIndex,
        endIndex: newEndIndex
      }
    };
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Add timeout promise
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 250000);
    });

    // Wrap processing in a promise
    const processingPromise = async (): Promise<Response> => {
      // Get existing contract with current highlights and changes
      const existingContract = await prisma.contract.findUnique({
        where: { id: params.id }
      });

      if (!existingContract) {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      // Set status to under_review immediately
      await prisma.contract.update({
        where: { id: params.id },
        data: { status: 'under_review' }
      });

      // Parse existing arrays com os novos tipos
      const existingIssues: ContractIssue[] = JSON.parse(existingContract.issues?.toString() || '[]');
      const existingClauses: SuggestedClause[] = JSON.parse(existingContract.suggestedClauses?.toString() || '[]');

      const { originalContent, changes, issues } = await req.json();

      // Apply all changes to get intermediate content
      let intermediateContent = originalContent;
      const sortedChanges = [...(changes || [])].sort((a, b) => b.startIndex - a.startIndex);
      
      for (const change of sortedChanges) {
        intermediateContent = 
          intermediateContent.substring(0, change.startIndex) +
          change.suggestion +
          intermediateContent.substring(change.endIndex);
      }

      // Generate AI improvements
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a legal document expert. Analyze the provided contract and suggest improvements with the goal of making the contract more clear, concise, and legally sound.`
          },
          {
            role: "user",
            content: `Improve this contract and return a JSON response with:
- finalContent: the complete improved contract text
- issues: array of new issues with type (critical/warning/improvement), originalText, explanation, newText, startIndex, and endIndex
- suggestedClauses: array of new clauses with title, explanation, content, startIndex, and endIndex

Contract to improve: ${intermediateContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const aiContent = response.choices[0]?.message?.content;
      if (!aiContent) {
        throw new Error('Empty response from OpenAI');
      }

      let aiResponse;
      try {
        aiResponse = JSON.parse(aiContent);
      } catch (error) {
        console.error('Failed to parse AI response:', aiContent);
        throw new Error('Invalid AI response format');
      }

      // Recalcular posições para os issues existentes
      const adjustedExistingIssues = recalculatePositions(
        existingIssues,
        originalContent,
        aiResponse.finalContent
      );

      // Não precisamos recalcular índices para SuggestedClauses pois elas usam referências textuais
      // ao invés de índices numéricos

      const newIssues = [
        ...adjustedExistingIssues,
        ...(aiResponse.issues || []).map((issue: any) => ({
          id: uuidv4(),
          type: issue.type,
          originalText: issue.originalText,
          newText: issue.newText,
          explanation: issue.explanation,
          riskType: issue.riskType || 'legal', // default to legal if not specified
          status: 'pending',
          position: {
            startIndex: issue.startIndex,
            endIndex: issue.endIndex,
            pageNumber: issue.pageNumber || 1,
            x1: issue.x1 || 0,
            y1: issue.y1 || 0,
            x2: issue.x2 || 0,
            y2: issue.y2 || 0,
            width: issue.width || 0,
            height: issue.height || 0
          }
        }))
      ];

      const newClauses = [
        ...existingClauses,
        ...(aiResponse.suggestedClauses || []).map((clause: any) => ({
          id: uuidv4(),
          title: clause.title,
          explanation: clause.explanation,
          suggestedText: clause.content, // renamed from content to suggestedText
          riskType: clause.riskType || 'legal',
          status: 'pending',
          suggestedPosition: {
            afterClause: clause.afterClause,
            pageNumber: clause.pageNumber
          }
        }))
      ];

      // Update contract with new content
      const revisionContract = await prisma.contract.update({
        where: { id: params.id },
        data: {
          content: aiResponse.finalContent,
          issues: JSON.stringify(newIssues),
          suggestedClauses: JSON.stringify(newClauses),
          status: 'approved',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        contract: {
          ...revisionContract,
          issues: newIssues,
          suggestedClauses: newClauses,
          content: aiResponse.finalContent
        }
      });
    };

    // Race between timeout and processing
    return await Promise.race([processingPromise(), timeoutPromise]);

  } catch (error) {
    console.error('Error in revision generation:', error);
    
    // Revert to original state on error
    await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: 'under_review',
        updatedAt: new Date()
      }
    });

    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate revision' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
