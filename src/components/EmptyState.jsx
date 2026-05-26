export default function EmptyState({ onNewAnalysis }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <svg
        viewBox="0 0 320 200"
        className="w-full max-w-sm h-auto mb-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="100%" stopColor="#f5f5f5" />
          </linearGradient>
          <linearGradient id="beam-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(244,51,13,0)" />
            <stop offset="50%" stopColor="rgba(244,51,13,0.3)" />
            <stop offset="100%" stopColor="rgba(244,51,13,0)" />
          </linearGradient>
        </defs>

        <rect width="320" height="200" fill="url(#sky)" rx="16" />

        {/* Left cliff */}
        <path d="M0 160 L0 140 Q20 130 40 135 L50 170 L0 170 Z" fill="#e5e5e5" className="animate-float-slow" style={{ animationDelay: "0s" }} />
        <path d="M0 150 Q10 145 20 148 L25 165 L0 165 Z" fill="#d4d4d4" className="animate-float-slow" style={{ animationDelay: "0s" }} />

        {/* Right cliff */}
        <path d="M320 160 L320 145 Q300 135 280 140 L270 170 L320 170 Z" fill="#e5e5e5" className="animate-float-slow" style={{ animationDelay: "0.5s" }} />
        <path d="M320 155 Q310 148 300 152 L295 165 L320 165 Z" fill="#d4d4d4" className="animate-float-slow" style={{ animationDelay: "0.5s" }} />

        {/* Bridge towers */}
        <rect x="55" y="80" width="6" height="80" rx="1" fill="#a3a3a3" className="animate-float-slow" style={{ animationDelay: "0.2s" }} />
        <rect x="259" y="80" width="6" height="80" rx="1" fill="#a3a3a3" className="animate-float-slow" style={{ animationDelay: "0.7s" }} />

        {/* Tower tops */}
        <rect x="52" y="78" width="12" height="4" rx="1" fill="#737373" />
        <rect x="256" y="78" width="12" height="4" rx="1" fill="#737373" />

        {/* Bridge deck (beam extending animation) */}
        <rect x="58" y="120" width="204" height="4" rx="1" fill="#f4330d" className="animate-beam-extend" opacity="0.6" />

        {/* Main cables */}
        <path d="M58 85 Q160 100 262 85" stroke="#d4d4d4" strokeWidth="1.5" fill="none" className="animate-float-slow" style={{ animationDelay: "0.3s" }} />
        <path d="M58 90 Q160 115 262 90" stroke="#d4d4d4" strokeWidth="1" fill="none" className="animate-float-slow" style={{ animationDelay: "0.6s" }} />

        {/* Vertical suspender cables */}
        {[80, 100, 120, 140, 160, 180, 200, 220, 240].map((x, i) => (
          <line key={x} x1={x} y1={85 + 15 * Math.sin((i / 8) * Math.PI)} x2={x} y2={120} stroke="#e5e5e5" strokeWidth="0.8" className="animate-float-slow" style={{ animationDelay: `${0.1 * i}s` }} />
        ))}

        {/* Glowing center dot — bridge's "keystone" */}
        <circle cx="160" cy="122" r="6" fill="#f4330d" opacity="0.15" className="animate-pulse-glow" />
        <circle cx="160" cy="122" r="3" fill="#f4330d" opacity="0.6" className="animate-pulse-glow" style={{ animationDelay: "0.5s" }} />

        {/* Dashed path — the journey */}
        <path
          d="M40 155 Q160 175 280 155"
          stroke="#f4330d"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.3"
          fill="none"
        />

        {/* Traveling dots along the dashed path */}
        <circle r="3" fill="#f4330d" opacity="0.7">
          <animateMotion dur="3s" repeatCount="indefinite" path="M40 155 Q160 175 280 155" />
        </circle>
        <circle r="2" fill="#f4330d" opacity="0.4">
          <animateMotion dur="3s" repeatCount="indefinite" path="M40 155 Q160 175 280 155" begin="1s" />
        </circle>
        <circle r="2" fill="#f4330d" opacity="0.3">
          <animateMotion dur="3s" repeatCount="indefinite" path="M40 155 Q160 175 280 155" begin="2s" />
        </circle>

        {/* Birds */}
        <g className="animate-float-slow" style={{ animationDelay: "0.8s" }}>
          <path d="M110 60 Q115 55 120 60" stroke="#a3a3a3" strokeWidth="1.2" fill="none" />
          <path d="M120 60 Q125 55 130 60" stroke="#a3a3a3" strokeWidth="1.2" fill="none" />
        </g>
        <g className="animate-float-slow" style={{ animationDelay: "1.2s" }}>
          <path d="M200 50 Q204 46 208 50" stroke="#a3a3a3" strokeWidth="1" fill="none" />
          <path d="M208 50 Q212 46 216 50" stroke="#a3a3a3" strokeWidth="1" fill="none" />
        </g>

        {/* Tiny figure on left cliff */}
        <g className="animate-float-slow" style={{ animationDelay: "0.1s" }}>
          <circle cx="30" cy="138" r="3" fill="#525252" />
          <path d="M30 141 L30 150 M28 146 L30 148 L32 146 M28 152 L30 150 L32 152" stroke="#525252" strokeWidth="1" fill="none" />
          {/* Arm waving */}
          <path d="M30 143 L25 140" stroke="#525252" strokeWidth="0.8" fill="none" className="animate-float" style={{ animationDelay: "0.5s" }} />
        </g>

        {/* Heart/sparkle above the bridge */}
        <text x="160" y="50" textAnchor="middle" fontSize="14" className="animate-float" style={{ animationDelay: "1s" }}>
          ✨
        </text>
      </svg>

      <h3 className="text-xl font-semibold text-zinc-900 font-cabinet mb-2">
        Your first bridge is waiting
      </h3>
      <p className="text-sm text-zinc-500 max-w-xs text-center leading-relaxed mb-6">
        No analyses yet. Translate your experience into a language global hiring managers understand instantly.
      </p>
      {onNewAnalysis && (
        <button
          onClick={onNewAnalysis}
          className="px-6 py-2.5 bg-[#f4330d] text-white text-sm font-semibold rounded-lg hover:bg-[#f4330d]/90 transition-all cursor-pointer active:scale-[0.98] animate-bounce-in"
        >
          Build Your First Bridge ✦
        </button>
      )}
    </div>
  );
}
