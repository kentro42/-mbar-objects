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
    const coverSide = pending.from.screen === 'back-cover' || pending.to.screen === 'back-cover'
      ? 'back'
      : 'front';
    if (pending.mode === 'desktop') {
      return {
        variant: 'book',
        coverSide,
        left: '25%',
        width: '50%',
        hinge: coverSide === 'front' ? '0%' : '100%'
      };
    }
    const hinge = coverSide === 'front' ? '0%' : '100%';
    return { variant: 'book', coverSide, left: '0px', width: '100%', hinge };
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
  const isCoverTurn = pending.from.screen !== 'pages' || pending.to.screen !== 'pages';
  const openFront = pending.from.screen === 'front-cover';
  const closeFront = pending.to.screen === 'front-cover';
  const openBack = pending.from.screen === 'back-cover';
  const sign = openFront || closeFront ? -1 : 1;
  const coverOpening = openFront || openBack;
  const coverShift = pending.mode === 'desktop'
    ? (openFront || closeFront ? 1 : -1) * 50
    : 0;
  const coverFrames = coverOpening
    ? [
        ['translateX(0%) rotateY(0deg)', 0.04, 0.04],
        [`translateX(${coverShift / 2}%) rotateY(${sign * 90}deg)`, 0.3, 0.36],
        [`translateX(${coverShift}%) rotateY(${sign * 180}deg)`, 0.08, 0.08]
      ]
    : [
        [`translateX(${coverShift}%) rotateY(${sign * 180}deg)`, 0.08, 0.08],
        [`translateX(${coverShift / 2}%) rotateY(${sign * 90}deg)`, 0.3, 0.36],
        ['translateX(0%) rotateY(0deg)', 0.04, 0.04]
      ];
  const angle = pending.direction === 'next' || pending.mode === 'mobile' ? -180 : 180;
  const pageFrames = [
    ['translateX(0) rotateY(0deg)', 0.04, 0.04],
    [`translateX(0) rotateY(${angle * 0.56}deg)`, 0.3, 0.36],
    [`translateX(0) rotateY(${angle}deg)`, 0.08, 0.08]
  ];
  const frames = isCoverTurn ? coverFrames : pageFrames;
  const keyframes = pending.reduced
    ? [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'none' }]
    : frames.map(([transform, shadow, light]) => ({
        opacity: 1,
        transform,
        '--turn-shadow-opacity': shadow,
        '--turn-light-opacity': light
      }));
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
