import React, { useRef } from 'react';
import useDelayedLoad from '../../hooks/useDelayedLoad.js';

export default function DelayedImage({ src, alt, className = '', imageClassName = '', width, height, fit = 'cover' }) {
  const imageRef = useRef(null);
  const load = useDelayedLoad(src, imageRef);
  if (!src || load.failed) return null;

  return (
    <span
      className={`delayed-image ${className}`}
      style={{ width, height, '--image-fit': fit }}
      aria-busy={!load.loaded}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`delayed-image__asset${load.loaded ? ' is-loaded' : ''} ${imageClassName}`}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={load.onLoad}
        onError={load.onError}
      />
      {load.showSkeleton && <span className="shimmer-skeleton" aria-hidden="true" />}
    </span>
  );
}
