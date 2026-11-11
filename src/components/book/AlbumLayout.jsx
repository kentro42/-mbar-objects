import React from 'react';
import BinderRings from './BinderRings.jsx';
import BookState from './BookState.jsx';
import BookPage from './BookPage.jsx';
import PageNavigation from './PageNavigation.jsx';
import PieceDetail from '../pieces/PieceDetail.jsx';
import { getSpineLeft, getTurnLeafLayout } from '../../utils/pageTurn.js';

export default function AlbumLayout({
  stageRef, turnLeafRef, spineRef, album, albums, mode, screen, page, turn, selectedItem,
  closingDetail, detailMotion, sourceElement, onOpenPiece, onOpenCover,
  onSelectAlbum, onPrevious, onNext, onPieceBack, onDetailTransitionEnd,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture
}) {
  const displayMode = turn?.mode || mode;
  const pageCount = Math.max(1, Math.ceil(album.pieces.length / album.itemsPerPage));
  const from = turn?.from || { screen, page, albumId: album.id };
  const to = turn?.to || from;
  const isSpreadTurn = turn?.from.screen === 'pages' && turn?.to.screen === 'pages';
  const restingOrUnderlay = turn
    ? (isSpreadTurn && displayMode === 'mobile' && !turn.reduced ? from : to)
    : from;
  const stageWidth = stageRef.current?.clientWidth || 0;
  const spineFrom = getSpineLeft(from.screen, displayMode, stageWidth);
  const leafLayout = turn ? getTurnLeafLayout(turn) : null;
  const turningPageFrom = turn && displayMode === 'desktop'
    ? (turn.direction === 'next' ? turn.from.page + 1 : turn.from.page)
    : turn?.from.page;
  const turningPageTo = turn && displayMode === 'desktop'
    ? (turn.direction === 'next' ? turn.to.page : turn.to.page + 1)
    : turn?.to.page;
  const underlayPageIndexes = isSpreadTurn && displayMode === 'desktop' && !turn.reduced
    ? (turn.direction === 'next'
      ? { left: turn.from.page, right: turn.to.page + 1 }
      : { left: turn.to.page, right: turn.from.page + 1 })
    : undefined;

  const renderState = (position, options = {}) => (
    <BookState
      album={album}
      albums={albums}
      screen={position.screen}
      page={position.page}
      mode={turn?.mode || mode}
      onOpenPiece={onOpenPiece}
      onOpenCover={onOpenCover}
      onSelectAlbum={onSelectAlbum}
      ariaHidden={options.hidden}
      inert={options.inert}
      isPageTurning={Boolean(turn)}
      layer={options.layer}
      pageIndexes={options.pageIndexes}
    />
  );

  const hinge = from.screen === 'front-cover' ? '0%' : from.screen === 'back-cover' ? '100%' : displayMode === 'desktop' ? '50%' : '0%';
  const currentScreen = turn ? turn.from.screen : screen;
  const currentPage = turn ? turn.from.page : page;

  return (
    <div className="linen-backdrop">
      <main
        className={`stage stage--${currentScreen === 'pages' ? 'open' : currentScreen === 'back-cover' ? 'back-cover' : 'front-cover'} stage--${displayMode}`}
        id="stage"
        ref={stageRef}
        style={{ '--album-cover-color': album.coverColor || '#724d43' }}
        aria-label={`Álbum ${album.location}`}
        data-album-id={album.id}
        data-screen={currentScreen}
        onPointerDownCapture={onPointerDown}
        onPointerMoveCapture={onPointerMove}
        onPointerUpCapture={onPointerUp}
        onPointerCancelCapture={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        {renderState(restingOrUnderlay, {
          hidden: Boolean(turn || selectedItem),
          inert: Boolean(turn || selectedItem),
          layer: turn ? 'underlay' : 'resting',
          pageIndexes: underlayPageIndexes
        })}

        {turn && (
          <div
            className={`turn-leaf${isSpreadTurn ? ' turn-leaf--page' : ' turn-leaf--book'}${turn.reduced ? ' turn-leaf--fade' : ''}`}
            ref={turnLeafRef}
            style={isSpreadTurn
              ? { left: leafLayout.left, width: leafLayout.width, '--hinge-x': leafLayout.hinge }
              : { '--hinge-x': hinge }}
            data-turn-id={turn.id}
            data-direction={turn.direction}
            data-reversing={String(turn.reversing)}
            data-from-screen={turn.from.screen}
            data-from-page={turn.from.page}
            data-to-screen={turn.to.screen}
            data-to-page={turn.to.page}
            aria-hidden="true"
            inert
          >
            {isSpreadTurn ? (
              <>
                <div className="turn-leaf__face turn-leaf__face--front">
                  <BookPage album={album} pageIndex={turningPageFrom} onOpenPiece={onOpenPiece} isPageTurning label="turn-leaf__page" />
                </div>
                <div className="turn-leaf__face turn-leaf__face--back">
                  <BookPage album={album} pageIndex={turningPageTo} onOpenPiece={onOpenPiece} isPageTurning label="turn-leaf__page" />
                </div>
              </>
            ) : (
              <>
                <div className="turn-leaf__face turn-leaf__face--front">{renderState(from, { hidden: true, inert: true, layer: 'front' })}</div>
                <div className="turn-leaf__face turn-leaf__face--back">{renderState(to, { hidden: true, inert: true, layer: 'back' })}</div>
              </>
            )}
          </div>
        )}

        <BinderRings
          screen={currentScreen}
          mode={displayMode}
          moving={Boolean(turn)}
          from={turn?.spineFrom || spineFrom}
          nodeRef={spineRef}
        />

        {currentScreen === 'pages' && !turn && (
          <PageNavigation
            album={album}
            mode={displayMode}
            screen="pages"
            page={currentPage}
            pageCount={pageCount}
            turning={Boolean(turn || selectedItem)}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        )}

        {selectedItem && (
          <PieceDetail
            item={selectedItem}
            albumId={album.id}
            motion={detailMotion}
            closing={closingDetail}
            sourceElement={sourceElement}
            onBack={onPieceBack}
            onTransitionEnd={onDetailTransitionEnd}
          />
        )}
      </main>
      <p className="outside-note"><span>✳</span> hecho de recuerdos, no de prisa <span>✳</span></p>
    </div>
  );
}
