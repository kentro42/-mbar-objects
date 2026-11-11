import { useEffect, useState } from 'react';

const QUERY = '(min-width: 761px)';

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
