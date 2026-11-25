import React from 'react';
import { getPublicAssetUrl } from '../../utils/albumRoutes.js';
import { getPageCloudVariant, getPageStickerAssignments, STICKERS_PER_PAGE } from '../../utils/pageDecorations.js';

export default function PageStickers({ album, pageIndex }) {
  const stickers = getPageStickerAssignments(album, pageIndex);
  const cloudVariant = getPageCloudVariant(pageIndex);

  return (
    <div
      className={`page-sticker-layer page-sticker-layer--${cloudVariant}`}
      aria-hidden="true"
      data-decoration-page={pageIndex}
    >
      <span className="page-cloud" />
      {stickers.map((sticker, index) => (
        <img
          key={sticker.file}
          className={`page-sticker page-sticker--position-${index + 1}`}
          src={getPublicAssetUrl(sticker.file)}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ '--sticker-tilt': `${((pageIndex * 7 + index * 11) % 17) - 8}deg` }}
        />
      ))}
      {stickers.length < STICKERS_PER_PAGE && <span className="page-sticker-cloud-fallback" />}
    </div>
  );
}
