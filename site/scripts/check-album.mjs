import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import album from '../src/albums/ambar-tu-casa.js';
import { getPageStickerAssignments, STICKERS_PER_PAGE } from '../src/utils/pageDecorations.js';

const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));
const errors = [];
const checkUnique = (values, label) => {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) errors.push(`${label} duplicados: ${[...new Set(duplicates)].join(', ')}`);
};
const checkAsset = async (relativePath, label) => {
  try {
    await access(`${publicDirectory}/${relativePath}`);
  } catch {
    errors.push(`${label} no encontrado: public/${relativePath}`);
  }
};

if (!album.pieces.length) errors.push('El álbum no tiene piezas.');
if (!Number.isInteger(album.itemsPerPage) || album.itemsPerPage < 1) {
  errors.push('itemsPerPage debe ser un entero mayor que cero.');
}
checkUnique(album.pieces.map(piece => String(piece.id)), 'IDs de pieza');
checkUnique(album.pieces.map(piece => piece.tag), 'Etiquetas de pieza');
checkUnique(album.stickers.map(sticker => sticker.file), 'Rutas de stickers');

const videoIds = album.pieces.map(piece => piece.video).filter(Boolean);
for (const [index, videoId] of videoIds.entries()) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    errors.push(`ID de YouTube inválido: ${videoId}`);
  }
  if (videoIds.indexOf(videoId) !== index) {
    errors.push(`El video ${videoId} está asignado a más de una pieza.`);
  }
}

for (const sticker of album.stickers) await checkAsset(sticker.file, 'Sticker');
for (const [label, path] of Object.entries(album.branding || {})) {
  if (path) await checkAsset(path, `Logo ${label}`);
}
for (const piece of album.pieces) {
  if (/^(?:\.\/)?assets\//.test(piece.foto || '')) {
    await checkAsset(piece.foto.replace(/^\.\//, ''), `Foto de ${piece.tag}`);
  }
}

const pageCount = Math.ceil(album.pieces.length / album.itemsPerPage);
const assignedFiles = [];
for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
  assignedFiles.push(...getPageStickerAssignments(album, pageIndex).map(sticker => sticker.file));
}
checkUnique(assignedFiles, 'Stickers asignados a páginas');
if (!album.legacyRouteIds?.includes('ambar-casa-violeta-azul')) {
  errors.push('Falta el alias de ruta necesario para los QR antiguos.');
}

if (errors.length) {
  console.error('La comprobación del álbum encontró problemas:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Catálogo correcto: ${album.pieces.length} piezas, ${pageCount} páginas y ${assignedFiles.length} stickers asignados únicos.`);
}
