'use client';

import { useState, useEffect } from 'react';

export default function AdhanClock() {
  const [algeriaTime, setAlgeriaTime] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = now.toLocaleTimeString('fr-FR', {
          timeZone: 'Africa/Algiers',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setAlgeriaTime(formatted);
      } catch (error) {
        console.error('Erreur récupération heure Algérie :', error);
        setAlgeriaTime('--:--:--');
      } finally {
        setLoading(false);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 sm:h-32">
        <div className="animate-pulse text-sky-300">⏳</div>
      </div>
    );
  }

  return (
    <div className="relative my-0.5 sm:my-1 flex flex-col items-center">
      <div className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-3 rounded-xl backdrop-blur-md bg-slate-900/40 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
        <div className="text-xs sm:text-xs font-bold tracking-widest text-sky-200 uppercase mb-1">
          ⏰ Heure Algérie
        </div>
        <div className="text-3xl sm:text-3xl font-bold text-sky-300 font-mono mb-1">
          {algeriaTime}
        </div>
        <div className="w-20 sm:w-24 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent mb-1.5"></div>
      </div>
    </div>
  );
}
