/**
 * Screen Wake Lock API helper to keep the display awake on shift
 */
let wakeLockSentinel: any = null;

export const isWakeLockSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
};

export const requestWakeLock = async (): Promise<boolean> => {
  if (!isWakeLockSupported()) return false;
  try {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      return true;
    }
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    console.warn('Screen WakeLock request failed:', err);
    return false;
  }
};

export const releaseWakeLock = async (): Promise<void> => {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    } catch (err) {
      console.warn('Screen WakeLock release failed:', err);
    }
  }
};
