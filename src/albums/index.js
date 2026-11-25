import casaVioletaAzul from './ambar-casa-violeta-azul.js';

// Esta aplicación publica un único cuaderno. El ID se conserva para no romper
// los enlaces de QR ya distribuidos.
export const albums = [casaVioletaAzul];
export const defaultAlbumId = casaVioletaAzul.id;

export function findAlbum(id) {
  return albums.find(album => album.id === id) || albums[0];
}
