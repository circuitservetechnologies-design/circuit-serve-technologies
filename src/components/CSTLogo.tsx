import React from 'react';
import Image from 'next/image';

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
      <div className={`relative flex items-center justify-center rounded-full bg-black overflow-hidden shrink-0 ${className}`}
           style={{ width: size, height: size }}>
        <Image
          src="/cst-logo.jpg"
          alt="Circuit Serve Technologies Logo"
          width={size}
          height={size}
          className="object-contain w-full h-full"
          priority
        />
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
