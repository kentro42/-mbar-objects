const PER_PAGE = 8;
const TOTAL_PAGES = Math.max(1, Math.ceil(objetos.length / PER_PAGE));
const PAGE_TURN_FALLBACK_MS = 1300;
const DETAIL_ANIMATION_FALLBACK_MS = 700;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function readInitialRoute() {
  const pieceMatch = window.location.hash.match(/^#pieza-(.+)$/);
  if (pieceMatch) {
    const idText = decodeURIComponent(pieceMatch[1]);
    const piece = objetos.find(item => String(item.id) === idText);
    if (piece) return { section: 'piece', piece };
  }
  const pageMatch = window.location.hash.match(/^#pagina-(\d+)$/);
  const requestedPage = pageMatch ? Number(pageMatch[1]) - 1 : 0;
  return { section: 'album', page: Math.max(0, Math.min(TOTAL_PAGES - 1, requestedPage)) };
}

const initialRoute = readInitialRoute();
let currentPage = initialRoute.section === 'piece'
  ? Math.floor(objetos.indexOf(initialRoute.piece) / PER_PAGE)
  : initialRoute.page;
let isTurning = false;
let pageTurnTimer = null;
let pageTurnFrame = null;
let pageTurnHandler = null;
let focusAfterTurn = null;
let lastZoom = null;
let focusReturnElement = null;
let detailCloseTimer = null;
let detailCloseHandler = null;
let detailOpenFrame = null;
let isDetailClosing = false;
let afterDetailClose = null;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function getFotoUrl(foto) {
  if (!foto) return '';
  if (/^https:\/\//i.test(foto)) return foto;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${encodeURIComponent(foto)}`;
}

function getAppPath() {
  return `${window.location.pathname}${window.location.search}`;
}

function getPageUrl(pageIndex) {
  return `${getAppPath()}#pagina-${pageIndex + 1}`;
}

function getPieceUrl(item) {
  return `${getAppPath()}#pieza-${encodeURIComponent(String(item.id))}`;
}

function getAbsolutePieceUrl(item) {
  return new URL(getPieceUrl(item), window.location.origin).href;
}

function pageItems(pageIndex) {
  return objetos.slice(pageIndex * PER_PAGE, pageIndex * PER_PAGE + PER_PAGE);
}

function buildPageHTML(pageIndex) {
  const items = pageItems(pageIndex);
  const cards = items.map(item => {
    const imageUrl = getFotoUrl(item.foto);
    const image = imageUrl
      ? `<img src="${escapeHTML(imageUrl)}" alt="" loading="lazy" decoding="async">`
      : '';

    return `
      <button class="polaroid" type="button" data-id="${escapeHTML(item.id)}" aria-label="Abrir ${escapeHTML(item.tag)}: ${escapeHTML(item.title)}">
        <span class="shot" aria-hidden="true">${image}</span>
        <span class="num">${escapeHTML(item.tag)}</span>
      </button>
    `;
  }).join('');

  const previousDisabled = pageIndex === 0;
  const nextDisabled = pageIndex >= TOTAL_PAGES - 1;

  return `
    <header class="home-header">
      <div class="mark">Ambar Casa Violeta Azul</div>
      <h1 tabindex="-1">El Álbum</h1>
      <p class="sub">Selecciona una fotografía para ver la pieza</p>
    </header>
    <div class="grid">${cards}</div>
    <nav class="pager" aria-label="Páginas del álbum">
      <button id="prevBtn" type="button" aria-label="Ir a la página anterior" ${previousDisabled ? 'disabled' : ''}>‹ Anterior</button>
      <span class="count" role="status" aria-live="polite" aria-atomic="true">Página ${pageIndex + 1} de ${TOTAL_PAGES}</span>
      <button id="nextBtn" type="button" aria-label="Ir a la página siguiente" ${nextDisabled ? 'disabled' : ''}>Siguiente ›</button>
    </nav>
  `;
}

const frontSide = document.getElementById('frontSide');
const backSide = document.getElementById('backSide');
const leaf = document.getElementById('leaf');
const overlay = document.getElementById('overlay');
const mediaBox = document.getElementById('mediaBox');
const detailContent = document.getElementById('detailContent');
const closeBtn = document.getElementById('closeBtn');
const stage = document.getElementById('stage');

function attachPageEvents(container, pageIndex) {
  container.querySelectorAll('.polaroid').forEach(button => {
    button.addEventListener('click', () => openDetail(button.dataset.id, button));
  });
  const previous = container.querySelector('#prevBtn');
  const next = container.querySelector('#nextBtn');
  if (previous) previous.addEventListener('click', () => turnPage(pageIndex - 1, 'prev'));
  if (next) next.addEventListener('click', () => turnPage(pageIndex + 1, 'next'));
}

function renderInitial() {
  frontSide.innerHTML = buildPageHTML(currentPage);
  frontSide.scrollTop = 0;
  frontSide.setAttribute('aria-hidden', 'false');
  frontSide.inert = false;
  backSide.innerHTML = '';
  backSide.setAttribute('aria-hidden', 'true');
  backSide.inert = true;
  attachPageEvents(frontSide, currentPage);
}

function finishPageTurn(targetPage, recordHistory, onFinished) {
  if (!isTurning) return;
  if (pageTurnTimer !== null) clearTimeout(pageTurnTimer);
  pageTurnTimer = null;
  if (pageTurnFrame !== null) cancelAnimationFrame(pageTurnFrame);
  pageTurnFrame = null;
  if (pageTurnHandler) leaf.removeEventListener('transitionend', pageTurnHandler);
  pageTurnHandler = null;

  currentPage = targetPage;
  // La página que ya se veía en el reverso pasa a ser el frente: no se vuelve a
  // construir en mitad del giro, evitando un destello/retardo al acabar.
  frontSide.innerHTML = backSide.innerHTML;
  frontSide.scrollTop = 0;
  attachPageEvents(frontSide, currentPage);
  backSide.innerHTML = '';
  frontSide.setAttribute('aria-hidden', 'false');
  frontSide.inert = false;
  backSide.setAttribute('aria-hidden', 'true');
  backSide.inert = true;

  leaf.style.transition = 'none';
  leaf.style.transform = 'rotateY(0deg)';
  leaf.style.transformOrigin = '';
  void leaf.offsetHeight;
  leaf.style.transition = '';
  leaf.classList.remove('turning');
  isTurning = false;

  if (recordHistory) {
    history.pushState({ section: 'album', page: currentPage }, '', getPageUrl(currentPage));
  }
  const preferred = focusAfterTurn ? frontSide.querySelector(`#${focusAfterTurn}`) : null;
  if (preferred && !preferred.disabled) preferred.focus({ preventScroll: true });
  else if (focusAfterTurn) frontSide.querySelector('h1')?.focus({ preventScroll: true });
  focusAfterTurn = null;
  onFinished?.();
}

function turnPage(targetPage, direction, { recordHistory = true, onFinished = null } = {}) {
  if (isTurning || targetPage < 0 || targetPage >= TOTAL_PAGES || targetPage === currentPage) return;
  isTurning = true;
  const activeId = document.activeElement?.id;
  focusAfterTurn = activeId === 'prevBtn' || activeId === 'nextBtn' ? activeId : null;

  // Preparar la página destino antes de empezar a girar; queda disponible en el
  // reverso durante todo el movimiento, no se renderiza al terminarlo.
  backSide.innerHTML = buildPageHTML(targetPage);
  backSide.scrollTop = 0;
  attachPageEvents(backSide, targetPage);
  frontSide.setAttribute('aria-hidden', 'true');
  frontSide.inert = true;
  backSide.setAttribute('aria-hidden', 'true');
  backSide.inert = true;
  frontSide.querySelectorAll('button').forEach(button => { button.disabled = true; });

  leaf.style.transformOrigin = direction === 'next' ? 'left center' : 'right center';
  leaf.classList.add('turning');
  void leaf.offsetHeight;
  pageTurnHandler = event => {
    if (event.target === leaf && event.propertyName === 'transform') {
      finishPageTurn(targetPage, recordHistory, onFinished);
    }
  };
  leaf.addEventListener('transitionend', pageTurnHandler);
  pageTurnTimer = window.setTimeout(
    () => finishPageTurn(targetPage, recordHistory, onFinished),
    PAGE_TURN_FALLBACK_MS
  );

  const destination = direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)';
  if (reduceMotion.matches) {
    leaf.style.transform = destination;
    finishPageTurn(targetPage, recordHistory, onFinished);
    return;
  }
  pageTurnFrame = requestAnimationFrame(() => {
    pageTurnFrame = null;
    if (isTurning) leaf.style.transform = destination;
  });
}

function makeQRHTML(item) {
  const pieceUrl = getAbsolutePieceUrl(item);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(pieceUrl)}`;
  return `<section class="qr-box" aria-label="Código QR de ${escapeHTML(item.tag)}">
    <img src="${qrImageUrl}" alt="Código QR único para ${escapeHTML(item.tag)}: ${escapeHTML(item.title)}" width="180" height="180" loading="lazy" decoding="async">
    <span>QR ${escapeHTML(item.tag)}</span>
  </section>`;
}

function getZoomTransform(sourceElement) {
  const sourceRect = sourceElement.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const width = Math.max(1, overlay.clientWidth);
  const height = Math.max(1, overlay.clientHeight);
  return {
    scaleX: sourceRect.width / width,
    scaleY: sourceRect.height / height,
    translateX: sourceRect.left - stageRect.left,
    translateY: sourceRect.top - stageRect.top
  };
}

function openDetail(id, sourceElement, { recordHistory = true } = {}) {
  if (isTurning || isDetailClosing) return;
  const item = objetos.find(object => String(object.id) === String(id));
  if (!item || !sourceElement) return;

  if (detailCloseTimer !== null) clearTimeout(detailCloseTimer);
  detailCloseTimer = null;
  if (detailCloseHandler) overlay.removeEventListener('transitionend', detailCloseHandler);
  detailCloseHandler = null;
  if (detailOpenFrame !== null) cancelAnimationFrame(detailOpenFrame);
  isDetailClosing = false;

  focusReturnElement = sourceElement;
  const safeTitle = escapeHTML(item.title);
  const videoId = /^[A-Za-z0-9_-]{11}$/.test(item.video || '') ? item.video : '';
  if (videoId) {
    mediaBox.innerHTML = `
      <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="Vista previa del video de ${safeTitle}" loading="lazy" decoding="async">
      <button class="play" id="playBtn" type="button" aria-label="Reproducir video de ${safeTitle}"></button>`;
  } else {
    // Sin video asignado, el reproductor permanece completamente negro.
    mediaBox.innerHTML = '<div class="media-placeholder" aria-hidden="true"></div>';
  }

  detailContent.className = 'content';
  detailContent.innerHTML = `
    <div class="eyebrow-row"><span>${escapeHTML(item.year)}</span><span>${escapeHTML(item.categoria)}</span><span>${escapeHTML(item.origen)}</span></div>
    <h2 class="title" id="detailTitle">${safeTitle}</h2>
    <p class="subtitle" id="detailDescription">${escapeHTML(item.subtitle)}</p>
    <dl class="facts">
      <div class="fact"><dt>Material</dt><dd>${escapeHTML(item.material)}</dd></div>
      <div class="fact"><dt>Procedencia</dt><dd>${escapeHTML(item.procedencia)}</dd></div>
      <div class="fact"><dt>Estado</dt><dd>${escapeHTML(item.estado)}</dd></div>
      <div class="fact"><dt>Uso original</dt><dd>${escapeHTML(item.uso)}</dd></div>
    </dl>
    <p class="body">${escapeHTML(item.p1)}</p>
    <p class="body">${escapeHTML(item.p2)}</p>
    ${makeQRHTML(item)}
  `;

  if (recordHistory) {
    history.pushState({ section: 'piece', id: item.id, page: currentPage }, '', getPieceUrl(item));
  }

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.scrollTop = 0;
  leaf.setAttribute('aria-hidden', 'true');
  leaf.inert = true;

  const zoom = getZoomTransform(sourceElement);
  lastZoom = { sourceElement };
  const cardImage = sourceElement.querySelector('.shot img');
  if (cardImage?.currentSrc) {
    overlay.style.setProperty('--piece-photo', `url(${JSON.stringify(cardImage.currentSrc)})`);
    overlay.classList.add('opening-from-polaroid');
  }
  overlay.style.transition = 'none';
  overlay.style.transform = `translate(${zoom.translateX}px, ${zoom.translateY}px) scale(${zoom.scaleX}, ${zoom.scaleY})`;
  void overlay.offsetHeight;
  detailOpenFrame = requestAnimationFrame(() => {
    detailOpenFrame = null;
    overlay.style.transition = '';
    overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
    overlay.classList.remove('opening-from-polaroid');
    detailContent.classList.add('show');
  });

  const playButton = document.getElementById('playBtn');
  if (playButton && videoId) {
    playButton.addEventListener('click', () => {
      mediaBox.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" title="Video de ${safeTitle}" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    }, { once: true });
  }
  closeBtn.focus({ preventScroll: true });
}

function finishCloseDetail() {
  if (detailCloseTimer !== null) clearTimeout(detailCloseTimer);
  detailCloseTimer = null;
  if (detailCloseHandler) overlay.removeEventListener('transitionend', detailCloseHandler);
  detailCloseHandler = null;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.transform = '';
  overlay.style.transition = '';
  overlay.classList.remove('opening-from-polaroid', 'closing-to-polaroid');
  overlay.style.removeProperty('--piece-photo');
  mediaBox.innerHTML = ''; // Elimina el iframe y detiene la reproducción.
  lastZoom = null;
  isDetailClosing = false;
  leaf.removeAttribute('aria-hidden');
  leaf.inert = false;

  if (focusReturnElement?.isConnected) focusReturnElement.focus({ preventScroll: true });
  focusReturnElement = null;
  const callback = afterDetailClose;
  afterDetailClose = null;
  callback?.();
}

function animateCloseDetail(onFinished = null) {
  if (!overlay.classList.contains('show')) {
    onFinished?.();
    return;
  }
  if (isDetailClosing) {
    if (onFinished) afterDetailClose = onFinished;
    return;
  }
  isDetailClosing = true;
  afterDetailClose = onFinished;
  if (detailOpenFrame !== null) cancelAnimationFrame(detailOpenFrame);
  detailOpenFrame = null;
  detailContent.classList.remove('show');

  const sourceElement = lastZoom?.sourceElement;
  if (!sourceElement?.isConnected || reduceMotion.matches) {
    finishCloseDetail();
    return;
  }
  // Medir de nuevo permite que la tarjeta destino coincida aunque haya cambiado
  // el tamaño de pantalla o la posición de scroll desde que se abrió el detalle.
  const zoom = getZoomTransform(sourceElement);
  const cardImage = sourceElement.querySelector('.shot img');
  if (cardImage?.currentSrc) {
    overlay.style.setProperty('--piece-photo', `url(${JSON.stringify(cardImage.currentSrc)})`);
    overlay.classList.add('closing-to-polaroid');
  }
  detailCloseHandler = event => {
    if (event.target === overlay && event.propertyName === 'transform') finishCloseDetail();
  };
  overlay.addEventListener('transitionend', detailCloseHandler);
  overlay.style.transform = `translate(${zoom.translateX}px, ${zoom.translateY}px) scale(${zoom.scaleX}, ${zoom.scaleY})`;
  detailCloseTimer = window.setTimeout(finishCloseDetail, DETAIL_ANIMATION_FALLBACK_MS);
}

function requestBackFromDetail() {
  if (!overlay.classList.contains('show') || isDetailClosing) return;
  // Cada ficha se abre con una entrada propia del historial, así el botón Atrás
  // del navegador/móvil vuelve al álbum mediante la misma animación inversa.
  if (history.state?.section === 'piece') history.back();
  else animateCloseDetail();
}

function findCard(id) {
  return [...frontSide.querySelectorAll('.polaroid')]
    .find(card => String(card.dataset.id) === String(id));
}

function handlePopState(event) {
  const route = event.state;
  if (route?.section === 'piece') {
    const item = objetos.find(object => String(object.id) === String(route.id));
    if (!item) return;
    const targetPage = Math.floor(objetos.indexOf(item) / PER_PAGE);
    const showPiece = () => {
      const card = findCard(item.id);
      if (card) openDetail(item.id, card, { recordHistory: false });
    };
    if (overlay.classList.contains('show')) animateCloseDetail(showPiece);
    else if (targetPage !== currentPage) {
      turnPage(targetPage, targetPage > currentPage ? 'next' : 'prev', { recordHistory: false, onFinished: showPiece });
    } else showPiece();
    return;
  }

  const targetPage = Number.isInteger(route?.page)
    ? Math.max(0, Math.min(TOTAL_PAGES - 1, route.page))
    : 0;
  const showAlbumPage = () => {
    if (targetPage !== currentPage) {
      turnPage(targetPage, targetPage > currentPage ? 'next' : 'prev', { recordHistory: false });
    }
  };
  if (overlay.classList.contains('show')) animateCloseDetail(showAlbumPage);
  else showAlbumPage();
}

function handleHashChange() {
  const route = readInitialRoute();
  if (route.section === 'piece') {
    const item = route.piece;
    if (history.state?.section === 'piece' && String(history.state.id) === String(item.id)) return;
    const targetPage = Math.floor(objetos.indexOf(item) / PER_PAGE);
    history.replaceState({ section: 'piece', id: item.id, page: targetPage }, '', getPieceUrl(item));
    const showPiece = () => {
      const card = findCard(item.id);
      if (card) openDetail(item.id, card, { recordHistory: false });
    };
    if (overlay.classList.contains('show')) animateCloseDetail(showPiece);
    else if (targetPage !== currentPage) {
      turnPage(targetPage, targetPage > currentPage ? 'next' : 'prev', { recordHistory: false, onFinished: showPiece });
    } else showPiece();
    return;
  }

  const targetPage = route.page;
  if (history.state?.section === 'album' && history.state.page === targetPage && !overlay.classList.contains('show')) return;
  history.replaceState({ section: 'album', page: targetPage }, '', getPageUrl(targetPage));
  const showPage = () => {
    if (targetPage !== currentPage) {
      turnPage(targetPage, targetPage > currentPage ? 'next' : 'prev', { recordHistory: false });
    }
  };
  if (overlay.classList.contains('show')) animateCloseDetail(showPage);
  else showPage();
}

function initializeHistory() {
  // Una URL QR abierta directamente gana una entrada previa de álbum: Atrás
  // cierra el detalle en vez de abandonar inmediatamente el sitio.
  history.replaceState({ section: 'album', page: currentPage }, '', getPageUrl(currentPage));
  if (initialRoute.section === 'piece') {
    const item = initialRoute.piece;
    history.pushState({ section: 'piece', id: item.id, page: currentPage }, '', getPieceUrl(item));
    const card = findCard(item.id);
    if (card) openDetail(item.id, card, { recordHistory: false });
  }
}

renderInitial();
initializeHistory();
history.scrollRestoration = 'manual';
window.addEventListener('popstate', handlePopState);
window.addEventListener('hashchange', handleHashChange);
closeBtn.addEventListener('click', requestBackFromDetail);

document.addEventListener('keydown', event => {
  const dialogOpen = overlay.classList.contains('show');
  if (dialogOpen) {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestBackFromDetail();
      return;
    }
    if (event.key === 'Tab') {
      const focusables = [...overlay.querySelectorAll('button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])')]
        .filter(element => element.getClientRects().length > 0);
      if (!focusables.length) {
        event.preventDefault();
        overlay.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === overlay)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
    return;
  }

  if (isTurning || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
  if (event.key === 'ArrowRight' && currentPage < TOTAL_PAGES - 1) {
    event.preventDefault();
    turnPage(currentPage + 1, 'next');
  } else if (event.key === 'ArrowLeft' && currentPage > 0) {
    event.preventDefault();
    turnPage(currentPage - 1, 'prev');
  }
});
