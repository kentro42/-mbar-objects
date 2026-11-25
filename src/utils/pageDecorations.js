export const STICKERS_PER_PAGE = 2;

const cloudVariants = ['blue', 'coral', 'white'];

export function getPageCloudVariant(pageIndex) {
  return cloudVariants[Math.abs(Number(pageIndex) || 0) % cloudVariants.length];
}

export function getPageStickerAssignments(album, pageIndex) {
  const index = Math.max(0, Math.floor(Number(pageIndex) || 0));
  const uniqueStickers = [];
  const seenFiles = new Set();

  for (const sticker of album?.stickers || []) {
    if (!sticker?.file || seenFiles.has(sticker.file)) continue;
    seenFiles.add(sticker.file);
    uniqueStickers.push(sticker);
  }

  const start = index * STICKERS_PER_PAGE;
  return uniqueStickers.slice(start, start + STICKERS_PER_PAGE);
}
