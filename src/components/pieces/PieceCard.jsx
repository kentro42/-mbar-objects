import React, { useRef } from 'react';
import { getPhotoUrl } from '../../utils/albumRoutes.js';
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
  const imageRef = useRef(null);
  const load = useDelayedLoad(photoUrl, imageRef);

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
        ) : (
          <span className="photo-pending">
            <span className="photo-pending__flower" aria-hidden="true">✿</span>
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
