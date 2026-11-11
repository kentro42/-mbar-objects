import React from 'react';
import BookCover from './BookCover.jsx';
import BookPage from './BookPage.jsx';

export default function BookState({
  album, albums, screen, page, mode, onOpenPiece, onOpenCover, onSelectAlbum,
  ariaHidden = false, inert = false, isPageTurning = false, layer = 'resting', pageIndexes
}) {
  if (screen !== 'pages') {
    const side = screen === 'back-cover' ? 'back' : 'front';
    return (
      <div className={`book-state book-state--cover book-state--${side}`} data-book-state={layer} aria-hidden={ariaHidden} inert={inert}>
        <BookCover album={album} side={side} albums={albums} onOpen={onOpenCover} onSelectAlbum={onSelectAlbum} />
      </div>
    );
  }

  const desktop = mode === 'desktop';
  const leftPage = pageIndexes?.left ?? page;
  const rightPage = pageIndexes?.right ?? page + 1;
  return (
    <div className={`book-state book-state--spread${desktop ? ' book-state--desktop' : ' book-state--mobile'}`} data-book-state={layer} aria-label={`Hojas ${leftPage + 1}${desktop ? ` y ${rightPage + 1}` : ''}`} aria-hidden={ariaHidden} inert={inert}>
      <BookPage album={album} pageIndex={leftPage} onOpenPiece={onOpenPiece} isPageTurning={isPageTurning} label="spread-page spread-page--left" />
      {desktop && <BookPage album={album} pageIndex={rightPage} onOpenPiece={onOpenPiece} isPageTurning={isPageTurning} label="spread-page spread-page--right" />}
    </div>
  );
}
