import React from 'react';

export const RecLogo: React.FC<{ className?: string }> = ({ className = 'h-20' }) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Emblem Square */}
      <div className="relative w-16 h-16 bg-[#5c1c72] rounded-md flex items-center justify-center border-2 border-[#f5a623] shadow-sm">
        {/* Stylized R with flame/arc */}
        <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none">
          <path
            d="M20 15 H55 C72 15, 82 25, 82 40 C82 52, 74 61, 60 63 L82 88 H62 L45 65 H35 V88 H20 V15 Z M35 30 V50 H52 C61 50, 66 46, 66 40 C66 34, 61 30, 52 30 H35 Z"
            fill="#ffffff"
          />
          <path
            d="M38 33 Q45 22 55 22 Q60 22 62 26 Q55 28 48 35 Z"
            fill="#f5a623"
          />
          <circle cx="58" cy="23" r="3" fill="#f5a623" />
        </svg>
      </div>

      {/* College Name in 3 lines */}
      <div className="text-left font-serif leading-tight">
        <div className="text-[20px] font-black tracking-wide text-[#5c1c72] uppercase" style={{ fontFamily: 'Georgia, serif' }}>
          RAJALAKSHMI
        </div>
        <div className="text-[17px] font-bold tracking-widest text-[#5c1c72] uppercase" style={{ fontFamily: 'Georgia, serif' }}>
          ENGINEERING
        </div>
        <div className="text-[17px] font-bold tracking-widest text-[#5c1c72] uppercase" style={{ fontFamily: 'Georgia, serif' }}>
          COLLEGE
        </div>
      </div>
    </div>
  );
};
