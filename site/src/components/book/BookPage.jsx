import React from 'react';
import AlbumPage from '../pieces/AlbumPage.jsx';

export default function BookPage({ album, pageIndex, onOpenPiece, isPageTurning, label = 'page-face' }) {
  if (pageIndex < 0 || pageIndex >= Math.ceil(album.pieces.length / album.itemsPerPage)) {
    return <div className={`${label} page-face--blank`} data-page-index={pageIndex} data-page-state="blank" aria-hidden="true" />;
  }

  return (
    <div className={label} data-page-index={pageIndex}>
      <AlbumPage album={album} pageIndex={pageIndex} onOpenPiece={onOpenPiece} isPageTurning={isPageTurning} />
    </div>
  );
}
