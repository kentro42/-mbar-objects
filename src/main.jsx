import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CLOUD_NAME, objetos } from '../js/data.js';
import '../css/styles.css';

const PER_PAGE = 8;
const TOTAL_PAGES = Math.max(1, Math.ceil(objetos.length / PER_PAGE));
const IDENTITY_TRANSFORM = 'translate(0px, 0px) scale(1, 1)';
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function getPhotoUrl(photo) {
  if (!photo) return '';
  if (/^https:\/\//i.test(photo)) return photo;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${encodeURIComponent(photo)}`;
}

function getPageUrl(page) {
  return `${window.location.pathname}${window.location.search}#pagina-${page + 1}`;
}

function getPieceUrl(item) {
  return `${window.location.pathname}${window.location.search}#pieza-${encodeURIComponent(String(item.id))}`;
}

function getAbsolutePieceUrl(item) {
  return new URL(getPieceUrl(item), window.location.origin).href;
}

function getPageForPiece(item) {
  return Math.floor(objetos.findIndex(piece => String(piece.id) === String(item.id)) / PER_PAGE);
}

function readInitialRoute() {
  const pieceMatch = window.location.hash.match(/^#pieza-(.+)$/);
  if (pieceMatch) {
    try {
      const item = objetos.find(piece => String(piece.id) === decodeURIComponent(pieceMatch[1]));
      if (item) return { section: 'piece', item, page: getPageForPiece(item) };
    } catch {
      // Un hash mal codificado no debe impedir que el álbum se abra.
    }
  }
  const pageMatch = window.location.hash.match(/^#pagina-(\d+)$/);
  const page = pageMatch ? Number(pageMatch[1]) - 1 : 0;
  return { section: 'album', page: Math.max(0, Math.min(TOTAL_PAGES - 1, page)) };
}

function getZoomTransform(sourceElement, stageElement) {
  if (!sourceElement || !stageElement) return IDENTITY_TRANSFORM;
  const card = sourceElement.getBoundingClientRect();
  const stage = stageElement.getBoundingClientRect();
  const scaleX = card.width / Math.max(stage.width, 1);
  const scaleY = card.height / Math.max(stage.height, 1);
  const x = card.left - stage.left;
  const y = card.top - stage.top;
  return `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
}

function AlbumPage({ page, onOpenPiece, onTurnPage, isPageTurning }) {
  const pieces = objetos.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="page-content" data-page={page}>
      <header className="album-header">
        <div className="brand-mark" aria-label="Ámbar Casa Violeta Azul">
          <span className="brand-mark__ornament" aria-hidden="true">📷</span>
          <span>Ámbar · Casa Violeta Azul</span>
        </div>
        <p className="eyebrow">Cuaderno de cosas queridas <span>·</span> desde la casa</p>
        <h1>El álbum <em>de las piezas</em></h1>
        <p className="intro-note">Cada objeto tiene su rincón y algo que contar.</p>
      </header>

      <div className="page-stamp" aria-hidden="true">archivo<br />afectivo</div>
      <div className="paper-rule" aria-hidden="true"><span>✳</span></div>

      <section className="piece-grid" aria-label={`Piezas de la página ${page + 1}`}>
        {pieces.map((item, index) => {
          const photoUrl = getPhotoUrl(item.foto);
          return (
            <button
              className={`polaroid polaroid--${index % 6}`}
              key={item.id}
              type="button"
              data-piece-id={item.id}
              onClick={event => onOpenPiece(item, event.currentTarget)}
              aria-label={`Abrir ${item.tag}: ${item.title}`}
              disabled={isPageTurning}
            >
              <span className="polaroid__tape" aria-hidden="true" />
              <span className="polaroid__photo">
                {photoUrl ? (
                  <img src={photoUrl} alt={`Fotografía de ${item.title}`} loading="lazy" decoding="async" />
                ) : (
                  <span className="photo-pending">
                    <span className="photo-pending__flower" aria-hidden="true">✿</span>
                    <span>foto por pegar</span>
                  </span>
                )}
              </span>
              <span className="polaroid__caption">
                <span className="polaroid__number">{item.tag}</span>
                <span className="polaroid__title">{item.title}</span>
              </span>
            </button>
          );
        })}
      </section>

      <aside className="margin-note" aria-hidden="true">
        <span>mirar despacio</span>
        <span className="margin-note__star">✳</span>
      </aside>

      <nav className="page-navigation" aria-label="Páginas del álbum">
        <button id="prevBtn" type="button" onClick={() => onTurnPage(page - 1, 'prev')} disabled={page === 0 || isPageTurning} aria-label="Página anterior">
          <span aria-hidden="true">←</span> Anterior
        </button>
        <span className="page-count" aria-live="polite">hoja {String(page + 1).padStart(2, '0')} <span>de</span> {String(TOTAL_PAGES).padStart(2, '0')}</span>
        <button id="nextBtn" type="button" onClick={() => onTurnPage(page + 1, 'next')} disabled={page >= TOTAL_PAGES - 1 || isPageTurning} aria-label="Página siguiente">
          Siguiente <span aria-hidden="true">→</span>
        </button>
      </nav>
      <p className="page-colophon">colección de Ámbar <span>·</span> objetos con memoria</p>
    </div>
  );
}

function PieceDetail({ item, stageRef, motion, closing, sourceElement, onBack, onTransitionEnd }) {
  const [playing, setPlaying] = useState(false);
  const headingRef = useRef(null);
  const videoId = /^[A-Za-z0-9_-]{11}$/.test(item.video || '') ? item.video : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(getAbsolutePieceUrl(item))}`;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [item.id]);

  const cardPhoto = sourceElement?.querySelector('.polaroid__photo img')?.currentSrc;
  const imageStyle = cardPhoto ? { '--piece-photo': `url(${JSON.stringify(cardPhoto)})` } : undefined;

  return (
    <section
      className={`detail-sheet${motion.animated ? ' detail-sheet--animating' : ''}${closing ? ' detail-sheet--closing' : ''}`}
      style={{ transform: motion.transform, ...imageStyle }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      aria-describedby="detail-description"
      onTransitionEnd={onTransitionEnd}
      tabIndex={-1}
    >
      <div className="detail-toolbar">
        <button className="back-to-album" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> volver al álbum
        </button>
        <span className="detail-toolbar__label">nota de inventario <span>✳</span></span>
      </div>

      <div className={`piece-media${videoId ? ' piece-media--has-video' : ''}`}>
        {videoId ? (
          playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title={`Video de ${item.title}`}
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <>
              <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt={`Vista previa del video de ${item.title}`} />
              <button className="play-button" type="button" onClick={() => setPlaying(true)} aria-label={`Reproducir video de ${item.title}`}>
                <span aria-hidden="true">▶</span>
              </button>
              <span className="media-caption">un pequeño recuerdo en movimiento</span>
            </>
          )
        ) : (
          <div className="empty-media" aria-label="Esta pieza todavía no tiene video">
            <span className="empty-media__moon" aria-hidden="true">◌</span>
            <span>un espacio en silencio</span>
          </div>
        )}
      </div>

      <article className="piece-story">
        <div className="story-topline">
          <span>{item.year}</span><span>{item.categoria}</span><span>{item.origen}</span>
        </div>
        <div className="story-heading-row">
          <div>
            <p className="story-kicker">{item.tag} <span>·</span> una pieza de la casa</p>
            <h2 id="detail-title" ref={headingRef} tabIndex={-1}>{item.title}</h2>
            <p className="story-subtitle" id="detail-description">{item.subtitle}</p>
          </div>
          <span className="story-flower" aria-hidden="true">✿</span>
        </div>

        <dl className="piece-facts">
          <div><dt>Material</dt><dd>{item.material}</dd></div>
          <div><dt>Procedencia</dt><dd>{item.procedencia}</dd></div>
          <div><dt>Estado</dt><dd>{item.estado}</dd></div>
          <div><dt>Antes servía para</dt><dd>{item.uso}</dd></div>
        </dl>

        <div className="handwritten-copy">
          <p>{item.p1}</p>
          <p>{item.p2}</p>
        </div>

        <div className="story-footer">
          <div className="qr-card">
            <img src={qrUrl} alt={`Código QR único para ${item.tag}: ${item.title}`} width="112" height="112" loading="lazy" decoding="async" />
            <span>escanea para volver a esta historia</span>
          </div>
          <p className="signed-note">con cariño,<br /><span>Ámbar</span></p>
        </div>
      </article>
      <span className="detail-tape" aria-hidden="true" />
    </section>
  );
}

function App() {
  const initialRoute = useRef(readInitialRoute()).current;
  const [page, setPage] = useState(initialRoute.page);
  const [turn, setTurn] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [closingDetail, setClosingDetail] = useState(false);
  const [detailMotion, setDetailMotion] = useState({ transform: IDENTITY_TRANSFORM, animated: false });
  const stageRef = useRef(null);
  const sourceElementRef = useRef(null);
  const turnRef = useRef(null);
  const turningRef = useRef(false);
  const pendingPieceIdRef = useRef(null);
  const detailCloseTimerRef = useRef(null);
  const detailCloseCallbackRef = useRef(null);
  const isClosingRef = useRef(false);

  const openPiece = useCallback((item, sourceElement, { recordHistory = true } = {}) => {
    if (!sourceElement || turningRef.current || isClosingRef.current) return;
    if (recordHistory) {
      window.history.pushState({ section: 'piece', id: item.id, page }, '', getPieceUrl(item));
    }
    sourceElementRef.current = sourceElement;
    const startTransform = getZoomTransform(sourceElement, stageRef.current);
    setClosingDetail(false);
    setSelectedItem(item);
    setDetailMotion({ transform: startTransform, animated: false });
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      setDetailMotion({ transform: IDENTITY_TRANSFORM, animated: true });
    }));
  }, [page]);

  const finishTurn = useCallback(() => {
    const pending = turnRef.current;
    if (!pending) return;
    turnRef.current = null;
    turningRef.current = false;
    setTurn(null);
    setPage(pending.to);
    if (pending.recordHistory) {
      window.history.pushState({ section: 'album', page: pending.to }, '', getPageUrl(pending.to));
    }
    if (pending.focusId) {
      window.setTimeout(() => {
        const candidate = document.querySelector(`.page-content[data-page="${pending.to}"] #${pending.focusId}`);
        if (candidate && !candidate.disabled) candidate.focus({ preventScroll: true });
        else document.querySelector(`.page-content[data-page="${pending.to}"] h1`)?.focus({ preventScroll: true });
      }, 0);
    }
  }, []);

  const turnPage = useCallback((target, direction, { recordHistory = true } = {}) => {
    if (turningRef.current || target < 0 || target >= TOTAL_PAGES || target === page) return;
    const focusId = ['prevBtn', 'nextBtn'].includes(document.activeElement?.id) ? document.activeElement.id : null;
    if (REDUCED_MOTION.matches) {
      setPage(target);
      if (recordHistory) window.history.pushState({ section: 'album', page: target }, '', getPageUrl(target));
      return;
    }
    turningRef.current = true;
    const turnState = { from: page, to: target, direction, recordHistory, focusId };
    turnRef.current = turnState;
    setTurn(turnState);
  }, [page]);

  useEffect(() => {
    if (!turn) return undefined;
    const timeout = window.setTimeout(finishTurn, 1350);
    return () => window.clearTimeout(timeout);
  }, [turn, finishTurn]);

  const finishDetailClose = useCallback(() => {
    if (detailCloseTimerRef.current) window.clearTimeout(detailCloseTimerRef.current);
    detailCloseTimerRef.current = null;
    isClosingRef.current = false;
    setClosingDetail(false);
    setSelectedItem(null);
    const source = sourceElementRef.current;
    sourceElementRef.current = null;
    if (source?.isConnected) source.focus({ preventScroll: true });
    const callback = detailCloseCallbackRef.current;
    detailCloseCallbackRef.current = null;
    callback?.();
  }, []);

  const animateDetailClose = useCallback((onFinished = null) => {
    if (!selectedItem) {
      onFinished?.();
      return;
    }
    if (isClosingRef.current) {
      if (onFinished) detailCloseCallbackRef.current = onFinished;
      return;
    }
    isClosingRef.current = true;
    detailCloseCallbackRef.current = onFinished;
    const destination = getZoomTransform(sourceElementRef.current, stageRef.current);
    if (REDUCED_MOTION.matches || !sourceElementRef.current?.isConnected) {
      finishDetailClose();
      return;
    }
    setClosingDetail(true);
    setDetailMotion({ transform: destination, animated: true });
    detailCloseTimerRef.current = window.setTimeout(finishDetailClose, 850);
  }, [finishDetailClose, selectedItem]);

  const routeToPage = useCallback(targetPage => {
    const safePage = Math.max(0, Math.min(TOTAL_PAGES - 1, targetPage));
    if (safePage !== page) turnPage(safePage, safePage < page ? 'prev' : 'next', { recordHistory: false });
  }, [page, turnPage]);

  const routeToPiece = useCallback(item => {
    if (!item) return;
    const targetPage = getPageForPiece(item);
    if (targetPage !== page) {
      pendingPieceIdRef.current = String(item.id);
      turnPage(targetPage, targetPage < page ? 'prev' : 'next', { recordHistory: false });
      return;
    }
    const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(String(item.id))}"]`);
    if (card) openPiece(item, card, { recordHistory: false });
  }, [openPiece, page, turnPage]);

  const handleRouteChange = useCallback(routeState => {
    let route = routeState;
    if (!route || !['album', 'piece'].includes(route.section)) route = readInitialRoute();
    if (route.section === 'piece') {
      const item = objetos.find(piece => String(piece.id) === String(route.id)) || route.item;
      if (!item) return;
      const continueToPiece = () => routeToPiece(item);
      if (selectedItem) animateDetailClose(continueToPiece);
      else continueToPiece();
      return;
    }
    const targetPage = Number.isInteger(route.page) ? route.page : 0;
    const goToAlbum = () => routeToPage(targetPage);
    if (selectedItem) animateDetailClose(goToAlbum);
    else goToAlbum();
  }, [animateDetailClose, routeToPage, routeToPiece, selectedItem]);

  useEffect(() => {
    const state = { section: 'album', page: initialRoute.page };
    window.history.replaceState(state, '', getPageUrl(initialRoute.page));
    if (initialRoute.section === 'piece') {
      window.history.pushState({ section: 'piece', id: initialRoute.item.id, page: initialRoute.page }, '', getPieceUrl(initialRoute.item));
      window.requestAnimationFrame(() => {
        const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(String(initialRoute.item.id))}"]`);
        if (card) openPiece(initialRoute.item, card, { recordHistory: false });
      });
    }
    window.history.scrollRestoration = 'manual';
  // The initial URL is intentionally processed once, after the first React render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (turn || !pendingPieceIdRef.current) return;
    const id = pendingPieceIdRef.current;
    const item = objetos.find(piece => String(piece.id) === id);
    const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(id)}"]`);
    if (item && card) {
      pendingPieceIdRef.current = null;
      openPiece(item, card, { recordHistory: false });
    }
  }, [page, turn, openPiece]);

  useEffect(() => {
    const onPopState = event => handleRouteChange(event.state);
    const onHashChange = () => {
      const route = readInitialRoute();
      handleRouteChange(route.section === 'piece'
        ? { section: 'piece', id: route.item.id, page: route.page }
        : route);
    };
    const onKeyDown = event => {
      if (selectedItem) {
        if (event.key === 'Escape') {
          event.preventDefault();
          if (window.history.state?.section === 'piece') window.history.back();
          else animateDetailClose();
          return;
        }
        if (event.key === 'Tab') {
          const focusables = [...document.querySelectorAll('.detail-sheet button:not([disabled]), .detail-sheet iframe, .detail-sheet [tabindex]:not([tabindex="-1"])')]
            .filter(element => element.getClientRects().length > 0);
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (event.shiftKey && (document.activeElement === first || !document.querySelector('.detail-sheet')?.contains(document.activeElement))) {
            event.preventDefault(); last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first.focus();
          }
        }
        return;
      }
      if (turningRef.current || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
      if (event.key === 'ArrowRight' && page < TOTAL_PAGES - 1) {
        event.preventDefault(); turnPage(page + 1, 'next');
      } else if (event.key === 'ArrowLeft' && page > 0) {
        event.preventDefault(); turnPage(page - 1, 'prev');
      }
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedItem, page, turnPage, handleRouteChange, animateDetailClose]);

  const requestBackToAlbum = () => {
    if (window.history.state?.section === 'piece') window.history.back();
    else animateDetailClose();
  };

  const onDetailTransitionEnd = event => {
    if (event.target === event.currentTarget && event.propertyName === 'transform' && isClosingRef.current) {
      finishDetailClose();
    }
  };

  const style = turn ? { transform: turn.direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)' } : undefined;

  return (
    <div className="linen-backdrop">
      <main className="stage" id="stage" ref={stageRef} aria-label="Álbum de Ámbar Casa Violeta Azul">
        <div className="book-spine" aria-hidden="true">
          <div className="spine-label">Ámbar<br />archivo</div>
          <div className="binder-rings">{Array.from({ length: 7 }, (_, index) => <span key={index} />)}</div>
        </div>
        <div
          className={`leaf${turn ? ' leaf--turning' : ''}`}
          style={{ ...style, transformOrigin: turn?.direction === 'prev' ? 'right center' : 'left center' }}
          onTransitionEnd={event => {
            if (event.target === event.currentTarget && event.propertyName === 'transform') finishTurn();
          }}
        >
          <section className="side side--front" aria-label={`Página ${page + 1}`} aria-hidden={Boolean(turn || selectedItem)} inert={Boolean(turn || selectedItem)}>
            <AlbumPage page={page} onOpenPiece={openPiece} onTurnPage={turnPage} isPageTurning={Boolean(turn)} />
          </section>
          <section className="side side--back" aria-label={turn ? `Página ${turn.to + 1}` : 'Página siguiente'} aria-hidden={!turn} inert={!turn}>
            {turn && <AlbumPage page={turn.to} onOpenPiece={openPiece} onTurnPage={turnPage} isPageTurning />}
          </section>
        </div>

        {selectedItem && (
          <PieceDetail
            item={selectedItem}
            stageRef={stageRef}
            motion={detailMotion}
            closing={closingDetail}
            sourceElement={sourceElementRef.current}
            onBack={requestBackToAlbum}
            onTransitionEnd={onDetailTransitionEnd}
          />
        )}
      </main>
      <p className="outside-note"><span>✳</span> hecho de recuerdos, no de prisa <span>✳</span></p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
