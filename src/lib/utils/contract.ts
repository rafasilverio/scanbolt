import { Contract } from "@prisma/client";

export function convertToNewFormat(oldContract: any): Contract {
  return {
    id: oldContract.id,
    userId: oldContract.userId,
    fileUrl: oldContract.fileUrl,
    fileName: oldContract.fileName,
    fileType: oldContract.fileType,
    content: oldContract.content,
    issues: oldContract.highlights?.map((h: any) => ({
      id: h.id,
      type: h.type,
      originalText: h.content?.text || '',
      newText: h.comment?.suggestion || '',
      explanation: h.comment?.message || '',
      riskType: determineRiskType(h.type),
      status: 'pending',
      position: {
        startIndex: h.startIndex || 0,
        endIndex: h.endIndex || 0,
        pageNumber: h.position?.pageNumber || 1,
        pdfPosition: h.position
      }
    })) || [],
    suggestedClauses: [],
    status: mapOldStatus(oldContract.status),
    metadata: {
      pageCount: oldContract.numPages || 1,
      createdAt: oldContract.createdAt,
      updatedAt: oldContract.updatedAt
    }
  };
}

function determineRiskType(type: string): RiskType {
  switch (type) {
    case 'critical':
      return 'legal';
    case 'warning':
      return 'compliance';
    default:
      return 'operational';
  }
}

function mapOldStatus(oldStatus: string): Contract['status'] {
  switch (oldStatus) {
    case 'under_review':
      return 'under_review';
    case 'approved':
    case 'rejected':
      return 'completed';
    default:
      return 'analyzing';
  }
} 