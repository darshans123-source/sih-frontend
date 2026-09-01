import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // default 7000ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 7000,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start 500ms fade out before completion
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(0, duration - 500));

    // Complete and unmount after full duration
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 500ms ease-out',
      }}
    >
      <img
        src="/vayu-guard-splash.jpg"
        alt="VAYU GUARD - Convective Weather Nowcasting"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          userSelect: 'none',
        }}
      />
    </div>
  );
};
