import React from 'react';

interface SharkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  theme?: 'light' | 'white' | 'badge';
}

export const SharkLogo: React.FC<SharkLogoProps> = ({
  className = '',
  size = 'md',
  withText = true
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Modern Shark Logo with Cyber-Ocean container feel */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600 shadow-md shadow-sky-400/30 p-2 text-white overflow-hidden ${sizeMap[size]}`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        
        {/* Shark Shape with Sharp Fin */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transform -rotate-6 transition-transform hover:rotate-0 duration-300"
        >
          {/* Shark Body & Dorsal Fin */}
          <path
            d="M8 36C14 26 28 22 36 22C42 16 46 8 47 6C47.5 12 47 18 45 22C54 22 59 28 62 33C57 32 50 34 46 36C42 38 38 42 36 46C34 43 32 40 28 40C20 40 14 44 8 36Z"
            fill="currentColor"
          />
          {/* Shark Underbelly */}
          <path
            d="M14 36C20 34 28 35 34 38C32 41 28 40 24 40C18 40 15 42 14 36Z"
            fill="#e0f2fe"
            opacity="0.9"
          />
          {/* Tail Fin */}
          <path
            d="M6 34C3 31 1 27 2 24C4 28 7 32 10 33C8 36 5 40 3 43C3 39 5 36 6 34Z"
            fill="currentColor"
          />
          {/* Pectoral Fin */}
          <path
            d="M26 38C22 42 18 47 16 51C20 48 25 45 28 41L26 38Z"
            fill="#bae6fd"
          />
          {/* Shark Eye */}
          <circle cx="50" cy="27" r="2.2" fill="#0369a1" />
          <circle cx="50.6" cy="26.4" r="0.8" fill="white" />
          {/* Shark Gills */}
          <path d="M40 28C39.5 30 39.5 32 40 34" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
          <path d="M42.5 29C42 31 42 32.5 42.5 34" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
        </svg>

        {/* Small sparkling bubble */}
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-pulse"></div>
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight bg-gradient-to-r from-sky-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-['Plus_Jakarta_Sans',sans-serif] ${textSizeMap[size]}`}>
              NAZLA
            </span>
            <span className={`font-semibold text-sky-800 ${textSizeMap[size]}`}>
              TERMINAL
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
              SHARK PORT
            </span>
          </div>
          <span className="text-[11px] font-medium text-sky-600 tracking-wide">
            Sistem Operasional Terminal Petikemas
          </span>
        </div>
      )}
    </div>
  );
};
