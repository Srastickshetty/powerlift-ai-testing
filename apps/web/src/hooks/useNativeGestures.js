/**
 * useNativeGestures.js - Native Mobile Gestures & Back-Navigation Engine
 * 1. Android popstate hardware/gesture back interceptor
 * 2. iOS left-edge horizontal swipe-to-go-back gesture
 */

import { useEffect, useRef } from 'react';

/**
 * Android Hardware Back Button / PopState Interceptor
 * Intercepts physical back swipes and hardware keys to close modals/sub-views
 * instead of kicking the athlete back to the browser start page.
 */
export function useAndroidBackInterceptor({ onBack, isActive = false }) {
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (!isActive || typeof window === 'undefined') return;

    // Push a dummy history state so browser popstate can catch back action
    window.history.pushState({ titan_trap: true, timestamp: Date.now() }, '');
    isPushedRef.current = true;

    const handlePopState = (e) => {
      // If user pressed back, trigger our internal handler
      if (onBack) {
        onBack();
      }
      isPushedRef.current = false;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up history state if unmounted without popstate
      if (isPushedRef.current && window.history.state?.titan_trap) {
        // Avoid lingering state
      }
    };
  }, [isActive, onBack]);
}

/**
 * iOS Left-Edge Horizontal Swipe-to-Go-Back
 * Detects native Apple style edge swipes starting within 30px of the screen's left edge
 */
export function useIOSEdgeSwipeBack({ onSwipeBack, enabled = true, threshold = 75 }) {
  const touchStartRef = useRef({ x: 0, y: 0, time: 0, isEdge: false });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      // Only activate if gesture originates within 32px of the left bezel (native iOS standard)
      const isEdge = touch.clientX <= 32;
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        isEdge
      };
    };

    const handleTouchEnd = (e) => {
      const { x, y, time, isEdge } = touchStartRef.current;
      if (!isEdge) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - x;
      const deltaY = Math.abs(touch.clientY - y);
      const duration = Date.now() - time;

      // Valid horizontal edge swipe: moved right >= threshold, vertical deviation < 60px, within 450ms
      if (deltaX >= threshold && deltaY < 60 && duration < 450) {
        if (onSwipeBack) {
          onSwipeBack();
        }
      }

      touchStartRef.current.isEdge = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onSwipeBack, threshold]);
}

export default {
  useAndroidBackInterceptor,
  useIOSEdgeSwipeBack
};
