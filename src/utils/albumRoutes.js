export const IDENTITY_TRANSFORM = 'translate(0px, 0px) scale(1, 1)';
export const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

export function getPageCount(album) {
  return Math.max(1, Math.ceil(album.pieces.length / album.itemsPerPage));
}

export function getSpreadStart(page, mode, pageCount) {
  const safePage = Math.max(0, Math.min(pageCount - 1, Number(page) || 0));
  return mode === 'desktop' ? Math.floor(safePage / 2) * 2 : safePage;
}

export function getPhotoUrl(photo, cloudName) {
  if (!photo) return '';
  if (/^https:\/\//i.test(photo)) return photo;
  if (!cloudName) return '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${encodeURIComponent(photo)}`;
}

function routeBase(albumId) {
  return `${window.location.pathname}${window.location.search}#album/${encodeURIComponent(albumId)}`;
}

export function getPageUrl(albumId, page) {
  return `${routeBase(albumId)}/pagina/${page + 1}`;
}

export function getCoverUrl(albumId, side) {
  return `${routeBase(albumId)}/${side === 'back' ? 'contraportada' : 'portada'}`;
}

export function getPieceUrl(albumId, item) {
  return `${routeBase(albumId)}/pieza/${encodeURIComponent(String(item.id))}`;
}

export function getAbsolutePieceUrl(albumId, item) {
  return new URL(getPieceUrl(albumId, item), window.location.origin).href;
}

export function getPageForPiece(album, item, mode) {
  const index = album.pieces.findIndex(piece => String(piece.id) === String(item.id));
  const page = Math.max(0, Math.floor(index / album.itemsPerPage));
  return getSpreadStart(page, mode, getPageCount(album));
}

export function readInitialRoute(albums, fallbackId) {
  const hash = window.location.hash;
  let albumId = fallbackId;
  let section = 'pages';
  let page = 0;
  let itemId = null;
  let coverSide = null;

  const modern = hash.match(/^#album\/([^/]+)\/(pagina\/(\d+)|pieza\/([^/]+)|(portada|contraportada))$/);
  if (modern) {
    try { albumId = decodeURIComponent(modern[1]); } catch { albumId = fallbackId; }
    if (modern[3]) page = Math.max(0, Number(modern[3]) - 1);
    if (modern[4]) itemId = decodeURIComponent(modern[4]);
    if (modern[5]) coverSide = modern[5] === 'contraportada' ? 'back' : 'front';
  } else {
    const legacyPiece = hash.match(/^#pieza-(.+)$/);
    const legacyPage = hash.match(/^#pagina-(\d+)$/);
    if (legacyPiece) {
      try { itemId = decodeURIComponent(legacyPiece[1]); } catch { itemId = null; }
    }
    if (legacyPage) page = Math.max(0, Number(legacyPage[1]) - 1);
  }

  const album = albums.find(entry => entry.id === albumId) || albums.find(entry => entry.id === fallbackId) || albums[0];
  if (itemId !== null) {
    const piece = album.pieces.find(entry => String(entry.id) === String(itemId));
    if (piece) {
      section = 'piece';
      page = Math.floor(album.pieces.indexOf(piece) / album.itemsPerPage);
      itemId = piece.id;
    } else itemId = null;
  } else if (coverSide) section = coverSide === 'back' ? 'back-cover' : 'front-cover';

  page = Math.min(page, getPageCount(album) - 1);
  return { albumId: album.id, screen: section, section, page, itemId };
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
