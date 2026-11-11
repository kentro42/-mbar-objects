import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { REDUCED_MOTION } from '../utils/albumRoutes.js';
import usePageTurnGesture from './usePageTurnGesture.js';
import {
  COMMIT_THRESHOLD,
  FADE_MS,
  TURN_MS,
  createReducedFade,
  createTurnAnimations,
  getSpineLeft,
  nextPosition
} from '../utils/pageTurn.js';

export default function usePageTurn({ album, mode, screen, page, stageRef, spineRef, onCommit }) {
  const [turn, setTurn] = useState(null);
  const turnRef = useRef(null);
  const turnLeafRef = useRef(null);
  const spineAnimationRef = useRef(null);
  const animationRef = useRef(null);
  const fallbackRef = useRef(null);
  const turningRef = useRef(false);
  const idRef = useRef(0);
  const finishRef = useRef(null);
  const cancelRef = useRef(null);

  const clearFallback = useCallback(() => {
    if (fallbackRef.current) window.clearTimeout(fallbackRef.current);
    fallbackRef.current = null;
  }, []);

  const finishTurn = useCallback(({ preserveVisual = false } = {}) => {
    const pending = turnRef.current;
    if (!pending) return;
    clearFallback();
    turnRef.current = null;
    turningRef.current = false;
    const animation = animationRef.current;
    animationRef.current = null;
    if (animation) {
      animation.onfinish = null;
      if (!preserveVisual && animation.playState !== 'finished') animation.cancel();
    }
    const spine = spineRef.current;
    if (spine) spine.style.left = pending.spineTo;
    spineAnimationRef.current?.cancel();
    spineAnimationRef.current = null;
    setTurn(null);
    onCommit(pending.to, pending.recordHistory);
    if (pending.focusId) window.setTimeout(() => document.getElementById(pending.focusId)?.focus({ preventScroll: true }), 0);
  }, [clearFallback, onCommit, spineRef]);

  const cancelTurn = useCallback(({ preserveVisual = false } = {}) => {
    const pending = turnRef.current;
    if (!pending) return;
    clearFallback();
    turnRef.current = null;
    turningRef.current = false;
    const animation = animationRef.current;
    animationRef.current = null;
    if (animation) {
      animation.onfinish = null;
      if (!preserveVisual && animation.playState !== 'finished') animation.cancel();
    }
    const spine = spineRef.current;
    if (spine) spine.style.left = pending.spineFrom;
    spineAnimationRef.current?.cancel();
    spineAnimationRef.current = null;
    setTurn(null);
  }, [clearFallback, spineRef]);

  finishRef.current = finishTurn;
  cancelRef.current = cancelTurn;

  const startTurn = useCallback((direction, { recordHistory = true, dragging = false } = {}) => {
    if (turnRef.current) return false;
    const destination = nextPosition(album, screen, page, mode, direction);
    if (!destination || (dragging && REDUCED_MOTION.matches)) return false;

    const reduced = REDUCED_MOTION.matches;
    const focusId = ['prevBtn', 'nextBtn', 'openCoverBtn', 'backCoverBtn'].includes(document.activeElement?.id)
      ? document.activeElement.id
      : null;
    const stageWidth = stageRef.current?.clientWidth || stageRef.current?.getBoundingClientRect().width || 0;
    const next = {
      id: ++idRef.current,
      from: { screen, page, albumId: album.id },
      to: { ...destination, albumId: album.id },
      direction,
      mode,
      recordHistory,
      focusId,
      reduced,
      spineFrom: getSpineLeft(screen, mode, stageWidth),
      spineTo: getSpineLeft(destination.screen, mode, stageWidth),
      stageWidth,
      dragging,
      reversing: false,
      progress: 0
    };
    turnRef.current = next;
    turningRef.current = true;
    setTurn(next);
    return true;
  }, [album, mode, page, screen, stageRef]);

  const reverseTurn = useCallback(() => {
    const pending = turnRef.current;
    if (!pending) return;
    const animation = animationRef.current;
    const duration = pending.reduced ? FADE_MS : TURN_MS;
    const progress = animation
      ? Math.max(0, Math.min(1, Number(animation.currentTime || 0) / duration))
      : pending.progress || 0;
    if (progress < 0.005 && !pending.reversing) {
      cancelTurn();
      return;
    }
    turnRef.current = { ...pending, progress, dragging: false, reversing: !pending.reversing };
    setTurn(turnRef.current);
    if (animation) {
      animation.reverse();
      spineAnimationRef.current?.reverse();
      clearFallback();
      fallbackRef.current = window.setTimeout(() => {
        if (animationRef.current !== animation || turnRef.current?.id !== pending.id) return;
        if (turnRef.current.reversing) {
          animation.onfinish = null;
          animation.currentTime = 0;
          if (spineAnimationRef.current) spineAnimationRef.current.currentTime = 0;
          cancelTurn({ preserveVisual: true });
        } else animation.finish();
      }, duration + 240);
    }
  }, [cancelTurn, clearFallback]);

  const updateProgress = useCallback(progress => {
    const pending = turnRef.current;
    if (!pending) return;
    const normalized = Math.max(0, Math.min(1, progress));
    turnRef.current = { ...pending, progress: normalized };
    const time = normalized * (pending.reduced ? FADE_MS : TURN_MS);
    if (animationRef.current) animationRef.current.currentTime = time;
    if (spineAnimationRef.current) spineAnimationRef.current.currentTime = time;
  }, []);

  const navigate = useCallback(direction => {
    if (turnRef.current) return false;
    startTurn(direction);
    return true;
  }, [startTurn]);

  useLayoutEffect(() => {
    const pending = turnRef.current;
    const node = turnLeafRef.current;
    if (!turn || !pending || pending.id !== turn.id || !node) return undefined;

    const duration = pending.reduced ? FADE_MS : TURN_MS;
    const spineNode = spineRef.current;
    const { animation, spineAnimation } = createTurnAnimations({
      node,
      spineNode,
      pending,
      onFinish: () => {
        if (turnRef.current?.id !== pending.id) return;
        if (turnRef.current.reversing) cancelRef.current?.({ preserveVisual: true });
        else finishRef.current?.({ preserveVisual: true });
      }
    });
    animationRef.current = animation;
    spineAnimationRef.current = spineAnimation || null;

    if (pending.dragging) {
      animation.pause();
      animation.currentTime = pending.progress * duration;
      spineAnimation?.pause();
      if (spineAnimation) spineAnimation.currentTime = pending.progress * duration;
    } else if (pending.reversing) {
      animation.currentTime = pending.progress * duration;
      animation.reverse();
      if (spineAnimation) {
        spineAnimation.currentTime = pending.progress * duration;
        spineAnimation.reverse();
      }
    }

    if (!pending.dragging) {
      fallbackRef.current = window.setTimeout(() => {
        if (animationRef.current !== animation || !turnRef.current || turnRef.current.id !== pending.id) return;
        if (turnRef.current.reversing) {
          animation.onfinish = null;
          animation.currentTime = 0;
          if (spineAnimationRef.current) spineAnimationRef.current.currentTime = 0;
          cancelRef.current?.({ preserveVisual: true });
        } else animation.finish();
      }, duration + 240);
    }

    return () => {
      clearFallback();
      if (animationRef.current === animation) {
        animation.onfinish = null;
        animationRef.current = null;
        if (animation.playState !== 'finished') animation.cancel();
      }
      if (spineAnimationRef.current === spineAnimation) {
        spineAnimationRef.current = null;
        if (spineAnimation?.playState !== 'finished') spineAnimation?.cancel();
      }
    };
  // The animation belongs to one immutable transition ID; reversal/drag changes
  // its player time rather than remounting the sheet.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn?.id]);

  const previousModeRef = useRef(mode);
  useLayoutEffect(() => {
    if (previousModeRef.current === mode) return;
    previousModeRef.current = mode;
    if (turnRef.current) finishTurn();
  }, [finishTurn, mode]);

  const finishGesture = useCallback(() => {
    const pending = turnRef.current;
    if (!pending) return;
    turnRef.current = { ...pending, dragging: false };
    setTurn(turnRef.current);
    const animation = animationRef.current;
    const spineAnimation = spineAnimationRef.current;
    const duration = pending.reduced ? FADE_MS : TURN_MS;
    if (pending.progress >= COMMIT_THRESHOLD) {
      animation?.play();
      spineAnimation?.play();
      if (animation) {
        clearFallback();
        fallbackRef.current = window.setTimeout(() => {
          if (animationRef.current === animation && turnRef.current?.id === pending.id) animation.finish();
        }, duration + 240);
      }
    } else reverseTurn();
  }, [clearFallback, reverseTurn]);

  const gestureHandlers = usePageTurnGesture({
    turnRef,
    stageRef,
    startTurn,
    reverseTurn,
    updateProgress,
    finishGesture
  });

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
      onSpineFinish: () => { if (spineRef.current) spineRef.current.style.left = pending.spineTo; }
    });
    spineAnimationRef.current = spineFade || null;
    animationRef.current = fade;
    turnRef.current = { ...pending, reduced: true, dragging: false, reversing: false, progress: 0 };
    setTurn(turnRef.current);
    clearFallback();
    fallbackRef.current = window.setTimeout(() => finishRef.current?.(), FADE_MS + 240);
  }, [clearFallback, spineRef]);

  useLayoutEffect(() => {
    REDUCED_MOTION.addEventListener('change', onMotionPreferenceChange);
    return () => REDUCED_MOTION.removeEventListener('change', onMotionPreferenceChange);
  }, [onMotionPreferenceChange]);

  return {
    turn,
    turnLeafRef,
    spineRef,
    turningRef,
    navigate,
    reverseTurn,
    cancelTurn,
    ...gestureHandlers
  };
}
