import React from 'react';
import PieceCard from './PieceCard.jsx';

export default function AlbumPage({ album, pageIndex, onOpenPiece, isPageTurning }) {
  const pieces = album.pieces.slice(pageIndex * album.itemsPerPage, (pageIndex + 1) * album.itemsPerPage);

  return (
    <article className={`page-content${pageIndex === 0 ? ' page-content--first' : ''}`} data-page={pageIndex}>
      <header className="album-page-heading">
        <span className="album-page-brand">✳ {album.brand} · {album.location}</span>
        {pageIndex === 0 && (
          <>
            <p className="eyebrow">{album.subtitle}</p>
            <h1>{album.title}</h1>
            <p className="intro-note">Cada objeto tiene su rincón y algo que contar.</p>
          </>
        )}
        <span className="page-stamp" aria-hidden="true">hoja<br />{String(pageIndex + 1).padStart(2, '0')}</span>
      </header>

      <div className="paper-rule" aria-hidden="true"><span>✳</span></div>
      <section className="piece-grid" aria-label={`Piezas de la página ${pageIndex + 1}`}>
        {pieces.map((item, index) => (
          <PieceCard
            key={item.id}
            album={album}
            item={item}
            index={index}
            onOpen={onOpenPiece}
            disabled={isPageTurning}
          />
        ))}
      </section>
      {!pieces.length && <p className="blank-page-note">Una hoja en blanco, lista para una nueva historia.</p>}
      <footer className="page-colophon">colección de {album.brand} <span>·</span> objetos con memoria</footer>
    </article>
  );
}
