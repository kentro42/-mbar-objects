import React from 'react';

export default function AlbumLayout({
  stageRef,
  page,
  turn,
  selectedItem,
  onFinishTurn,
  frontPage,
  backPage,
  detail
}) {
  const leafStyle = turn
    ? { transform: turn.direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)' }
    : undefined;

  return (
    <div className="linen-backdrop">
      <main className="stage" id="stage" ref={stageRef} aria-label="Álbum de Ámbar Casa Violeta Azul">
        <div className="book-spine" aria-hidden="true">
          <div className="spine-label">Ámbar<br />archivo</div>
          <div className="binder-rings">{Array.from({ length: 7 }, (_, index) => <span key={index} />)}</div>
        </div>
        <div
          className={`leaf${turn ? ' leaf--turning' : ''}`}
          style={{ ...leafStyle, transformOrigin: turn?.direction === 'prev' ? 'right center' : 'left center' }}
          onTransitionEnd={event => {
            if (event.target === event.currentTarget && event.propertyName === 'transform') onFinishTurn();
          }}
        >
          <section
            className="side side--front"
            aria-label={`Página ${page + 1}`}
            aria-hidden={Boolean(turn || selectedItem)}
            inert={Boolean(turn || selectedItem)}
          >
            {frontPage}
          </section>
          <section
            className="side side--back"
            aria-label={turn ? `Página ${turn.to + 1}` : 'Página siguiente'}
            aria-hidden={!turn}
            inert={!turn}
          >
            {backPage}
          </section>
        </div>
        {detail}
      </main>
      <p className="outside-note"><span>✳</span> hecho de recuerdos, no de prisa <span>✳</span></p>
    </div>
  );
}
