import React from 'react';
import BookCover from './BookCover.jsx';
import BookPage from './BookPage.jsx';
import { getPublicAssetUrl } from '../../utils/albumRoutes.js';

export default function BookState({
  album, screen, page, mode, onOpenPiece, onOpenCover, onReturnToStart, onReturnToPrevious,
  ariaHidden = false, inert = false, isPageTurning = false, layer = 'resting', pageIndexes
}) {
  if (screen !== 'pages') {
    const side = screen === 'back-cover' ? 'back' : 'front';
    return (
      <div className={`book-state book-state--cover book-state--${side}`} data-book-state={layer} aria-hidden={ariaHidden} inert={inert}>
        <BookCover
          album={album}
          side={side}
          onOpen={onOpenCover}
          onReturnToStart={onReturnToStart}
          onReturnToPrevious={onReturnToPrevious}
        />
      </div>
    );
  }

  const desktop = mode === 'desktop';
  const leftPage = pageIndexes?.left ?? page;
  const rightPage = pageIndexes?.right ?? page + 1;
  const pageMark = album.branding?.pageMark ? getPublicAssetUrl(album.branding.pageMark) : '';
  return (
    <div className={`book-state book-state--spread${desktop ? ' book-state--desktop' : ' book-state--mobile'}`} data-book-state={layer} aria-label={`Hojas ${leftPage + 1}${desktop ? ` y ${rightPage + 1}` : ''}`} aria-hidden={ariaHidden} inert={inert}>
      <BookPage album={album} pageIndex={leftPage} onOpenPiece={onOpenPiece} isPageTurning={isPageTurning} label="spread-page spread-page--left" />
      {desktop && <BookPage album={album} pageIndex={rightPage} onOpenPiece={onOpenPiece} isPageTurning={isPageTurning} label="spread-page spread-page--right" />}
      {pageMark && <img className="spread-mark" src={pageMark} alt="Emblema en rombo de Ámbar Tu Casa" loading="lazy" decoding="async" draggable="false" />}
    </div>
  );
}
