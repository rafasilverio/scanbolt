import { useState, useCallback } from 'react';
import { Highlight } from '@/types/contract';

export function useHighlights(initialHighlights: Highlight[] = []) {
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);

  const handleHighlightClick = useCallback((highlight: Highlight) => {
    setSelectedHighlightId(highlight.id);
  }, []);

  const handleNextHighlight = useCallback(() => {
    if (!selectedHighlightId || !highlights.length) return;

    const currentIndex = highlights.findIndex(h => h.id === selectedHighlightId);
    const nextIndex = (currentIndex + 1) % highlights.length;
    setSelectedHighlightId(highlights[nextIndex].id);
  }, [highlights, selectedHighlightId]);

  const handleCloseHighlight = useCallback(() => {
    setSelectedHighlightId(null);
  }, []);

  return {
    highlights,
    selectedHighlightId,
    selectedHighlight: highlights.find(h => h.id === selectedHighlightId),
    onHighlightClick: handleHighlightClick,
    onNextHighlight: handleNextHighlight,
    onCloseHighlight: handleCloseHighlight
  };
}