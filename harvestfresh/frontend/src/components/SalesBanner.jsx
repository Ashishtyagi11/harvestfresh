import React, { useEffect, useState } from 'react';
import api from '../services/api';

export const SalesBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements/active');
        setAnnouncements(res.data);
      } catch (err) {
        console.error("Fetch sales banners error", err);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative bg-gradient-to-r ${current.bg_gradient || 'from-emerald-800 via-teal-900 to-emerald-950'} text-white px-4 py-2.5 shadow-md transition-all duration-500`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-jakarta">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="material-symbols-outlined text-amber-300 animate-pulse shrink-0">campaign</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold uppercase tracking-wide bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md text-[10px]">
              {current.banner_type?.replace('_', ' ') || 'SPECIAL SALE'}
            </span>
            <span className="font-bold text-emerald-100">{current.title}:</span>
            <span className="text-white/90 hidden sm:inline">{current.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {current.promo_code && (
            <button
              onClick={() => handleCopyCode(current.promo_code)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-200 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>{copied ? 'COPIED!' : `CODE: ${current.promo_code}`}</span>
              <span className="material-symbols-outlined text-xs">{copied ? 'check' : 'content_copy'}</span>
            </button>
          )}

          {announcements.length > 1 && (
            <span className="text-[10px] text-emerald-300/80 font-mono hidden md:inline">
              {currentIndex + 1}/{announcements.length}
            </span>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="text-emerald-200/70 hover:text-white p-0.5"
            title="Dismiss announcement"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
