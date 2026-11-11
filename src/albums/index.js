import casaVioletaAzul from './ambar-casa-violeta-azul.js';

// Para añadir otro local: crea un módulo de álbum con el mismo contrato y
// agréguelo a este arreglo. Cada álbum trae sus piezas y sus dos cubiertas.
export const albums = [casaVioletaAzul];
export const defaultAlbumId = casaVioletaAzul.id;

export function findAlbum(id) {
  return albums.find(album => album.id === id) || albums[0];
}
