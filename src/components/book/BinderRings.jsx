import React from 'react';

export default function BinderRings({ side = 'center' }) {
  return (
    <aside className={`book-spine book-spine--${side}`} aria-hidden="true">
      <div className="spine-label">Ámbar<br />archivo</div>
      <div className="binder-rings">{Array.from({ length: 7 }, (_, index) => <span key={index} />)}</div>
    </aside>
  );
}
