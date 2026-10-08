const PER_PAGE = 8;
const TOTAL_PAGES = Math.max(1, Math.ceil(objetos.length / PER_PAGE));
const PAGE_TURN_MS = 1100;
const PAGE_TURN_FALLBACK_MS = PAGE_TURN_MS + 180;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let currentPage = 0;
let isTurning = false;
let pageTurnTimer = null;
let pageTurnFrame = null;
let focusAfterTurn = null;
let lastScale = null;
let focusReturnElement = null;
let detailCloseTimer = null;
let detailCloseHandler = null;
let detailOpenFrame = null;
let isDetailClosing = false;

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
      <button class="polaroid" type="button" data-id="${Number(item.id)}" aria-label="Abrir ${escapeHTML(item.tag)}: ${escapeHTML(item.title)}">
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
    button.addEventListener('click', () => openDetail(Number(button.dataset.id), button));
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

function finishPageTurn(targetPage, onTransitionEnd) {
  if (!isTurning) return;
  if (pageTurnTimer !== null) clearTimeout(pageTurnTimer);
  pageTurnTimer = null;
  if (pageTurnFrame !== null) cancelAnimationFrame(pageTurnFrame);
  pageTurnFrame = null;
  if (onTransitionEnd) leaf.removeEventListener('transitionend', onTransitionEnd);

  currentPage = targetPage;
  frontSide.innerHTML = buildPageHTML(currentPage);
  frontSide.scrollTop = 0;
  attachPageEvents(frontSide, currentPage);
  backSide.innerHTML = '';
  frontSide.setAttribute('aria-hidden', 'false');
  frontSide.inert = false;
  backSide.setAttribute('aria-hidden', 'true');
  backSide.inert = true;

  // Restablecer la hoja sin animar el retorno a su posición inicial.
  leaf.style.transition = 'none';
  leaf.style.transform = 'rotateY(0deg)';
  leaf.style.transformOrigin = '';
  void leaf.offsetHeight;
  leaf.style.transition = '';
  leaf.classList.remove('turning');
  isTurning = false;

  const preferred = focusAfterTurn ? frontSide.querySelector(`#${focusAfterTurn}`) : null;
  if (preferred && !preferred.disabled) {
    preferred.focus({ preventScroll: true });
  } else if (focusAfterTurn) {
    const heading = frontSide.querySelector('h1');
    heading?.focus({ preventScroll: true });
  }
  focusAfterTurn = null;
}

function turnPage(targetPage, direction) {
  if (isTurning || targetPage < 0 || targetPage >= TOTAL_PAGES) return;

  isTurning = true;
  const activeId = document.activeElement?.id;
  focusAfterTurn = activeId === 'prevBtn' || activeId === 'nextBtn'
    ? activeId
    : null;

  backSide.innerHTML = buildPageHTML(targetPage);
  backSide.scrollTop = 0;
  attachPageEvents(backSide, targetPage);
  frontSide.setAttribute('aria-hidden', 'true');
  frontSide.inert = true;
  backSide.setAttribute('aria-hidden', 'true');
  backSide.inert = true;
  frontSide.querySelectorAll('button').forEach(button => { button.disabled = true; });
  backSide.querySelectorAll('button').forEach(button => { button.disabled = true; });

  leaf.style.transformOrigin = direction === 'next' ? 'left center' : 'right center';
  leaf.classList.add('turning');
  void leaf.offsetHeight;

  const onTransitionEnd = event => {
    if (event.target === leaf && event.propertyName === 'transform') {
      finishPageTurn(targetPage, onTransitionEnd);
    }
  };
  leaf.addEventListener('transitionend', onTransitionEnd);
  // El temporizador evita bloquear la interfaz si el navegador omite transitionend.
  pageTurnTimer = window.setTimeout(() => finishPageTurn(targetPage, onTransitionEnd), PAGE_TURN_FALLBACK_MS);

  if (reduceMotion.matches) {
    leaf.style.transform = direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)';
    finishPageTurn(targetPage, onTransitionEnd);
    return;
  }

  pageTurnFrame = requestAnimationFrame(() => {
    pageTurnFrame = null;
    if (isTurning) {
      leaf.style.transform = direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)';
    }
  });
}

renderInitial();

/* ---------- Detalle accesible con zoom ---------- */
function makeQRHTML(pageUrl) {
  return `<div class="qr-box">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(pageUrl)}" alt="Código QR para abrir este álbum">
    <span>QR Pieza 001</span>
  </div>`;
}

function openDetail(id, sourceElement) {
  if (isTurning) return;
  const item = objetos.find(object => object.id === id);
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
  const thumbnail = videoId
    ? `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="Vista previa del video de ${safeTitle}" loading="lazy">`
    : `<div class="media-placeholder" role="status">Video no disponible</div>`;
  const playControl = videoId
    ? `<button class="play" id="playBtn" type="button" aria-label="Reproducir video de ${safeTitle}"></button>`
    : '';

  mediaBox.innerHTML = `${thumbnail}${playControl}`;
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
    ${item.id === 1 ? makeQRHTML(window.location.href) : ''}
  `;

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.scrollTop = 0;
  leaf.setAttribute('aria-hidden', 'true');
  leaf.inert = true;
  overlay.style.transition = 'none';

  const sourceRect = sourceElement.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const width = Math.max(1, overlay.clientWidth);
  const height = Math.max(1, overlay.clientHeight);
  const scaleX = sourceRect.width / width;
  const scaleY = sourceRect.height / height;
  const translateX = sourceRect.left - stageRect.left;
  const translateY = sourceRect.top - stageRect.top;
  lastScale = { scaleX, scaleY, translateX, translateY };

  overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  void overlay.offsetHeight;
  detailOpenFrame = requestAnimationFrame(() => {
    detailOpenFrame = null;
    overlay.style.transition = '';
    overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
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
  mediaBox.innerHTML = ''; // Detener el video/iframe al cerrar el diálogo.
  lastScale = null;
  isDetailClosing = false;
  leaf.removeAttribute('aria-hidden');
  leaf.inert = false;

  if (focusReturnElement?.isConnected) {
    focusReturnElement.focus({ preventScroll: true });
  }
  focusReturnElement = null;
}

function closeDetail() {
  if (!overlay.classList.contains('show') || isDetailClosing) return;
  isDetailClosing = true;
  if (detailOpenFrame !== null) cancelAnimationFrame(detailOpenFrame);
  detailOpenFrame = null;
  detailContent.classList.remove('show');

  if (!lastScale || reduceMotion.matches) {
    finishCloseDetail();
    return;
  }

  const { scaleX, scaleY, translateX, translateY } = lastScale;
  detailCloseHandler = event => {
    if (event.target === overlay && event.propertyName === 'transform') finishCloseDetail();
  };
  overlay.addEventListener('transitionend', detailCloseHandler);
  overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  detailCloseTimer = window.setTimeout(finishCloseDetail, 600);
}

closeBtn.addEventListener('click', closeDetail);

function getDialogFocusables() {
  return [...overlay.querySelectorAll('button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])')]
    .filter(element => element.getClientRects().length > 0);
}

document.addEventListener('keydown', event => {
  const dialogOpen = overlay.classList.contains('show');
  if (dialogOpen) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDetail();
      return;
    }
    if (event.key === 'Tab') {
      const focusables = getDialogFocusables();
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
