import { Contract, Highlight, AIChange } from "@/types/contract";

export function generateImprovedContract(contract: Contract): string {
  // Sort all changes by startIndex in reverse order to avoid index shifting
  const allChanges = [
    ...contract.highlights.filter(h => h.suggestion).map(h => ({
      startIndex: h.startIndex,
      endIndex: h.endIndex,
      suggestion: h.suggestion as string,
      type: h.type
    })),
    ...contract.changes.map(c => ({
      startIndex: c.startIndex,
      endIndex: c.endIndex,
      suggestion: c.suggestion,
      type: c.type
    }))
  ].sort((a, b) => b.startIndex - a.startIndex);

  // Apply changes from end to start to maintain correct indices
  let improvedContent = contract.content;
  allChanges.forEach(change => {
    improvedContent = 
      improvedContent.slice(0, change.startIndex) + 
      change.suggestion +
      improvedContent.slice(change.endIndex);
  });

  return improvedContent;
}
