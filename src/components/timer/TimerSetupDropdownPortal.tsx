import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  children: ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  onRequestClose?: () => void;
}

export const TimerSetupDropdownPortal: React.FC<DropdownPortalProps> = ({ children, anchorRef, onRequestClose }) => {
  const portalRef = useRef<HTMLDivElement>(null);

  // Position the dropdown under the anchor
  useEffect(() => {
    if (!anchorRef.current || !portalRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const style = portalRef.current.style;
    style.position = 'absolute';
    style.left = `${anchorRect.left + window.scrollX}px`;
    style.top = `${anchorRect.bottom + window.scrollY + 4}px`;
    style.width = `${anchorRect.width}px`;
    style.zIndex = '9999';
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
    <div ref={portalRef}>{children}</div>,
    document.body
  );
};
