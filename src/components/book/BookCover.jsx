import React from 'react';

export default function BookCover({ album, side, albums, onOpen, onSelectAlbum }) {
  const isFront = side === 'front';
  const cover = isFront ? album.cover.front : album.cover.back;
  const coverImage = cover.image ? new URL(cover.image, window.location.href).href : undefined;

  return (
    <section
      className={`book-cover book-cover--${side}`}
      style={{ '--cover-image': coverImage ? `url("${coverImage}")` : undefined }}
      aria-label={isFront ? `Portada de ${album.location}` : `Contraportada de ${album.location}`}
    >
      <div className="book-cover__inner">
        <span className="book-cover__brand">✳ {album.brand}</span>
        <span className="book-cover__eyebrow">{isFront ? cover.eyebrow : 'Fin del recorrido'}</span>
        <h1>{isFront ? cover.title : album.location}</h1>
        <span className="book-cover__ornament" aria-hidden="true">✳</span>
        <p>{cover.note}</p>
        {isFront ? (
          <button id="openCoverBtn" type="button" className="cover-action" onClick={onOpen}>Abrir este cuaderno <span aria-hidden="true">→</span></button>
        ) : (
          <button id="backCoverBtn" type="button" className="cover-action" onClick={onOpen}>Volver a abrir <span aria-hidden="true">↶</span></button>
        )}
        <span className="book-cover__signature">{isFront ? album.subtitle : cover.signature}</span>
        {albums.length > 1 && (
          <label className="album-picker">
            <span>Elegir otro cuaderno</span>
            <select value={album.id} onChange={event => onSelectAlbum(event.target.value)}>
              {albums.map(entry => <option key={entry.id} value={entry.id}>{entry.location}</option>)}
            </select>
          </label>
        )}
      </div>
    </section>
  );
}
