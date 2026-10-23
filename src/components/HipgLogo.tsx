import { memo } from "react";

interface HipgLogoProps {
  className?: string;
  size?: number;
  variant?: "icon" | "badge" | "full";
}

/**
 * Authentic vector emblem and branding for Hambantota International Port Group (HIPG).
 * Incorporates signature maritime navy (#002040), oceanic royal blue (#0267D2) and cyan (#00A3E0) wave crests.
 */
export const HipgLogo = memo(function HipgLogo({
  className = "",
  size = 36,
  variant = "badge",
}: HipgLogoProps) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hipg-grad-blue" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0267D2" />
            <stop offset="100%" stopColor="#002040" />
          </linearGradient>
          <linearGradient id="hipg-grad-cyan" x1="10" y1="12" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Shield background */}
        <rect width="40" height="40" rx="9" fill="url(#hipg-grad-blue)" />

        {/* Outer compass / harbour gateway arc */}
        <circle cx="20" cy="20" r="14.5" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />

        {/* Stylized Port Gateway & Ship Bow / Wave Crests (H & Port anchor shape) */}
        {/* Left pillar */}
        <path
          d="M11 11H15.5V29H11V11Z"
          fill="#FFFFFF"
        />
        {/* Right pillar with curved ship bow flare */}
        <path
          d="M24.5 11H29V29H24.5V11Z"
          fill="#FFFFFF"
        />
        {/* Dynamic horizontal oceanic wave crossbar forming 'H' and ocean channel */}
        <path
          d="M13 18.2C16.5 16.5 23.5 16.5 27 18.2V22C23.5 20.2 16.5 20.2 13 22V18.2Z"
          fill="url(#hipg-grad-cyan)"
        />

        {/* Golden / Cyan maritime navigation beacon star at top */}
        <circle cx="20" cy="11.5" r="1.8" fill="#38BDF8" />
        <path
          d="M20 7.5L20.8 10L23 10.8L20.8 11.6L20 14L19.2 11.6L17 10.8L19.2 10L20 7.5Z"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* Dynamic maritime bottom wave */}
        <path
          d="M9 29.5C13 32 27 32 31 29.5"
          stroke="#38BDF8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <HipgLogo size={size} variant="icon" />
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-ink" style={{ fontSize: `${size * 0.48}px` }}>
              HIPG
            </span>
            <span className="rounded bg-signal/15 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-signal uppercase">
              Digital Twin
            </span>
          </div>
          <span className="mt-0.5 text-[10px] font-medium tracking-wide text-slate uppercase">
            Hambantota International Port
          </span>
        </div>
      </div>
    );
  }

  // Default: "badge" variant
  return (
    <div className={`relative inline-flex items-center justify-center rounded-[9px] overflow-hidden shadow-sm ${className}`} style={{ width: size, height: size }}>
      <HipgLogo size={size} variant="icon" />
    </div>
  );
});
