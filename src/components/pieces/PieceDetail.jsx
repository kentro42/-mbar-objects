import React, { useEffect, useRef, useState } from 'react';
import { getAbsolutePieceUrl } from '../../utils/albumRoutes.js';
import DelayedImage from '../loading/DelayedImage.jsx';

export default function PieceDetail({ albumId, item, motion, closing, sourceElement, onBack, onTransitionEnd }) {
  const [playing, setPlaying] = useState(false);
  const headingRef = useRef(null);
  const videoId = /^[A-Za-z0-9_-]{11}$/.test(item.video || '') ? item.video : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(getAbsolutePieceUrl(albumId, item))}`;
  const cardPhoto = sourceElement?.querySelector('.polaroid__photo img')?.currentSrc;
  const imageStyle = cardPhoto ? { '--piece-photo': `url(${JSON.stringify(cardPhoto)})` } : undefined;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [item.id]);

  return (
    <section
      className={`detail-sheet${motion.animated ? ' detail-sheet--animating' : ''}${closing ? ' detail-sheet--closing' : ''}`}
      style={{ transform: motion.transform, ...imageStyle }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      aria-describedby="detail-description"
      onTransitionEnd={onTransitionEnd}
      tabIndex={-1}
    >
      <div className="detail-toolbar">
        <button className="back-to-album" type="button" onClick={onBack}><span aria-hidden="true">←</span> volver al álbum</button>
        <span className="detail-toolbar__label">nota de inventario <span>✳</span></span>
      </div>

      <div className={`piece-media${videoId ? ' piece-media--has-video' : ''}`}>
        {videoId ? (
          playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title={`Video de ${item.title}`}
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <>
              <DelayedImage src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt={`Vista previa del video de ${item.title}`} className="piece-media__image" />
              <button className="play-button" type="button" onClick={() => setPlaying(true)} aria-label={`Reproducir video de ${item.title}`}><span aria-hidden="true">▶</span></button>
              <span className="media-caption">un pequeño recuerdo en movimiento</span>
            </>
          )
        ) : (
          <div className="empty-media" aria-label="Esta pieza todavía no tiene video">
            <span className="empty-media__moon" aria-hidden="true">◌</span><span>un espacio en silencio</span>
          </div>
        )}
      </div>

      <article className="piece-story">
        <div className="story-topline"><span>{item.year}</span><span>{item.categoria}</span><span>{item.origen}</span></div>
        <div className="story-heading-row">
          <div>
            <p className="story-kicker">{item.tag} <span>·</span> una pieza de la casa</p>
            <h2 id="detail-title" ref={headingRef} tabIndex={-1}>{item.title}</h2>
            <p className="story-subtitle" id="detail-description">{item.subtitle}</p>
          </div>
          <span className="story-flower" aria-hidden="true">✿</span>
        </div>

        <dl className="piece-facts">
          <div><dt>Material</dt><dd>{item.material}</dd></div>
          <div><dt>Procedencia</dt><dd>{item.procedencia}</dd></div>
          <div><dt>Estado</dt><dd>{item.estado}</dd></div>
          <div><dt>Antes servía para</dt><dd>{item.uso}</dd></div>
        </dl>
        <div className="handwritten-copy"><p>{item.p1}</p><p>{item.p2}</p></div>

        <div className="story-footer">
          <div className="qr-card">
            <DelayedImage src={qrUrl} alt={`Código QR único para ${item.tag}: ${item.title}`} width={112} height={112} fit="contain" />
            <span>escanea para volver a esta historia</span>
          </div>
          <p className="signed-note">con cariño,<br /><span>Ámbar</span></p>
        </div>
      </article>
      <span className="detail-tape" aria-hidden="true" />
    </section>
  );
}
