import { Link } from "react-router-dom";
import { FiHome, FiArrowRight } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Animated bridge SVG */}
        <div className="relative mb-10 mx-auto w-64 h-48">
          <svg viewBox="0 0 256 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Sky glow */}
            <ellipse cx="128" cy="120" rx="140" ry="60" fill="url(#sky)" opacity="0.4" />
            <defs>
              <radialGradient id="sky" cx="50%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#f4330d" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f4330d" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Cliff left */}
            <path d="M0 130 L20 90 L45 95 L60 80 L75 85 L85 130Z" fill="#e5e5e5" />
            {/* Cliff right - broken */}
            <path d="M256 130 L236 95 L215 100 L200 110 L185 105 L175 130Z" fill="#e5e5e5" />

            {/* Broken bridge deck */}
            <path d="M85 105 L130 100 L175 108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
            <path d="M130 100 L133 85" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />

            {/* Gap spark */}
            <line x1="128" y1="92" x2="132" y2="80" stroke="#f4330d" strokeWidth="2" strokeLinecap="round" className="animate-pulse-glow" />
            <line x1="132" y1="80" x2="135" y2="88" stroke="#f4330d" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse-glow" />

            {/* Tower left */}
            <rect x="82" y="60" width="6" height="45" rx="2" fill="#d4d4d4" />
            <rect x="115" y="55" width="6" height="50" rx="2" fill="#d4d4d4" />

            {/* Tiny lost figure */}
            <g className="animate-float">
              <circle cx="130" cy="108" r="4" fill="#111214" />
              <path d="M130 112 L130 120 M130 116 L126 120 M130 116 L134 120" stroke="#111214" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Question mark */}
            <text x="130" y="78" textAnchor="middle" fill="#f4330d" fontSize="16" fontWeight="700" fontFamily="CabinetGrotesque-Medium, sans-serif">
              ?
            </text>
          </svg>
        </div>

        <h1 className="text-6xl font-semibold tracking-tight font-cabinet text-zinc-200 select-none">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight font-cabinet text-zinc-900 mt-2">
          You've wandered off the bridge
        </h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
          This page doesn't exist. Maybe it fell into the gap — or never made it across at all.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-[#111214] text-white text-sm font-semibold rounded-xl hover:bg-[#111214]/90 transition-all flex items-center gap-2 active:scale-[0.97]"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/app"
            className="px-5 py-2.5 border border-zinc-300 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2 active:scale-[0.97]"
          >
            Dashboard
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
