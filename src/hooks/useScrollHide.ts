'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollHideOptions {
  threshold?: number;      // 开始隐藏的滚动阈值
  sensitivity?: number;     // 触发灵敏度
  hideOnMouseTop?: boolean; // 鼠标在顶部时显示
  hideDelay?: number;       // 隐藏延迟(ms)
  showDelay?: number;       // 显示延迟(ms)
}

export function useScrollHide(options: UseScrollHideOptions = {}) {
  const {
    threshold = 80,
    sensitivity = 8,
    hideOnMouseTop = true,
    hideDelay = 150,
    showDelay = 100,
  } = options;

  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const showTimer = useRef<ReturnType<typeof setTimeout>>();

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setIsHidden(true), hideDelay);
  }, [hideDelay]);

  const show = useCallback(() => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setIsHidden(false), showDelay);
  }, [showDelay]);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY.current;

      if (scrollY > threshold) {
        if (delta > sensitivity) {
          hide();
        } else if (delta < -sensitivity) {
          show();
        }
      } else {
        show();
      }

      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (hideOnMouseTop && e.clientY < 60) {
        show();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (hideOnMouseTop) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimer.current);
      clearTimeout(showTimer.current);
    };
  }, [threshold, sensitivity, hideOnMouseTop, hide, show]);

  return isHidden;
}
