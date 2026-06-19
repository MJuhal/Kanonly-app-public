import { useEffect, useState } from 'react';

export function SplashScreen({ progress, initialized }) {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'exiting' | 'unmounted'

  useEffect(() => {
    if (initialized && phase === 'loading') {
      const timer = setTimeout(() => setPhase('exiting'), 400);
      return () => clearTimeout(timer);
    }
  }, [initialized, phase]);

  useEffect(() => {
    if (phase === 'exiting') {
      const timer = setTimeout(() => setPhase('unmounted'), 700);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === 'unmounted') return null;

  const progressWidth = `${Math.min(100, Math.max(0, Math.round(progress)))}%`;

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F0F0F]',
        'transition-opacity duration-700 ease-out',
        phase === 'exiting' ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
      aria-live="polite"
      aria-busy={!initialized}
    >
      <img
        src="/logo-text.svg"
        alt="KANONLY"
        className="h-10 w-auto mb-8 select-none"
        draggable={false}
      />
      <div className="w-48 h-[2px] bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#54E8F3] transition-[width] duration-100 ease-out"
          style={{ width: progressWidth }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
