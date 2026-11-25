import React, { useEffect, useRef, useState } from 'react';
import { getPhotoUrl, getPublicAssetUrl } from '../../utils/albumRoutes.js';
import useDelayedLoad from '../../hooks/useDelayedLoad.js';

function CardSkeleton() {
  return (
    <span className="polaroid-skeleton" aria-hidden="true">
      <span className="polaroid-skeleton__photo shimmer-skeleton" />
      <span className="polaroid-skeleton__caption">
        <i className="polaroid-skeleton__number shimmer-skeleton" />
        <i className="polaroid-skeleton__title shimmer-skeleton" />
      </span>
    </span>
  );
}

export default function PieceCard({ album, item, index, onOpen, disabled }) {
  const photoUrl = getPhotoUrl(item.foto, album.cloudName);
  const markPath = album.branding?.photoMark || album.branding?.logo;
  const logoUrl = markPath ? getPublicAssetUrl(markPath) : '';
  const imageRef = useRef(null);
  const [brandLoaded, setBrandLoaded] = useState(false);
  const load = useDelayedLoad(photoUrl, imageRef);

  useEffect(() => {
    setBrandLoaded(false);
    if (!logoUrl) return undefined;
    let active = true;
    const logo = new Image();
    logo.onload = () => active && setBrandLoaded(true);
    logo.onerror = () => active && setBrandLoaded(false);
    logo.src = logoUrl;
    if (logo.complete && logo.naturalWidth > 0) setBrandLoaded(true);
    return () => {
      active = false;
      logo.onload = null;
      logo.onerror = null;
    };
  }, [logoUrl]);

  return (
    <button
      className={`polaroid polaroid--${index % 6}`}
      key={item.id}
      type="button"
      data-piece-id={item.id}
      onClick={event => onOpen(item, event.currentTarget)}
      aria-label={`Abrir ${item.tag}: ${item.title}`}
      aria-busy={Boolean(photoUrl) && !load.loaded}
      disabled={disabled}
    >
      <span className="polaroid__tape" aria-hidden="true" />
      <span className="polaroid__photo">
        {photoUrl && !load.failed ? (
          <>
            <img
              ref={imageRef}
              src={photoUrl}
              alt={`Fotografía de ${item.title}`}
              className={load.loaded ? 'is-loaded' : ''}
              loading="lazy"
              decoding="async"
              onLoad={load.onLoad}
              onError={load.onError}
            />
            {load.loaded && logoUrl && brandLoaded && (
              <span className="polaroid__brand-mark polaroid__brand-mark--watermark" aria-hidden="true">
                <img src={logoUrl} alt="" loading="eager" decoding="async" />
              </span>
            )}
          </>
        ) : (
          <span className="photo-pending">
            <span className="photo-pending__flower" aria-hidden="true">Á</span>
            <span>{load.failed ? 'foto no disponible' : 'foto por pegar'}</span>
          </span>
        )}
      </span>
      <span className="polaroid__caption">
        <span className="polaroid__number">{item.tag}</span>
        <span className="polaroid__title">{item.title}</span>
      </span>
      {load.showSkeleton && <CardSkeleton />}
    </button>
  );
}
