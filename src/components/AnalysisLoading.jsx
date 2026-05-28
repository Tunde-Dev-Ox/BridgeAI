export default function AnalysisLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <svg
        viewBox="0 0 240 120"
        className="w-full max-w-xs h-auto mb-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Document background */}
        <rect x="20" y="10" width="200" height="100" rx="6" fill="white" stroke="#e5e5e5" strokeWidth="1" />

        {/* Text lines shimmering */}
        {[30, 45, 60, 75, 90].map((y, i) => (
          <rect
            key={y}
            x={40}
            y={y}
            width={i === 2 ? 100 : 160 - i * 15}
            height="6"
            rx="3"
            fill={`rgba(0,0,0,${0.12 - i * 0.015})`}
            className="animate-shimmer"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}

        {/* Scanning beam */}
        <defs>
          <linearGradient id="scan-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(244,51,13,0)" />
            <stop offset="40%" stopColor="rgba(244,51,13,0.15)" />
            <stop offset="60%" stopColor="rgba(244,51,13,0.15)" />
            <stop offset="100%" stopColor="rgba(244,51,13,0)" />
          </linearGradient>
        </defs>

        <rect x="20" y="10" width="200" height="100" rx="6" fill="url(#scan-beam)">
          <animate
            attributeName="y"
            from="10"
            to="110"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Beam line */}
        <line x1="20" y1="60" x2="220" y2="60" stroke="#f4330d" strokeWidth="1.5" opacity="0.6">
          <animate
            attributeName="y1"
            from="10"
            to="110"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            from="10"
            to="110"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </line>

        {/* Bridge icon in corner */}
        <g transform="translate(185, 75)" className="animate-float-slow" style={{ animationDelay: "0.5s" }}>
          <rect x="0" y="8" width="24" height="2" rx="1" fill="#f4330d" opacity="0.5" />
          <rect x="4" y="0" width="2" height="12" rx="1" fill="#a3a3a3" />
          <rect x="18" y="0" width="2" height="12" rx="1" fill="#a3a3a3" />
          <path d="M5 3 Q12 8 19 3" stroke="#d4d4d4" strokeWidth="1" fill="none" />
        </g>
      </svg>

      <div className="flex items-center space-x-3 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse-glow" />
        <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse-glow" style={{ animationDelay: "0.3s" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse-glow" style={{ animationDelay: "0.6s" }} />
      </div>
      <p className="text-sm text-zinc-500 font-medium animate-pulse-glow" style={{ animationDelay: "0.2s" }}>
        Analyzing your profile...
      </p>
    </div>
  );
}
