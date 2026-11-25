import React from 'react';
import { getPublicAssetUrl } from '../../utils/albumRoutes.js';

export default function BookCover({ album, side, onOpen }) {
  const isFront = side === 'front';
  const cover = isFront ? album.cover.front : album.cover.back;
  const coverImage = cover.image ? getPublicAssetUrl(cover.image) : undefined;
  const logoUrl = album.branding?.logo ? getPublicAssetUrl(album.branding.logo) : '';

  return (
    <section
      className={`book-cover book-cover--${side}`}
      style={{ '--cover-image': coverImage ? `url("${coverImage}")` : undefined }}
      aria-label={isFront ? `Portada de ${album.brand}` : `Contraportada de ${album.brand}`}
    >
      <div className="book-cover__inner">
        <span className="book-cover__brand">{album.brand}</span>
        <span className="book-cover__eyebrow">{isFront ? cover.eyebrow : 'Fin del recorrido'}</span>
        {isFront && logoUrl && (
          <img
            className="book-cover__logo"
            src={logoUrl}
            alt={`Logotipo de ${album.brand}`}
            decoding="async"
          />
        )}
        <h1>{isFront ? cover.title : album.brand}</h1>
        <span className="book-cover__ornament" aria-hidden="true"><span /></span>
        <p>{cover.note}</p>
        {isFront ? (
          <button id="openCoverBtn" type="button" className="cover-action" onClick={onOpen}>
            Abrir este cuaderno <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button id="backCoverBtn" type="button" className="cover-action" onClick={onOpen}>
            Volver a curiosear <span aria-hidden="true">↶</span>
          </button>
        )}
        {!isFront && logoUrl && (
          <img className="book-cover__logo book-cover__logo--back" src={logoUrl} alt={`Logotipo de ${album.brand}`} decoding="async" />
        )}
        <span className="book-cover__signature">{isFront ? album.subtitle : cover.signature}</span>
      </div>
    </section>
  );
}
