import { useCallback, useRef, useState } from 'react';
import { getZoomTransform, IDENTITY_TRANSFORM } from '../utils/albumRoutes.js';

export default function usePieceDetail(stageRef) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [closingDetail, setClosingDetail] = useState(false);
  const [detailMotion, setDetailMotion] = useState({ transform: IDENTITY_TRANSFORM, animated: false });
  const sourceElementRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);
  const closeCallbackRef = useRef(null);

  const finishDetailClose = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    isClosingRef.current = false;
    setClosingDetail(false);
    setSelectedItem(null);

    const source = sourceElementRef.current;
    sourceElementRef.current = null;
    if (source?.isConnected) source.focus({ preventScroll: true });

    const callback = closeCallbackRef.current;
    closeCallbackRef.current = null;
    callback?.();
  }, []);

  const animateDetailClose = useCallback((onFinished = null) => {
    if (!selectedItem) {
      onFinished?.();
      return;
    }
    if (isClosingRef.current) {
      if (onFinished) closeCallbackRef.current = onFinished;
      return;
    }

    isClosingRef.current = true;
    closeCallbackRef.current = onFinished;
    const destination = getZoomTransform(sourceElementRef.current, stageRef.current);
    if (!sourceElementRef.current?.isConnected) {
      finishDetailClose();
      return;
    }

    setClosingDetail(true);
    setDetailMotion({ transform: destination, animated: true });
    closeTimerRef.current = window.setTimeout(finishDetailClose, 850);
  }, [finishDetailClose, selectedItem, stageRef]);

  const openDetail = useCallback((item, sourceElement) => {
    sourceElementRef.current = sourceElement;
    const startTransform = getZoomTransform(sourceElement, stageRef.current);
    setClosingDetail(false);
    setSelectedItem(item);
    setDetailMotion({ transform: startTransform, animated: false });
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      setDetailMotion({ transform: IDENTITY_TRANSFORM, animated: true });
    }));
  }, [stageRef]);

  const resetDetail = useCallback(() => {
    setSelectedItem(null);
    setClosingDetail(false);
  }, []);

  const onDetailTransitionEnd = useCallback(event => {
    if (event.target === event.currentTarget && event.propertyName === 'transform' && isClosingRef.current) {
      finishDetailClose();
    }
  }, [finishDetailClose]);

  return {
    selectedItem,
    closingDetail,
    detailMotion,
    sourceElementRef,
    isClosingRef,
    openDetail,
    animateDetailClose,
    resetDetail,
    onDetailTransitionEnd
  };
}
