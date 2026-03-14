import { useRef } from "react";

/**
 * useComposition
 * Handles IME (Input Method Editor) composition events for CJK language input.
 * Prevents premature form submission while the user is composing characters.
 */
export function useComposition<T extends HTMLInputElement | HTMLTextAreaElement>({
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
}: {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}) {
  const isComposing = useRef(false);

  const handleCompositionStart = (e: React.CompositionEvent<T>) => {
    isComposing.current = true;
    onCompositionStart?.(e);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<T>) => {
    isComposing.current = false;
    onCompositionEnd?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<T>) => {
    if (isComposing.current) return;
    onKeyDown?.(e);
  };

  return {
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  };
}
