import React from 'react';
import { objetos } from '../../js/data.js';
import { getPhotoUrl, PER_PAGE, TOTAL_PAGES } from '../utils/albumRoutes.js';

export default function AlbumPage({ page, onOpenPiece, onTurnPage, isPageTurning }) {
  const pieces = objetos.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="page-content" data-page={page}>
      <header className="album-header">
        <div className="brand-mark" aria-label="Ámbar Casa Violeta Azul">
          <span className="brand-mark__ornament" aria-hidden="true">📷</span>
          <span>Ámbar · Casa Violeta Azul</span>
        </div>
        <p className="eyebrow">Cuaderno de cosas queridas <span>·</span> desde la casa</p>
        <h1>El álbum <em>de las piezas</em></h1>
        <p className="intro-note">Cada objeto tiene su rincón y algo que contar.</p>
      </header>

      <div className="page-stamp" aria-hidden="true">archivo<br />afectivo</div>
      <div className="paper-rule" aria-hidden="true"><span>✳</span></div>

      <section className="piece-grid" aria-label={`Piezas de la página ${page + 1}`}>
        {pieces.map((item, index) => {
          const photoUrl = getPhotoUrl(item.foto);
          return (
            <button
              className={`polaroid polaroid--${index % 6}`}
              key={item.id}
              type="button"
              data-piece-id={item.id}
              onClick={event => onOpenPiece(item, event.currentTarget)}
              aria-label={`Abrir ${item.tag}: ${item.title}`}
              disabled={isPageTurning}
            >
              <span className="polaroid__tape" aria-hidden="true" />
              <span className="polaroid__photo">
                {photoUrl ? (
                  <img src={photoUrl} alt={`Fotografía de ${item.title}`} loading="lazy" decoding="async" />
                ) : (
                  <span className="photo-pending">
                    <span className="photo-pending__flower" aria-hidden="true">✿</span>
                    <span>foto por pegar</span>
                  </span>
                )}
              </span>
              <span className="polaroid__caption">
                <span className="polaroid__number">{item.tag}</span>
                <span className="polaroid__title">{item.title}</span>
              </span>
            </button>
          );
        })}
      </section>

      <aside className="margin-note" aria-hidden="true">
        <span>mirar despacio</span>
        <span className="margin-note__star">✳</span>
      </aside>

      <nav className="page-navigation" aria-label="Páginas del álbum">
        <button id="prevBtn" type="button" onClick={() => onTurnPage(page - 1, 'prev')} disabled={page === 0 || isPageTurning} aria-label="Página anterior">
          <span aria-hidden="true">←</span> Anterior
        </button>
        <span className="page-count" aria-live="polite">hoja {String(page + 1).padStart(2, '0')} <span>de</span> {String(TOTAL_PAGES).padStart(2, '0')}</span>
        <button id="nextBtn" type="button" onClick={() => onTurnPage(page + 1, 'next')} disabled={page >= TOTAL_PAGES - 1 || isPageTurning} aria-label="Página siguiente">
          Siguiente <span aria-hidden="true">→</span>
        </button>
      </nav>
      <p className="page-colophon">colección de Ámbar <span>·</span> objetos con memoria</p>
    </div>
  );
}
