import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultAlbumId, findAlbum } from '../albums/index.js';
import useAlbumKeyboard from './useAlbumKeyboard.js';
import usePageTurn from './usePageTurn.js';
import {
  getPageCount,
  getPageForPiece,
  getPageUrl,
  getPieceUrl,
  getSpreadStart,
  getZoomTransform,
  IDENTITY_TRANSFORM,
  readInitialRoute
} from '../utils/albumRoutes.js';

function routeFor(albumId, screen, page, itemId = null) {
  if (screen === 'front-cover') return { albumId, screen, page: 0 };
  if (screen === 'back-cover') return { albumId, screen, page };
  if (screen === 'piece') return { albumId, screen, page, itemId };
  return { albumId, screen: 'pages', page };
}

function routeUrl(route) {
  if (route.screen === 'front-cover') return `${window.location.pathname}${window.location.search}#album/${encodeURIComponent(route.albumId)}/portada`;
  if (route.screen === 'back-cover') return `${window.location.pathname}${window.location.search}#album/${encodeURIComponent(route.albumId)}/contraportada`;
  if (route.screen === 'piece') {
    const album = findAlbum(route.albumId);
    const item = album?.pieces.find(piece => String(piece.id) === String(route.itemId));
    return item ? getPieceUrl(route.albumId, item) : getPageUrl(route.albumId, route.page);
  }
  return getPageUrl(route.albumId, route.page);
}

