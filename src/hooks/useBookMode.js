import { useEffect, useState } from 'react';

// La composición depende de la orientación, no de un ancho aislado. En landscape
// pequeño se conserva una hoja para evitar una doble página ilegible.
const QUERY = '(orientation: landscape) and (min-width: 760px) and (min-height: 520px)';

function readMode() {
  return window.matchMedia(QUERY).matches ? 'desktop' : 'mobile';
}

export default function useBookMode() {
  const [mode, setMode] = useState(readMode);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setMode(media.matches ? 'desktop' : 'mobile');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return mode;
}
