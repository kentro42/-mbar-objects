import ambarTuCasa from './ambar-tu-casa.js';

// Este proyecto publica un solo álbum. Sus rutas antiguas se resuelven como alias.
export const albums = [ambarTuCasa];
export const defaultAlbumId = ambarTuCasa.id;

export function findAlbum(id) {
  return albums.find(album => album.id === id || album.legacyRouteIds?.includes(id)) || albums[0];
}
