import { useState, useEffect, useCallback } from "react";
import { FiChevronRight, FiX, FiCheck } from "react-icons/fi";
import { IoRocketOutline } from "react-icons/io5";

const TOUR_STORAGE_KEY = "bridge-tour-done";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Bridge",
    description:
      "Translate your local experience into a language global hiring managers understand instantly. Let's take 30 seconds to get you set up.",
    target: null,
  },
  {
    id: "jd",
    title: "1. Paste a Job Description",
    description:
      "Paste the job description here — or upload a PDF, paste from clipboard, or fetch the URL of the job posting.",
    target: '[data-tour="jd-form"]',
    placement: "bottom",
  },
  {
    id: "exp",
    title: "2. Describe Your Experience",
    description:
      "Tell us about your experience, projects, and achievements. Be as detailed as you like — the more context, the better the analysis.",
    target: '[data-tour="exp-form"]',
    placement: "bottom",
  },
  {
    id: "tools",
    title: "3. Import Content Easily",
    description:
      "Upload a resume PDF, paste from your clipboard, or fetch a job posting URL — Bridge extracts the text automatically.",
    target: '[data-tour="tools"]',
    placement: "top",
  },
  {
    id: "run",
    title: "4. Run the Analysis",
    description:
      "Hit the run button and Bridge will analyze your fit, identify gaps, generate a tailored cover letter, and translate your experience.",
    target: '[data-tour="run-btn"]',
    placement: "left",
  },
  {
    id: "history",
    title: "5. Track Everything",
    description:
      "All your analyses are saved to History. You can revisit, delete, or download cover letters anytime.",
    target: '[data-tour="sidebar-history"]',
    placement: "right",
  },
  {
    id: "done",
    title: "You're All Set!",
    description:
      "Ready to land that role? Start by pasting a job description and your experience. Your future self will thank you.",
    target: null,
  },
];

function useTourProgress() {
  const [step, setStep] = useState(() => {
    const done = localStorage.getItem(TOUR_STORAGE_KEY);
    return done === "true" ? -1 : 0;
  });

  const dismiss = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setStep(-1);
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      const nextStep = s + 1;
      if (nextStep >= STEPS.length) {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        return -1;
      }
      return nextStep;
    });
  }, []);

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setStep(0);
  }, []);

  return { step, next, prev, dismiss, reset, isActive: step >= 0 && step < STEPS.length };
}

function Tooltip({ step, onNext, onPrev, onDismiss, isFirst, isLast, rect }) {
  const getPosition = () => {
    if (!rect) return { top: "50%", left: "10%", transform: "translate(-50%, -50%)" };

    const gap = 16;
    const tipWidth = 320;
    const tipHeight = 200;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left;

    switch (step.placement) {
      case "right":
        left = Math.min(rect.right + gap, vw - tipWidth - 16);
        top = rect.top + rect.height / 2 - tipHeight / 2;
        top = Math.max(16, Math.min(top, vh - tipHeight - 16));
        break;
      case "left":
        left = Math.max(16, rect.left - tipWidth - gap);
        top = rect.top + rect.height / 2 - tipHeight / 2;
        top = Math.max(16, Math.min(top, vh - tipHeight - 16));
        break;
      case "top":
        left = rect.left + rect.width / 2 - tipWidth / 2;
        left = Math.max(16, Math.min(left, vw - tipWidth - 16));
        top = Math.max(16, rect.top - tipHeight - gap);
        break;
      case "bottom":
      default:
        left = rect.left + rect.width / 2 - tipWidth / 2;
        left = Math.max(16, Math.min(left, vw - tipWidth - 16));
        top = Math.min(vh - tipHeight - 16, rect.bottom + gap);
        break;
    }

    return { top: `${top}px`, left: `${left}px` };
  };

  const pos = getPosition();

  return (
    <div
      className="fixed z-100 bg-white border border-gray-200 rounded-xl p-5 shadow-2xl w-[320px] animate-fade-in"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-[#f4330d] flex items-center justify-center text-white text-xs font-bold">
            {isFirst ? <IoRocketOutline className="w-3.5 h-3.5" /> : <FiCheck className="w-3.5 h-3.5" />}
          </div>
          <span className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">
            {isFirst ? "Welcome" : `Step`}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer p-0.5"
          aria-label="Dismiss tour"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-base font-semibold text-zinc-800 mb-1.5 leading-snug">{step.title}</h3>
      <p className="text-sm text-zinc-600 leading-relaxed mb-5">{step.description}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-[#f4330d] text-white text-xs font-semibold rounded-lg hover:bg-[#f4330d]/90 transition-all cursor-pointer active:scale-[0.98] flex items-center space-x-1.5"
        >
          <span>{isLast ? "Get Started" : "Next"}</span>
          <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingTour() {
  const { step, next, prev, dismiss, isActive } = useTourProgress();
  const [rect, setRect] = useState(null);
  const currentStep = isActive ? STEPS[step] : null;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (!currentStep?.target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRect(null);
      return;
    }

    const update = () => {
      const el = document.querySelector(currentStep.target);
      if (el) setRect(el.getBoundingClientRect());
    };

    update();
    window.addEventListener("scroll", update, { once: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [currentStep?.target, currentStep?.id]);

  useEffect(() => {
    if (!currentStep?.target) return;
    const el = document.querySelector(currentStep.target);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentStep?.target, currentStep?.id]);

  if (!isActive) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-90 bg-black/30 transition-opacity duration-300"
        onClick={dismiss}
      />

      {/* Highlight ring around target */}
      {currentStep?.target && rect && (
        <div
          className="fixed z-91 rounded-xl border-2 border-[#f4330d] shadow-[0_0_0_4px_rgba(244,51,13,0.15)] pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <Tooltip
        step={currentStep}
        rect={rect}
        onNext={next}
        onPrev={prev}
        onDismiss={dismiss}
        isFirst={isFirst}
        isLast={isLast}
      />
    </>
  );
}
