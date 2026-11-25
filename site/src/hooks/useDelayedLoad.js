import { useLayoutEffect, useState } from 'react';

const DELAY_MS = 300;

export default function useDelayedLoad(src, imageRef) {
  const [loaded, setLoaded] = useState(!src);
  const [failed, setFailed] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useLayoutEffect(() => {
    if (!src) {
      setLoaded(true);
      setFailed(false);
      setShowSkeleton(false);
      return undefined;
    }

    const image = imageRef?.current;
    if (image?.complete) {
      setLoaded(true);
      setFailed(image.naturalWidth === 0);
      setShowSkeleton(false);
      return undefined;
    }

    setLoaded(false);
    setFailed(false);
    setShowSkeleton(false);
    const timer = window.setTimeout(() => {
      const currentImage = imageRef?.current;
      if (!(currentImage?.complete && currentImage.naturalWidth > 0)) setShowSkeleton(true);
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [src]);

  const onLoad = () => {
    setLoaded(true);
    setFailed(false);
    setShowSkeleton(false);
  };

  const onError = () => {
    setLoaded(true);
    setFailed(true);
    setShowSkeleton(false);
  };

  return { loaded, failed, showSkeleton: showSkeleton && !loaded, onLoad, onError };
}
