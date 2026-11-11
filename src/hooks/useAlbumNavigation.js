import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultAlbumId, findAlbum } from '../albums/index.js';
import useAlbumKeyboard from './useAlbumKeyboard.js';
import {
  getAbsolutePieceUrl,
  getCoverUrl,
  getPageCount,
  getPageForPiece,
  getPageUrl,
  getPieceUrl,
  getSpreadStart,
  getZoomTransform,
  IDENTITY_TRANSFORM,
  readInitialRoute,
  REDUCED_MOTION
} from '../utils/albumRoutes.js';

function routeFor(albumId, screen, page, itemId = null) {
  if (screen === 'front-cover') return { albumId, screen, page: 0 };
  if (screen === 'back-cover') return { albumId, screen, page };
  if (screen === 'piece') return { albumId, screen, page, itemId };
  return { albumId, screen: 'pages', page };
}

function routeUrl(route) {
  if (route.screen === 'front-cover') return getCoverUrl(route.albumId, 'front');
  if (route.screen === 'back-cover') return getCoverUrl(route.albumId, 'back');
  if (route.screen === 'piece') {
    const album = findAlbum(route.albumId);
    const item = album.pieces.find(piece => String(piece.id) === String(route.itemId));
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
  const [turn, setTurn] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [closingDetail, setClosingDetail] = useState(false);
  const [detailMotion, setDetailMotion] = useState({ transform: IDENTITY_TRANSFORM, animated: false });
  const [pendingPieceId, setPendingPieceId] = useState(initialRoute.section === 'piece' ? String(initialRoute.itemId) : null);
  const stageAlbum = findAlbum(albumId);
  const sourceElementRef = useRef(null);
  const turnRef = useRef(null);
  const turningRef = useRef(false);
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

  const finishTurn = useCallback(() => {
    const pending = turnRef.current;
    if (!pending) return;
    turnRef.current = null;
    turningRef.current = false;
    setTurn(null);
    applyPosition(pending.albumId, pending.toScreen, pending.toPage);
    if (pending.recordHistory) pushPosition(pending.albumId, pending.toScreen, pending.toPage);
    if (pending.focusId) {
      window.setTimeout(() => document.getElementById(pending.focusId)?.focus({ preventScroll: true }), 0);
    }
  }, [applyPosition, pushPosition]);

  const navigateTo = useCallback((toScreen, toPage, direction, { recordHistory = true, targetAlbumId = albumId } = {}) => {
    if (turningRef.current) return;
    const targetAlbum = findAlbum(targetAlbumId);
    const safePage = getSpreadStart(toPage, mode, getPageCount(targetAlbum));
    const focusId = ['prevBtn', 'nextBtn', 'openCoverBtn', 'backCoverBtn'].includes(document.activeElement?.id)
      ? document.activeElement.id
      : null;
    const next = { albumId: targetAlbum.id, toScreen, toPage: safePage, direction, recordHistory, focusId };

    if (REDUCED_MOTION.matches) {
      applyPosition(targetAlbum.id, toScreen, safePage);
      if (recordHistory) pushPosition(targetAlbum.id, toScreen, safePage);
      return;
    }
    turningRef.current = true;
    turnRef.current = next;
    setTurn({ fromScreen: screen, fromPage: page, ...next, active: false });
    window.requestAnimationFrame(() => {
      setTurn(current => current ? { ...current, active: true } : current);
    });
  }, [albumId, applyPosition, mode, page, pushPosition, screen]);

  const navigate = useCallback(direction => {
    const targetAlbum = findAlbum(albumId);
    const pages = getPageCount(targetAlbum);
    const step = mode === 'desktop' ? 2 : 1;
    if (direction === 'next') {
      if (screen === 'back-cover') return;
      if (screen === 'front-cover') {
        navigateTo('pages', 0, 'next');
        return;
      }
      const nextPage = page + step;
      navigateTo(nextPage >= pages ? 'back-cover' : 'pages', nextPage, 'next');
      return;
    }

    if (screen === 'front-cover') return;
    if (screen === 'back-cover') {
      navigateTo('pages', getSpreadStart(pages - 1, mode, pages), 'prev');
      return;
    }
    const previousPage = page - step;
    navigateTo(previousPage < 0 ? 'front-cover' : 'pages', previousPage, 'prev');
  }, [albumId, mode, navigateTo, page, screen]);

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
    if (REDUCED_MOTION.matches || !sourceElementRef.current?.isConnected) { finishDetailClose(); return; }
    setClosingDetail(true);
    setDetailMotion({ transform: destination, animated: true });
    closeTimerRef.current = window.setTimeout(finishDetailClose, 850);
  }, [finishDetailClose, selectedItem, stageRef]);

  const openPiece = useCallback((item, sourceElement, { recordHistory = true } = {}) => {
    if (!sourceElement || turningRef.current || isClosingRef.current) return;
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
  }, [albumId, applyPosition, mode, page, pushPosition, screen, stageAlbum, stageRef]);

  const selectAlbum = useCallback(nextAlbumId => {
    const nextAlbum = albums.find(entry => entry.id === nextAlbumId);
    if (!nextAlbum || nextAlbum.id === albumId) return;
    setPendingPieceId(null);
    applyPosition(nextAlbum.id, 'front-cover', 0);
    const route = routeFor(nextAlbum.id, 'front-cover', 0);
    window.history.pushState(route, '', routeUrl(route));
  }, [albumId, albums, applyPosition]);

  const applyRoute = useCallback(route => {
    const targetAlbum = findAlbum(route.albumId);
    if (!targetAlbum) return;
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
  }, [animateDetailClose, applyPosition, mode, selectedItem]);

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
    if (!pendingPieceId || selectedItem || turn || screen !== 'pages') return;
    const item = stageAlbum.pieces.find(piece => String(piece.id) === pendingPieceId);
    const card = document.querySelector(`.polaroid[data-piece-id="${CSS.escape(pendingPieceId)}"]`);
    if (item && card) {
      setPendingPieceId(null);
      openPiece(item, card, { recordHistory: false });
    }
  }, [openPiece, page, pendingPieceId, screen, selectedItem, stageAlbum, turn]);

  useEffect(() => {
    if (!turn) return undefined;
    const timeout = window.setTimeout(finishTurn, 1180);
    return () => window.clearTimeout(timeout);
  }, [finishTurn, turn]);

  useEffect(() => {
    if (screen === 'pages') setPage(current => getSpreadStart(current, mode, getPageCount(stageAlbum)));
  }, [mode, screen, stageAlbum]);

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

  useAlbumKeyboard({ selectedItem, navigate, turningRef, animateDetailClose });

  const onDetailTransitionEnd = useCallback(event => {
    if (event.target === event.currentTarget && event.propertyName === 'transform' && isClosingRef.current) finishDetailClose();
  }, [finishDetailClose]);

  const openCover = useCallback(() => navigate(screen === 'back-cover' ? 'prev' : 'next'), [navigate, screen]);

  return {
    album: stageAlbum, albumId, screen, page, turn, selectedItem, closingDetail, detailMotion,
    sourceElementRef, turningRef, openPiece, navigate, selectAlbum, openCover, finishTurn,
    animateDetailClose, onDetailTransitionEnd
  };
}
