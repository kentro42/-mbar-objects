import React from 'react';
import BinderRings from './BinderRings.jsx';
import BookState from './BookState.jsx';
import PageNavigation from './PageNavigation.jsx';
import PieceDetail from '../pieces/PieceDetail.jsx';

function spineLeft(screen, mode) {
  const width = mode === 'desktop' ? 36 : 40;
  if (screen === 'front-cover') return '0px';
  if (screen === 'back-cover') return `calc(100% - ${width}px)`;
  return mode === 'desktop' ? `calc(50% - ${width / 2}px)` : '0px';
}

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
  const restingOrUnderlay = turn ? to : from;
  const spineFrom = spineLeft(from.screen, displayMode);

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
        {renderState(restingOrUnderlay, { hidden: Boolean(turn || selectedItem), inert: Boolean(turn || selectedItem), layer: turn ? 'underlay' : 'resting' })}

        {turn && (
          <div
            className={`turn-leaf${turn.reduced ? ' turn-leaf--fade' : ''}`}
            ref={turnLeafRef}
            style={{ '--hinge-x': hinge }}
            data-turn-id={turn.id}
            data-reversing={String(turn.reversing)}
            data-from-screen={turn.from.screen}
            data-from-page={turn.from.page}
            data-to-screen={turn.to.screen}
            data-to-page={turn.to.page}
            aria-hidden="true"
            inert
          >
            <div className="turn-leaf__face turn-leaf__face--front">{renderState(from, { hidden: true, inert: true, layer: 'front' })}</div>
            <div className="turn-leaf__face turn-leaf__face--back">{renderState(to, { hidden: true, inert: true, layer: 'back' })}</div>
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
