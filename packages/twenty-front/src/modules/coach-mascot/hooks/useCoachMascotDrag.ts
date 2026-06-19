import { useCallback, useEffect, useRef, useState } from 'react';

type UseCoachMascotDragOptions = {
  onDelta: (dx: number, dy: number) => void;
  onDragEnd: () => void;
};

// Drag handler for the floating CoachMascot.
//
// Tracks the cursor position from mousedown; on each subsequent
// mousemove, computes the per-event delta and forwards it via
// `onDelta`. The hook maintains its own "last position" ref so the
// caller doesn't need to.
//
// On mouseup, fires `onDragEnd`. Listeners are attached only while
// dragging is active, so idle state has zero overhead.
//
// Suppression: a drag is also implicitly distinguished from a click by
// `isDragging` — the consumer should check `isDragging` before treating
// a mouseup as a click (see CoachMascot.tsx).
export const useCoachMascotDrag = ({
  onDelta,
  onDragEnd,
}: UseCoachMascotDragOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      lastPositionRef.current = { x: event.clientX, y: event.clientY };
      setIsDragging(true);
    },
    [],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const last = lastPositionRef.current;
      if (!last) return;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      lastPositionRef.current = { x: event.clientX, y: event.clientY };
      if (dx !== 0 || dy !== 0) onDelta(dx, dy);
    };

    const handleMouseUp = () => {
      lastPositionRef.current = null;
      setIsDragging(false);
      onDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDelta, onDragEnd]);

  return { isDragging, handleMouseDown };
};