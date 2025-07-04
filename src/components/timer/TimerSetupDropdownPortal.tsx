import React, { useEffect, useRef, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal for rendering dropdowns anchored to a reference element.
 *
 * @param children - The dropdown content
 * @param anchorRef - Ref to the anchor element
 * @param onRequestClose - Optional callback when dropdown should close
 *
 * @example
 * <TimerSetupDropdownPortal anchorRef={ref} onRequestClose={closeFn}>
 *   <DropdownContent />
 * </TimerSetupDropdownPortal>
 */
interface DropdownPortalProps {
  children: ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  onRequestClose?: () => void;
}

export const TimerSetupDropdownPortal: React.FC<DropdownPortalProps> = ({ children, anchorRef, onRequestClose }) => {
  const portalRef = useRef<HTMLDivElement>(null);

  // Per dev_guidelines: Use position: fixed for dropdown portals to prevent scroll jumps.
  // This ensures the dropdown is always positioned relative to the viewport, not the document or scroll position.
  // 1. useLayoutEffect: Scroll anchor into view if needed BEFORE dropdown is positioned
  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    if (
      anchorRect.bottom < 0 ||
      anchorRect.top > window.innerHeight ||
      anchorRect.right < 0 ||
      anchorRect.left > window.innerWidth
    ) {
      anchorRef.current.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [anchorRef.current]);

  // 2. useEffect: Position dropdown after anchor is in view
  useEffect(() => {
    if (!anchorRef.current || !portalRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const style = portalRef.current.style;
    style.position = 'fixed';
    style.left = `${anchorRect.left}px`;
    style.top = `${anchorRect.bottom + 4}px`;
    style.width = `${anchorRect.width}px`;
    style.zIndex = '9999';
    // Debug log
    console.log('[DropdownPortal] anchorRect:', anchorRect, 'computed left/top:', anchorRect.left, anchorRect.bottom + 4);
  }, [anchorRef.current, portalRef.current, children]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (portalRef.current && !portalRef.current.contains(e.target as Node) && onRequestClose) {
        onRequestClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onRequestClose]);


  return createPortal(
    <div ref={portalRef}>
      {children}
    </div>,
    document.body
  );
};
