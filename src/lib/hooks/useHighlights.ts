import { useState, useCallback } from 'react';
import { ContractIssue } from '@/types/contract';

export function useHighlights(issues: ContractIssue[]) {
  const [selectedHighlight, setSelectedHighlight] = useState<ContractIssue | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onHighlightClick = useCallback((issue: ContractIssue) => {
    setSelectedHighlight(issue);
    setCurrentIndex(issues.findIndex(h => h.id === issue.id));
  }, [issues]);

  const onUpgradeHighlight = useCallback(() => {
    // Implementação do upgrade
  }, []);

  const onNextHighlight = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < issues.length) {
      setCurrentIndex(nextIndex);
      setSelectedHighlight(issues[nextIndex]);
    }
  }, [currentIndex, issues]);

  const onCloseHighlight = useCallback(() => {
    setSelectedHighlight(null);
  }, []);

  return {
    selectedHighlight,
    isFirstHighlight: currentIndex === 0,
    onHighlightClick,
    onUpgradeHighlight,
    onNextHighlight,
    onCloseHighlight
  };
}