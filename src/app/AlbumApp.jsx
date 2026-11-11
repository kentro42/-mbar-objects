import React, { useRef } from 'react';
import { albums } from '../albums/index.js';
import AlbumLayout from '../components/book/AlbumLayout.jsx';
import useAlbumMode from '../hooks/useBookMode.js';
import useAlbumNavigation from '../hooks/useAlbumNavigation.js';

export default function AlbumApp() {
  const stageRef = useRef(null);
  const mode = useAlbumMode();
  const book = useAlbumNavigation(albums, mode, stageRef);

  const goBackFromPiece = () => {
    if (window.history.state?.screen === 'piece') window.history.back();
    else book.animateDetailClose();
  };

  return (
    <AlbumLayout
      stageRef={stageRef}
      album={book.album}
      albums={albums}
      mode={mode}
      screen={book.screen}
      page={book.page}
      turn={book.turn ? { ...book.turn, onFinish: book.finishTurn } : null}
      selectedItem={book.selectedItem}
      closingDetail={book.closingDetail}
      detailMotion={book.detailMotion}
      sourceElement={book.sourceElementRef.current}
      onOpenPiece={book.openPiece}
      onOpenCover={book.openCover}
      onSelectAlbum={book.selectAlbum}
      onPrevious={() => book.navigate('prev')}
      onNext={() => book.navigate('next')}
      onPieceBack={goBackFromPiece}
      onDetailTransitionEnd={book.onDetailTransitionEnd}
    />
  );
}
