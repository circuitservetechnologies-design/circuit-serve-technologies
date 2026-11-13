import React from 'react';

interface CSTLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export default function CSTLogo({
  className = "w-10 h-10",
  size = 40,
  showText = true,
  textClassName = "text-white",
}: CSTLogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Concentric Circuit Loop Logo representing Circuit Serve Technologies */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        >
          {/* Outer circle track */}
          <path
            d="M 68 22 A 38 38 0 1 0 76 68"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Middle circuit track */}
          <path
            d="M 60 34 A 26 26 0 1 0 66 66"
            stroke="#0ea5e9"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Inner core circuit track */}
          <path
            d="M 52 46 A 14 14 0 1 0 56 60"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          
          {/* Horizontal circuit trace extensions with contact pads */}
          <line x1="68" y1="22" x2="88" y2="22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <circle cx="90" cy="22" r="5" fill="#38bdf8" />

          <line x1="60" y1="34" x2="80" y2="34" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
          <circle cx="82" cy="34" r="4.5" fill="#0ea5e9" />

          <line x1="52" y1="46" x2="72" y2="46" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
          <circle cx="74" cy="46" r="4" fill="#38bdf8" />

          {/* Central silicon node */}
          <circle cx="48" cy="50" r="4" fill="#00F0FF" className="animate-pulse" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-lg sm:text-xl font-mono uppercase ${textClassName}`}>
            Circuit Serve
          </span>
          <span className="text-[10px] tracking-[0.28em] text-cyan-400 font-semibold uppercase mt-0.5">
            Technologies
          </span>
        </div>
      )}
    </div>
  );
}
