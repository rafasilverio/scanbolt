import { Contract } from "@/types/contract";

export function convertToNewFormat(oldContract: any): Contract {
  return {
    id: oldContract.id,
    userId: oldContract.userId,
    fileUrl: oldContract.fileUrl,
    fileName: oldContract.fileName,
    fileType: oldContract.fileType,
    content: oldContract.content,
    issues: oldContract.issues || [],
    suggestedClauses: oldContract.suggestedClauses || [],
    status: mapOldStatus(oldContract.status),
    metadata: {
      pageCount: oldContract.numPages || 1,
      createdAt: new Date(oldContract.createdAt),
      updatedAt: new Date(oldContract.updatedAt)
    }
  };
}

function determineRiskType(type: string): 'legal' | 'compliance' | 'operational' {
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