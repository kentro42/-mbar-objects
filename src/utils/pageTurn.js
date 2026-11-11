import { getPageCount, getSpreadStart } from './albumRoutes.js';

export const TURN_MS = 620;
export const FADE_MS = 180;
export const DRAG_THRESHOLD = 9;
export const COMMIT_THRESHOLD = 0.38;

export function nextPosition(album, screen, page, mode, direction) {
  const pageCount = getPageCount(album);
  const step = mode === 'desktop' ? 2 : 1;
  if (direction === 'next') {
    if (screen === 'back-cover') return null;
    if (screen === 'front-cover') return { screen: 'pages', page: 0 };
    const nextPage = page + step;
    return nextPage >= pageCount ? { screen: 'back-cover', page } : { screen: 'pages', page: nextPage };
  }
  if (screen === 'front-cover') return null;
  if (screen === 'back-cover') {
    return { screen: 'pages', page: getSpreadStart(pageCount - 1, mode, pageCount) };
  }
  const previousPage = page - step;
  return previousPage < 0 ? { screen: 'front-cover', page: 0 } : { screen: 'pages', page: previousPage };
}

export function getSpineLeft(screen, mode, stageWidth) {
  const spineWidth = mode === 'desktop' ? 36 : 40;
  if (screen === 'front-cover') return `${Math.max(0, mode === 'desktop' ? stageWidth * 0.25 - spineWidth / 2 : 0)}px`;
  if (screen === 'back-cover') return `${Math.max(0, mode === 'desktop' ? stageWidth * 0.75 - spineWidth / 2 : stageWidth - spineWidth)}px`;
  return mode === 'desktop' ? `${Math.max(0, stageWidth / 2 - spineWidth / 2)}px` : '0px';
}

export function getTurnLeafLayout(pending) {
  if (pending.from.screen !== 'pages' || pending.to.screen !== 'pages') {
    return { variant: 'book', left: '0px', width: '100%', hinge: pending.from.screen === 'back-cover' ? '100%' : '0%' };
  }

  if (pending.mode === 'desktop') {
    const advancing = pending.direction === 'next';
    return {
      variant: 'page',
      left: advancing ? '50%' : '0px',
      width: '50%',
      hinge: advancing ? '0%' : '100%'
    };
  }

  return { variant: 'page', left: '40px', width: 'calc(100% - 40px)', hinge: '0%' };
}

export function createTurnAnimations({ node, spineNode, pending, onFinish }) {
  const duration = pending.reduced ? FADE_MS : TURN_MS;
  const angle = pending.direction === 'next' || pending.mode === 'mobile' ? -180 : 180;
  const keyframes = pending.reduced
    ? [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'none' }]
    : [
        { opacity: 1, transform: 'translateX(0) rotateY(0deg)' },
        { opacity: 1, transform: `translateX(0) rotateY(${angle * 0.56}deg)` },
        { opacity: 1, transform: `translateX(0) rotateY(${angle}deg)` }
      ];
  const animation = node.animate(keyframes, { duration, easing: 'ease-in-out', fill: 'both' });
  const spineAnimation = spineNode?.animate(
    [{ left: pending.spineFrom }, { left: pending.spineTo }],
    { duration, easing: 'ease-in-out', fill: 'both' }
  ) || null;
  animation.onfinish = onFinish;
  return { animation, spineAnimation };
}

export function createReducedFade({ node, spineNode, transform, spineLeft, spineTarget, onFinish, onSpineFinish }) {
  const spineAnimation = spineNode?.animate(
    [{ left: spineLeft }, { left: spineTarget }],
    { duration: FADE_MS, easing: 'ease-out', fill: 'both' }
  ) || null;
  const animation = node.animate(
    [{ opacity: 1, transform }, { opacity: 0, transform }],
    { duration: FADE_MS, easing: 'ease-out', fill: 'both' }
  );
  if (spineAnimation) spineAnimation.onfinish = onSpineFinish;
  animation.onfinish = onFinish;
  return { animation, spineAnimation };
}
