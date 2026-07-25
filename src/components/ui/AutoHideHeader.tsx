'use client';

import { useEffect, useRef, useState } from 'react';

interface AutoHideHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AutoHideHeader({ 
  children, 
  className = ''
}: AutoHideHeaderProps) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY.current;
      
      if (scrollY > 80) {
        if (delta > 8) {
          setIsHidden(true);
        } else if (delta < -8) {
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
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
      if (e.clientY < 60) {
        setIsHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isHidden ? '-mt-[60px] opacity-0 pointer-events-none' : 'mt-0 opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
