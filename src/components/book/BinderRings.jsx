import React from 'react';

export default function BinderRings({ screen = 'pages', mode = 'desktop', moving = false, from, nodeRef }) {
  const restingLeft = screen === 'front-cover'
    ? '0px'
    : screen === 'back-cover'
      ? `calc(100% - ${mode === 'desktop' ? 36 : 40}px)`
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
