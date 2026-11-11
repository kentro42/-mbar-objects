import React from 'react';
import BookCover from './BookCover.jsx';
import BookPage from './BookPage.jsx';

export default function BookState({
  album, albums, screen, page, mode, onOpenPiece, onOpenCover, onSelectAlbum,
  ariaHidden = false, inert = false, isPageTurning = false, layer = 'resting'
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
  return (
    <div className={`book-state book-state--spread${desktop ? ' book-state--desktop' : ' book-state--mobile'}`} data-book-state={layer} aria-label={`Hojas ${page + 1}${desktop ? ` y ${page + 2}` : ''}`} aria-hidden={ariaHidden} inert={inert}>
      <BookPage album={album} pageIndex={page} onOpenPiece={onOpenPiece} isPageTurning={isPageTurning} label="spread-page spread-page--left" />
      {desktop && <BookPage album={album} pageIndex={page + 1} onOpenPiece={onOpenPiece} isPageTurning={isPageTurning} label="spread-page spread-page--right" />}
    </div>
  );
}
