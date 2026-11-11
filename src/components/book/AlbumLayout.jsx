import React from 'react';
import BinderRings from './BinderRings.jsx';
import BookCover from './BookCover.jsx';
import BookPage from './BookPage.jsx';
import PageNavigation from './PageNavigation.jsx';
import PieceDetail from '../pieces/PieceDetail.jsx';

export default function AlbumLayout({
  stageRef, album, albums, mode, screen, page, turn, selectedItem,
  closingDetail, detailMotion, sourceElement, onOpenPiece, onOpenCover,
  onSelectAlbum, onPrevious, onNext, onPieceBack, onDetailTransitionEnd
}) {
  const desktop = mode === 'desktop';
  const pageCount = Math.max(1, Math.ceil(album.pieces.length / album.itemsPerPage));
  const isCover = screen !== 'pages';
  const ringSide = isCover ? (screen === 'back-cover' ? 'right' : 'left') : (desktop ? 'center' : 'left');
  const coverSide = screen === 'back-cover' ? 'back' : 'front';

  const renderPage = (pageIndex, label) => (
    <BookPage
      album={album}
      pageIndex={pageIndex}
      onOpenPiece={onOpenPiece}
      isPageTurning={Boolean(turn)}
      label={label}
    />
  );
  const renderCover = (side, inLeaf = false) => (
    <BookCover
      album={album}
      side={side}
      albums={albums}
      onOpen={onOpenCover}
      onSelectAlbum={onSelectAlbum}
      inLeaf={inLeaf}
    />
  );

  let leafFront = null;
  let leafBack = null;
  if (turn) {
    if (turn.fromScreen === 'front-cover') leafFront = renderCover('front', true);
    else if (turn.fromScreen === 'back-cover') leafFront = renderCover('back', true);
    else {
      const frontIndex = turn.direction === 'next' && desktop ? turn.fromPage + 1 : turn.fromPage;
      leafFront = renderPage(frontIndex, 'turn-leaf__content');
    }

    if (turn.toScreen === 'front-cover') leafBack = renderCover('front', true);
    else if (turn.toScreen === 'back-cover') leafBack = renderCover('back', true);
    else {
      const backIndex = turn.direction === 'prev' && desktop ? turn.toPage + 1 : turn.toPage;
      leafBack = renderPage(backIndex, 'turn-leaf__content');
    }
  }

  return (
    <div className="linen-backdrop">
      <main
        className={`stage stage--${isCover ? coverSide + '-cover' : 'open'} stage--${mode}`}
        id="stage"
        ref={stageRef}
        aria-label={`Álbum ${album.location}`}
        data-album-id={album.id}
      >
        <BinderRings side={ringSide} />

        {isCover ? (
          <div aria-hidden={Boolean(turn)} inert={Boolean(turn)}>{renderCover(coverSide)}</div>
        ) : (
          <div className={`book-spread${desktop ? ' book-spread--desktop' : ' book-spread--mobile'}`} aria-label="Libro abierto" aria-hidden={Boolean(turn || selectedItem)} inert={Boolean(turn || selectedItem)}>
            {renderPage(page, 'spread-page spread-page--left')}
            {desktop && renderPage(page + 1, 'spread-page spread-page--right')}
          </div>
        )}

        {turn && (
          <div
            className={`turn-leaf turn-leaf--${turn.direction}${desktop ? ' turn-leaf--desktop' : ' turn-leaf--mobile'}${turn.fromScreen === 'front-cover' ? ' turn-leaf--from-front' : ''}${turn.fromScreen === 'back-cover' ? ' turn-leaf--from-back' : ''}${turn.active ? ' turn-leaf--active' : ''}`}
            onTransitionEnd={event => {
              if (event.target === event.currentTarget && event.propertyName === 'transform') turn.onFinish?.();
            }}
            aria-hidden="true"
            inert
          >
            <div className="turn-leaf__face turn-leaf__face--front">{leafFront}</div>
            <div className="turn-leaf__face turn-leaf__face--back">{leafBack}</div>
          </div>
        )}

        {screen === 'pages' && (
          <PageNavigation
            album={album}
            mode={mode}
            screen={screen}
            page={page}
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
