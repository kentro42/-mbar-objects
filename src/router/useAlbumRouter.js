import { useCallback, useEffect, useRef, useState } from 'react';
import { objetos } from '../../js/data.js';
import {
  getPageForPiece,
  getPageUrl,
  getPieceUrl,
  getZoomTransform,
  IDENTITY_TRANSFORM,
  readInitialRoute,
  REDUCED_MOTION,
  TOTAL_PAGES
} from '../utils/albumRoutes.js';
import useAlbumKeyboard from '../hooks/useAlbumKeyboard.js';

export default function useAlbumRouter(stageRef) {
  const initialRoute = useRef(readInitialRoute()).current;
  const [page, setPage] = useState(initialRoute.page);
  const [turn, setTurn] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [closingDetail, setClosingDetail] = useState(false);
  const [detailMotion, setDetailMotion] = useState({ transform: IDENTITY_TRANSFORM, animated: false });
  const sourceElementRef = useRef(null);
  const turnRef = useRef(null);
  const turningRef = useRef(false);
  const pendingPieceIdRef = useRef(null);
  const detailCloseTimerRef = useRef(null);
  const detailCloseCallbackRef = useRef(null);
  const isClosingRef = useRef(false);

  const openPiece = useCallback((item, sourceElement, { recordHistory = true } = {}) => {
    if (!sourceElement || turningRef.current || isClosingRef.current) return;
    if (recordHistory) {
      window.history.pushState({ section: 'piece', id: item.id, page }, '', getPieceUrl(item));
    }
    sourceElementRef.current = sourceElement;
    const startTransform = getZoomTransform(sourceElement, stageRef.current);
    setClosingDetail(false);
    setSelectedItem(item);
    setDetailMotion({ transform: startTransform, animated: false });
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      setDetailMotion({ transform: IDENTITY_TRANSFORM, animated: true });
    }));
  }, [page, stageRef]);

  const finishTurn = useCallback(() => {
    const pending = turnRef.current;
    if (!pending) return;
    turnRef.current = null;
    turningRef.current = false;
    setTurn(null);
    setPage(pending.to);
    if (pending.recordHistory) {
      window.history.pushState({ section: 'album', page: pending.to }, '', getPageUrl(pending.to));
    }
    if (pending.focusId) {
      window.setTimeout(() => {
        const candidate = document.querySelector(`.page-content[data-page="${pending.to}"] #${pending.focusId}`);
        if (candidate && !candidate.disabled) candidate.focus({ preventScroll: true });
        else document.querySelector(`.page-content[data-page="${pending.to}"] h1`)?.focus({ preventScroll: true });
      }, 0);
    }
  }, []);

  const turnPage = useCallback((target, direction, { recordHistory = true } = {}) => {
    if (turningRef.current || target < 0 || target >= TOTAL_PAGES || target === page) return;
    const focusId = ['prevBtn', 'nextBtn'].includes(document.activeElement?.id) ? document.activeElement.id : null;
    if (REDUCED_MOTION.matches) {
      setPage(target);
      if (recordHistory) window.history.pushState({ section: 'album', page: target }, '', getPageUrl(target));
      return;
    }
    turningRef.current = true;
    const turnState = { from: page, to: target, direction, recordHistory, focusId };
    turnRef.current = turnState;
    setTurn(turnState);
  }, [page]);

  useEffect(() => {
    if (!turn) return undefined;
    const timeout = window.setTimeout(finishTurn, 1350);
    return () => window.clearTimeout(timeout);
  }, [turn, finishTurn]);

  const finishDetailClose = useCallback(() => {
    if (detailCloseTimerRef.current) window.clearTimeout(detailCloseTimerRef.current);
    detailCloseTimerRef.current = null;
    isClosingRef.current = false;
    setClosingDetail(false);
    setSelectedItem(null);
    const source = sourceElementRef.current;
    sourceElementRef.current = null;
    if (source?.isConnected) source.focus({ preventScroll: true });
    const callback = detailCloseCallbackRef.current;
    detailCloseCallbackRef.current = null;
    callback?.();
  }, []);

  const animateDetailClose = useCallback((onFinished = null) => {
    if (!selectedItem) {
      onFinished?.();
      return;
    }
    if (isClosingRef.current) {
      if (onFinished) detailCloseCallbackRef.current = onFinished;
      return;
    }
    isClosingRef.current = true;
    detailCloseCallbackRef.current = onFinished;
    const destination = getZoomTransform(sourceElementRef.current, stageRef.current);
    if (REDUCED_MOTION.matches || !sourceElementRef.current?.isConnected) {
      finishDetailClose();
      return;
    }
    setClosingDetail(true);
    setDetailMotion({ transform: destination, animated: true });
    detailCloseTimerRef.current = window.setTimeout(finishDetailClose, 850);
  }, [finishDetailClose, selectedItem, stageRef]);

  const routeToPage = useCallback(targetPage => {
    const safePage = Math.max(0, Math.min(TOTAL_PAGES - 1, targetPage));
    if (safePage !== page) turnPage(safePage, safePage < page ? 'prev' : 'next', { recordHistory: false });
  }, [page, turnPage]);

  const routeToPiece = useCallback(item => {
    if (!item) return;
    const targetPage = getPageForPiece(item);
    if (targetPage !== page) {
      pendingPieceIdRef.current = String(item.id);
      turnPage(targetPage, targetPage < page ? 'prev' : 'next', { recordHistory: false });
      return;
    }
    const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(String(item.id))}"]`);
    if (card) openPiece(item, card, { recordHistory: false });
  }, [openPiece, page, turnPage]);

  const handleRouteChange = useCallback(routeState => {
    let route = routeState;
    if (!route || !['album', 'piece'].includes(route.section)) route = readInitialRoute();
    if (route.section === 'piece') {
      const item = objetos.find(piece => String(piece.id) === String(route.id)) || route.item;
      if (!item) return;
      const continueToPiece = () => routeToPiece(item);
      if (selectedItem) animateDetailClose(continueToPiece);
      else continueToPiece();
      return;
    }
    const targetPage = Number.isInteger(route.page) ? route.page : 0;
    const goToAlbum = () => routeToPage(targetPage);
    if (selectedItem) animateDetailClose(goToAlbum);
    else goToAlbum();
  }, [animateDetailClose, routeToPage, routeToPiece, selectedItem]);

  useEffect(() => {
    const state = { section: 'album', page: initialRoute.page };
    window.history.replaceState(state, '', getPageUrl(initialRoute.page));
    if (initialRoute.section === 'piece') {
      window.history.pushState({ section: 'piece', id: initialRoute.item.id, page: initialRoute.page }, '', getPieceUrl(initialRoute.item));
      window.requestAnimationFrame(() => {
        const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(String(initialRoute.item.id))}"]`);
        if (card) openPiece(initialRoute.item, card, { recordHistory: false });
      });
    }
    window.history.scrollRestoration = 'manual';
  // The initial URL is intentionally processed once, after the first React render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (turn || !pendingPieceIdRef.current) return;
    const id = pendingPieceIdRef.current;
    const item = objetos.find(piece => String(piece.id) === id);
    const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(id)}"]`);
    if (item && card) {
      pendingPieceIdRef.current = null;
      openPiece(item, card, { recordHistory: false });
    }
  }, [page, turn, openPiece]);

  useEffect(() => {
    const onPopState = event => handleRouteChange(event.state);
    const onHashChange = () => {
      const route = readInitialRoute();
      handleRouteChange(route.section === 'piece'
        ? { section: 'piece', id: route.item.id, page: route.page }
        : route);
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [handleRouteChange]);

  useAlbumKeyboard({ selectedItem, page, turnPage, animateDetailClose, turningRef });

  const requestBackToAlbum = useCallback(() => {
    if (window.history.state?.section === 'piece') window.history.back();
    else animateDetailClose();
  }, [animateDetailClose]);

  const onDetailTransitionEnd = useCallback(event => {
    if (event.target === event.currentTarget && event.propertyName === 'transform' && isClosingRef.current) {
      finishDetailClose();
    }
  }, [finishDetailClose]);

  return {
    page,
    turn,
    selectedItem,
    closingDetail,
    detailMotion,
    sourceElementRef,
    openPiece,
    turnPage,
    finishTurn,
    requestBackToAlbum,
    onDetailTransitionEnd
  };
}
