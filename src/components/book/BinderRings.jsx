import React from 'react';

export default function BinderRings({ screen = 'pages', mode = 'desktop', moving = false, from, nodeRef }) {
  const restingLeft = screen === 'front-cover'
    ? (mode === 'desktop' ? 'calc(25% - 18px)' : '0px')
    : screen === 'back-cover'
      ? (mode === 'desktop' ? 'calc(75% - 18px)' : 'calc(100% - 40px)')
      : mode === 'desktop' ? 'calc(50% - 18px)' : '0px';
  const style = moving
    ? { left: from }
    : { left: restingLeft };

  return (
    <aside ref={nodeRef} className={`book-spine${moving ? ' book-spine--moving' : ''}`} style={style} aria-hidden="true">
      <div className="spine-label">Ámbar<br />archivo</div>
      <div className="binder-rings">{Array.from({ length: 7 }, (_, index) => <span key={index} />)}</div>
    </aside>
  );
}
