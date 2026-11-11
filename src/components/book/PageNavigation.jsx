import React from 'react';

export default function PageNavigation({ album, mode, screen, page, pageCount, turning, onPrevious, onNext }) {
  const pageLabel = mode === 'desktop'
    ? `${String(page + 1).padStart(2, '0')}–${String(Math.min(page + 2, pageCount)).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}`
    : `${String(page + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}`;

  return (
    <nav className="page-navigation" aria-label={`Navegación de ${album.location}`}>
      <button id="prevBtn" type="button" onClick={onPrevious} disabled={turning} aria-label={screen === 'pages' && page === 0 ? 'Ver portada' : 'Página anterior'}>
        <span aria-hidden="true">←</span> {screen === 'pages' && page === 0 ? 'Portada' : 'Anterior'}
      </button>
      <span className="page-count" aria-live="polite">{screen === 'pages' ? pageLabel : 'cubierta'}</span>
      <button id="nextBtn" type="button" onClick={onNext} disabled={turning} aria-label={screen === 'pages' && page + (mode === 'desktop' ? 2 : 1) >= pageCount ? 'Ver contraportada' : 'Página siguiente'}>
        {screen === 'pages' && page + (mode === 'desktop' ? 2 : 1) >= pageCount ? 'Final' : 'Siguiente'} <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