export default function useAlbumNavigation(albums, mode, stageRef) {
  const initialRouteRef = useRef(readInitialRoute(albums, defaultAlbumId));
  const initialRoute = initialRouteRef.current;
  const [albumId, setAlbumId] = useState(initialRoute.albumId);
  const [screen, setScreen] = useState(initialRoute.section === 'piece' ? 'pages' : initialRoute.section);
  const [page, setPage] = useState(() => getSpreadStart(initialRoute.page, mode, getPageCount(findAlbum(initialRoute.albumId))));
  const [selectedItem, setSelectedItem] = useState(null);
  const [closingDetail, setClosingDetail] = useState(false);
  const [detailMotion, setDetailMotion] = useState({ transform: IDENTITY_TRANSFORM, animated: false });
  const [pendingPieceId, setPendingPieceId] = useState(initialRoute.section === 'piece' ? String(initialRoute.itemId) : null);
  const stageAlbum = findAlbum(albumId);
  const spineRef = useRef(null);
  const sourceElementRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);
  const closeCallbackRef = useRef(null);

  const pushPosition = useCallback((nextAlbumId, nextScreen, nextPage, itemId = null) => {
    const route = routeFor(nextAlbumId, nextScreen, nextPage, itemId);
    window.history.pushState(route, '', routeUrl(route));
  }, []);

  const applyPosition = useCallback((nextAlbumId, nextScreen, nextPage) => {
    const targetAlbum = findAlbum(nextAlbumId);
    const normalizedPage = getSpreadStart(nextPage, mode, getPageCount(targetAlbum));
    setAlbumId(targetAlbum.id);
    setScreen(nextScreen);
    setPage(normalizedPage);
    setSelectedItem(null);
    setClosingDetail(false);
  }, [mode]);

  const commitTurn = useCallback((position, recordHistory) => {
    applyPosition(position.albumId, position.screen, position.page);
    if (recordHistory) pushPosition(position.albumId, position.screen, position.page);
  }, [applyPosition, pushPosition]);

  const pageTurn = usePageTurn({ album: stageAlbum, mode, screen, page, stageRef, spineRef, onCommit: commitTurn });

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
    if (!selectedItem) { onFinished?.(); return; }
    if (isClosingRef.current) { if (onFinished) closeCallbackRef.current = onFinished; return; }
    isClosingRef.current = true;
    closeCallbackRef.current = onFinished;
    const destination = getZoomTransform(sourceElementRef.current, stageRef.current);
    if (!sourceElementRef.current?.isConnected) { finishDetailClose(); return; }
    setClosingDetail(true);
    setDetailMotion({ transform: destination, animated: true });
    closeTimerRef.current = window.setTimeout(finishDetailClose, 850);
  }, [finishDetailClose, selectedItem, stageRef]);

  const openPiece = useCallback((item, sourceElement, { recordHistory = true } = {}) => {
    if (!sourceElement || pageTurn.turningRef.current || isClosingRef.current) return;
    const targetPage = getPageForPiece(stageAlbum, item, mode);
    if (targetPage !== page || screen !== 'pages') {
      setPendingPieceId(String(item.id));
      if (recordHistory) pushPosition(albumId, 'piece', targetPage, item.id);
      applyPosition(albumId, 'pages', targetPage);
    } else if (recordHistory) {
      pushPosition(albumId, 'piece', targetPage, item.id);
    }
    sourceElementRef.current = sourceElement;
    const startTransform = getZoomTransform(sourceElement, stageRef.current);
    setClosingDetail(false);
    setSelectedItem(item);
    setDetailMotion({ transform: startTransform, animated: false });
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      setDetailMotion({ transform: IDENTITY_TRANSFORM, animated: true });
    }));
  }, [albumId, applyPosition, mode, page, pageTurn.turningRef, pushPosition, screen, stageAlbum, stageRef]);

  const selectAlbum = useCallback(nextAlbumId => {
    const nextAlbum = albums.find(entry => entry.id === nextAlbumId);
    if (!nextAlbum || nextAlbum.id === albumId) return;
    pageTurn.cancelTurn();
    setPendingPieceId(null);
    applyPosition(nextAlbum.id, 'front-cover', 0);
    const route = routeFor(nextAlbum.id, 'front-cover', 0);
    window.history.pushState(route, '', routeUrl(route));
  }, [albumId, albums, applyPosition, pageTurn.cancelTurn]);

  const applyRoute = useCallback(route => {
    const targetAlbum = findAlbum(route.albumId);
    if (!targetAlbum) return;
    pageTurn.cancelTurn();
    if (route.screen === 'piece') {
      const item = targetAlbum.pieces.find(piece => String(piece.id) === String(route.itemId));
      if (!item) return;
      const targetPage = getPageForPiece(targetAlbum, item, mode);
      const openFromRoute = () => {
        setAlbumId(targetAlbum.id);
        setScreen('pages');
        setPage(targetPage);
        setPendingPieceId(String(item.id));
      };
      if (selectedItem) animateDetailClose(openFromRoute);
      else openFromRoute();
      return;
    }
    const targetScreen = ['front-cover', 'back-cover'].includes(route.screen) ? route.screen : 'pages';
    const targetPage = getSpreadStart(route.page, mode, getPageCount(targetAlbum));
    const apply = () => {
      setPendingPieceId(null);
      applyPosition(targetAlbum.id, targetScreen, targetPage);
    };
    if (selectedItem) animateDetailClose(apply);
    else apply();
  }, [animateDetailClose, applyPosition, mode, pageTurn.cancelTurn, selectedItem]);

  useEffect(() => {
    const start = routeFor(albumId, screen, page);
    window.history.replaceState(start, '', routeUrl(start));
    if (initialRoute.section === 'piece') {
      const item = stageAlbum.pieces.find(piece => String(piece.id) === String(initialRoute.itemId));
      if (item) {
        const route = routeFor(stageAlbum.id, 'piece', page, item.id);
        window.history.pushState(route, '', getPieceUrl(stageAlbum.id, item));
      }
    }
    window.history.scrollRestoration = 'manual';
  // The route is initialized once after the first React render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pendingPieceId || selectedItem || pageTurn.turn || screen !== 'pages') return;
    const item = stageAlbum.pieces.find(piece => String(piece.id) === pendingPieceId);
    const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(pendingPieceId)}"]`);
    if (item && card) {
      setPendingPieceId(null);
      openPiece(item, card, { recordHistory: false });
    }
  }, [openPiece, page, pageTurn.turn, pendingPieceId, screen, selectedItem, stageAlbum]);

  useEffect(() => {
    if (screen !== 'pages' || pageTurn.turn) return;
    setPage(current => getSpreadStart(current, mode, getPageCount(stageAlbum)));
  }, [mode, pageTurn.turn, screen, stageAlbum]);

  useEffect(() => {
    const onPopState = event => {
      const route = event.state?.albumId ? event.state : readInitialRoute(albums, defaultAlbumId);
      applyRoute(route);
    };
    const onHashChange = () => applyRoute(readInitialRoute(albums, defaultAlbumId));
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [albums, applyRoute]);

  useAlbumKeyboard({
    selectedItem,
    navigate: pageTurn.navigate,
    reverseTurn: pageTurn.reverseTurn,
    turningRef: pageTurn.turningRef,
    animateDetailClose
  });

  const onDetailTransitionEnd = useCallback(event => {
    if (event.target === event.currentTarget && event.propertyName === 'transform' && isClosingRef.current) finishDetailClose();
  }, [finishDetailClose]);

  const openCover = useCallback(() => pageTurn.navigate(screen === 'back-cover' ? 'prev' : 'next'), [pageTurn.navigate, screen]);

  return {
    album: stageAlbum,
    albumId,
    screen,
    page,
    turn: pageTurn.turn,
    turnLeafRef: pageTurn.turnLeafRef,
    spineRef: pageTurn.spineRef,
    selectedItem,
    closingDetail,
    detailMotion,
    sourceElementRef,
    turningRef: pageTurn.turningRef,
    openPiece,
    navigate: pageTurn.navigate,
    selectAlbum,
    openCover,
    animateDetailClose,
    onDetailTransitionEnd,
    pointerHandlers: {
      onPointerDown: pageTurn.onPointerDown,
      onPointerMove: pageTurn.onPointerMove,
      onPointerUp: pageTurn.onPointerUp,
      onPointerCancel: pageTurn.onPointerCancel,
      onClickCapture: pageTurn.onClickCapture
    }
  };
}
