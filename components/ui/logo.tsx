interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', iconOnly = false, size = 'md' }: LogoProps) {
  const dimensions = {
    sm: { icon: 24, fontSize: 'text-base' },
    md: { icon: 32, fontSize: 'text-xl' },
    lg: { icon: 40, fontSize: 'text-2xl' },
  };

  const { icon: iconSize, fontSize } = dimensions[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* jB Monogram Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="justB logo"
      >
        {/* Rounded square background */}
        <rect
          width="100"
          height="100"
          rx="20"
          fill="#E85D4C"
        />
        {/* jB text in white */}
        <text
          x="50"
          y="50"
          dominantBaseline="central"
          textAnchor="middle"
          fill="white"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="42"
          fontWeight="700"
          letterSpacing="-0.02em"
        >
          jB
        </text>
      </svg>

      {/* justB wordmark */}
      {!iconOnly && (
        <span className={`font-bold ${fontSize}`}>
          <span className="text-text-dark">just</span>
          <span className="text-[#E85D4C]">B</span>
        </span>
      )}
    </div>
  );
}
