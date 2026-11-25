import { useCallback, useLayoutEffect } from 'react';
import { REDUCED_MOTION } from '../utils/albumRoutes.js';
import { createReducedFade, FADE_MS } from '../utils/pageTurn.js';

export default function useReducedMotionTurn({
  turnRef,
  turnLeafRef,
  animationRef,
  spineAnimationRef,
  spineRef,
  fallbackRef,
  finishRef,
  clearFallback,
  setTurn
}) {
  const onMotionPreferenceChange = useCallback(event => {
    if (!event.matches || !turnRef.current) return;
    const pending = turnRef.current;
    const node = turnLeafRef.current;
    const oldAnimation = animationRef.current;
    if (!oldAnimation || !node) {
      finishRef.current?.();
      return;
    }

    const transform = getComputedStyle(node).transform;
    const currentSpineLeft = spineRef.current ? getComputedStyle(spineRef.current).left : pending.spineFrom;
    oldAnimation.onfinish = null;
    oldAnimation.cancel();
    spineAnimationRef.current?.cancel();

    const { animation: fade, spineAnimation: spineFade } = createReducedFade({
      node,
      spineNode: spineRef.current,
      transform,
      spineLeft: currentSpineLeft,
      spineTarget: pending.spineTo,
      onFinish: () => finishRef.current?.({ preserveVisual: true }),
      onSpineFinish: () => {
        if (spineRef.current) spineRef.current.style.left = pending.spineTo;
      }
    });

    spineAnimationRef.current = spineFade || null;
    animationRef.current = fade;
    turnRef.current = { ...pending, reduced: true, dragging: false, reversing: false, progress: 0 };
    setTurn(turnRef.current);
    clearFallback();
    fallbackRef.current = window.setTimeout(() => finishRef.current?.(), FADE_MS + 240);
  }, [animationRef, clearFallback, fallbackRef, finishRef, setTurn, spineAnimationRef, spineRef, turnLeafRef, turnRef]);

  useLayoutEffect(() => {
    REDUCED_MOTION.addEventListener('change', onMotionPreferenceChange);
    return () => REDUCED_MOTION.removeEventListener('change', onMotionPreferenceChange);
  }, [onMotionPreferenceChange]);
}
