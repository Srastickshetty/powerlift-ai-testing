/**
 * usePlatform.js - Platform-Aware Theme & Environment Detection Hook
 * Detects iOS, Android, Desktop, and Standalone PWA modes.
 * Dynamically injects OS classes and returns platform design tokens.
 */

import { useState, useEffect, useMemo } from 'react';

export function usePlatform() {
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const [platformInfo, setPlatformInfo] = useState(() => {
    if (typeof window === 'undefined') {
      return { isIOS: false, isAndroid: false, isDesktop: true, isMobile: false, platform: 'desktop' };
    }

    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || window.innerWidth < 768;
    const isDesktop = !isIOS && !isAndroid && window.innerWidth >= 1024;
    const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

    return { isIOS, isAndroid, isDesktop, isMobile, platform };
  });

  // Inject OS and display mode classes to <html>
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('platform-ios', 'platform-android', 'platform-desktop');
    root.classList.add(`platform-${platformInfo.platform}`);

    if (isStandalone) {
      root.classList.add('display-standalone');
      root.classList.remove('display-browser');
    } else {
      root.classList.add('display-browser');
      root.classList.remove('display-standalone');
    }

    // Match media listener for dynamic changes (e.g. desktop window resize or install)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [platformInfo.platform, isStandalone]);

  // Design tokens customized per OS
  const tokens = useMemo(() => {
    return {
      headerAlignment: platformInfo.isIOS ? 'center' : 'left',
      backButtonStyle: platformInfo.isIOS ? 'chevron' : 'arrow',
      navigationBarBlur: platformInfo.isIOS ? 'backdrop-blur-xl bg-black/75' : 'bg-zinc-950/95 shadow-md',
      fontStack: platformInfo.isIOS
        ? '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        : platformInfo.isAndroid
        ? '"Roboto", "Noto Sans", sans-serif'
        : '"Outfit", sans-serif',
      hapticTap: () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(10); } catch (e) {}
        }
      }
    };
  }, [platformInfo]);

  return {
    ...platformInfo,
    isStandalone,
    isPWA: isStandalone,
    tokens
  };
}

export default usePlatform;
