import React, { useRef, useEffect, useCallback } from 'react';

export interface UsePressOptions {
  onClick?: (e: React.PointerEvent) => void;
  onLongPress?: (e: React.PointerEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  longPressDelay?: number;
  moveThreshold?: number;
}

export function usePress({ onClick, onLongPress, onContextMenu, longPressDelay = 500, moveThreshold = 5 }: UsePressOptions) {
  const initialX = useRef(0);
  const initialY = useRef(0);
  const longPressTimeout = useRef<number>();
  const longPressTriggered = useRef(false);
  const dragging = useRef(false);

  const clear = () => {
    if (longPressTimeout.current) {
      window.clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
    dragging.current = false;
    longPressTriggered.current = false;
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    initialX.current = e.clientX;
    initialY.current = e.clientY;
    longPressTriggered.current = false;
    dragging.current = false;
    longPressTimeout.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress?.(e);
    }, longPressDelay);
  }, [onLongPress, longPressDelay]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - initialX.current;
    const dy = e.clientY - initialY.current;
    if (!dragging.current && Math.hypot(dx, dy) > moveThreshold) {
      dragging.current = true;
      if (longPressTimeout.current) {
        window.clearTimeout(longPressTimeout.current);
        longPressTimeout.current = undefined;
      }
    }
  }, [moveThreshold]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (longPressTimeout.current) {
      window.clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
    if (!longPressTriggered.current && !dragging.current) {
      onClick?.(e);
    }
    dragging.current = false;
    longPressTriggered.current = false;
  }, [onClick]);

  const handleContext = useCallback((e: React.MouseEvent) => {
    onContextMenu?.(e);
  }, [onContextMenu]);

  useEffect(() => clear, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onContextMenu: handleContext,
  };
}