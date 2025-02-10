import { Contract, Highlight } from '@/types/contract';

function generateSolution(highlight: Highlight): string {
  const solutions: { [key: string]: string } = {
    // Critical fixes
    c1: "State of California, United States",
    c2: "USD $150,000, payable via wire transfer",
    c3: "twelve (12) months",
    c4: "the American Arbitration Association in San Francisco, California",
    c5: "all intellectual property rights, including source code and documentation",
    c6: "successful completion of all test cases with zero critical bugs",
    c7: "circumstances beyond reasonable control including acts of God, war, or governmental actions",
    c8: "all work and source code shall be transferred within 30 days",
    
    // Warning fixes
    w1: "6 months total duration",
    w2: "24/7 support with 4-hour response time for critical issues",
    w3: "source code, business processes, and client data",
    w4: "automated testing suite with 90% code coverage",
    w5: "written change requests with cost estimates",
    w6: "P1: 4 hours, P2: 24 hours, P3: 72 hours",
    w7: "Git repository with complete documentation",
    w8: "Technical Director and Project Manager",
    w9: "CTO level escalation within 24 hours",
    
    // Improvement fixes
    i1: "monthly milestone-based payments",
    i2: "Git with trunk-based development",
    i3: "99.9% uptime, <100ms response time",
    i4: "API docs, user guides, architecture diagrams",
    i5: "OWASP Top 10 compliance",
    i6: "daily backups with 30-day retention",
    i7: "40 hours of user training",
    i8: "4-hour resolution for critical issues"
  };

  return solutions[highlight.id] || highlight.suggestion || "Updated content";
}

export function generateRevisedContract(contract: Contract): Contract {
  let revisedContent = contract.content;
  
  // Apply changes in reverse order to maintain correct indices
  [...contract.highlights]
    .sort((a, b) => b.startIndex - a.startIndex)
    .forEach(highlight => {
      const solution = generateSolution(highlight);
      revisedContent = 
        revisedContent.substring(0, highlight.startIndex) +
        solution +
        revisedContent.substring(highlight.endIndex);
    });

  return {
    ...contract,
    content: revisedContent,
    updatedAt: new Date().toISOString(),
  };
}
