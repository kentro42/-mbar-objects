import { useEffect } from 'react';
import { TOTAL_PAGES } from '../utils/albumRoutes.js';

export default function useAlbumKeyboard({ selectedItem, page, turnPage, animateDetailClose, turningRef }) {
  useEffect(() => {
    const onKeyDown = event => {
      if (selectedItem) {
        if (event.key === 'Escape') {
          event.preventDefault();
          if (window.history.state?.section === 'piece') window.history.back();
          else animateDetailClose();
          return;
        }
        if (event.key === 'Tab') {
          const focusables = [...document.querySelectorAll('.detail-sheet button:not([disabled]), .detail-sheet iframe, .detail-sheet [tabindex]:not([tabindex="-1"])')]
            .filter(element => element.getClientRects().length > 0);
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (event.shiftKey && (document.activeElement === first || !document.querySelector('.detail-sheet')?.contains(document.activeElement))) {
            event.preventDefault(); last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first.focus();
          }
        }
        return;
      }
      if (turningRef.current || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
      if (event.key === 'ArrowRight' && page < TOTAL_PAGES - 1) {
        event.preventDefault(); turnPage(page + 1, 'next');
      } else if (event.key === 'ArrowLeft' && page > 0) {
        event.preventDefault(); turnPage(page - 1, 'prev');
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedItem, page, turnPage, animateDetailClose, turningRef]);
}
