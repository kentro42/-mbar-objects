import React, { useRef } from 'react';
import AlbumLayout from '../components/AlbumLayout.jsx';
import AlbumPage from '../components/AlbumPage.jsx';
import PieceDetail from '../components/PieceDetail.jsx';
import useAlbumRouter from './useAlbumRouter.js';

export default function AppRouter() {
  const stageRef = useRef(null);
  const {
    page,
    turn,
    selectedItem,
    closingDetail,
    detailMotion,
    sourceElementRef,
    openPiece,
    turnPage,
    finishTurn,
    requestBackToAlbum,
    onDetailTransitionEnd
  } = useAlbumRouter(stageRef);

  return (
    <AlbumLayout
      stageRef={stageRef}
      page={page}
      turn={turn}
      selectedItem={selectedItem}
      onFinishTurn={finishTurn}
      frontPage={(
        <AlbumPage
          page={page}
          onOpenPiece={openPiece}
          onTurnPage={turnPage}
          isPageTurning={Boolean(turn)}
        />
      )}
      backPage={turn ? (
        <AlbumPage
          page={turn.to}
          onOpenPiece={openPiece}
          onTurnPage={turnPage}
          isPageTurning
        />
      ) : null}
      detail={selectedItem ? (
        <PieceDetail
          item={selectedItem}
          motion={detailMotion}
          closing={closingDetail}
          sourceElement={sourceElementRef.current}
          onBack={requestBackToAlbum}
          onTransitionEnd={onDetailTransitionEnd}
        />
      ) : null}
    />
  );
}
