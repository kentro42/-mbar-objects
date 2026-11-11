import { CLOUD_NAME, objetos } from '../../js/data.js';

export const PER_PAGE = 8;
export const TOTAL_PAGES = Math.max(1, Math.ceil(objetos.length / PER_PAGE));
export const IDENTITY_TRANSFORM = 'translate(0px, 0px) scale(1, 1)';
export const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

export function getPhotoUrl(photo) {
  if (!photo) return '';
  if (/^https:\/\//i.test(photo)) return photo;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${encodeURIComponent(photo)}`;
}

export function getPageUrl(page) {
  return `${window.location.pathname}${window.location.search}#pagina-${page + 1}`;
}

export function getPieceUrl(item) {
  return `${window.location.pathname}${window.location.search}#pieza-${encodeURIComponent(String(item.id))}`;
}

export function getAbsolutePieceUrl(item) {
  return new URL(getPieceUrl(item), window.location.origin).href;
}

export function getPageForPiece(item) {
  return Math.floor(objetos.findIndex(piece => String(piece.id) === String(item.id)) / PER_PAGE);
}

export function readInitialRoute() {
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

export function getZoomTransform(sourceElement, stageElement) {
  if (!sourceElement || !stageElement) return IDENTITY_TRANSFORM;
  const card = sourceElement.getBoundingClientRect();
  const stage = stageElement.getBoundingClientRect();
  const scaleX = card.width / Math.max(stage.width, 1);
  const scaleY = card.height / Math.max(stage.height, 1);
  const x = card.left - stage.left;
  const y = card.top - stage.top;
  return `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
}
