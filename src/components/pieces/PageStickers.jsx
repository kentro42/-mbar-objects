import React from 'react';
import { getPublicAssetUrl } from '../../utils/albumRoutes.js';
import { getPageCloudVariant, getPageStickerAssignments } from '../../utils/pageDecorations.js';

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
          className={`page-sticker page-sticker--${index === 0 ? 'first' : 'second'}`}
          src={getPublicAssetUrl(sticker.file)}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ '--sticker-tilt': `${((pageIndex * 7 + index * 11) % 17) - 8}deg` }}
        />
      ))}
      {!stickers.length && <span className="page-sticker-cloud-fallback" />}
    </div>
  );
}
