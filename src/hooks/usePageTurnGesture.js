import { useCallback, useEffect, useRef } from 'react';
import { REDUCED_MOTION } from '../utils/albumRoutes.js';
import { DRAG_THRESHOLD } from '../utils/pageTurn.js';

export default function usePageTurnGesture({ turnRef, stageRef, startTurn, reverseTurn, updateProgress, finishGesture }) {
  const pointerRef = useRef(null);
  const consumeClickRef = useRef(false);
  const clickResetRef = useRef(null);

  const scheduleClickReset = useCallback(delay => {
    if (clickResetRef.current) window.clearTimeout(clickResetRef.current);
    clickResetRef.current = window.setTimeout(() => {
      consumeClickRef.current = false;
      clickResetRef.current = null;
    }, delay);
  }, []);

  useEffect(() => () => {
    if (clickResetRef.current) window.clearTimeout(clickResetRef.current);
  }, []);

  const onPointerDown = useCallback(event => {
    if (turnRef.current) {
      event.preventDefault();
      consumeClickRef.current = true;
      scheduleClickReset(400);
      return;
    }
    if (event.button !== 0 || REDUCED_MOTION.matches) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest('button, select, input, textarea, a, iframe, .polaroid, .detail-sheet')) return;
    const surface = target.closest('.book-state--spread, .book-cover');
    if (!surface || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: bounds.width,
      direction: null,
      turnId: null,
      started: false
    };
    try { stageRef.current.setPointerCapture(event.pointerId); } catch { /* Optional on older browsers. */ }
  }, [scheduleClickReset, stageRef, turnRef]);

  const onPointerMove = useCallback(event => {
    const gesture = pointerRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.started) {
      if (Math.abs(dx) < DRAG_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      gesture.direction = dx < 0 ? 'next' : 'prev';
      gesture.started = startTurn(gesture.direction, { dragging: true });
      gesture.turnId = turnRef.current?.id ?? null;
      if (!gesture.started) return;
      consumeClickRef.current = true;
    }
    event.preventDefault();
    const span = Math.max(120, gesture.width * 0.48);
    updateProgress(Math.min(1, Math.abs(dx) / span));
  }, [startTurn, turnRef, updateProgress]);

  const onPointerUp = useCallback(event => {
    const gesture = pointerRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    pointerRef.current = null;
    if (!gesture.started || turnRef.current?.id !== gesture.turnId) return;
    finishGesture();
    scheduleClickReset(350);
  }, [finishGesture, scheduleClickReset, turnRef]);

  const onPointerCancel = useCallback(event => {
    const gesture = pointerRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    pointerRef.current = null;
    if (gesture.started) reverseTurn();
  }, [reverseTurn]);

  const onClickCapture = useCallback(event => {
    if (!consumeClickRef.current) return;
    consumeClickRef.current = false;
    if (clickResetRef.current) window.clearTimeout(clickResetRef.current);
    clickResetRef.current = null;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture };
}
