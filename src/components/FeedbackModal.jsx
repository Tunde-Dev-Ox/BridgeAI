import { useState, useEffect, useRef } from "react";
import { FiX, FiAlertCircle, FiStar, FiSend, FiMessageSquare } from "react-icons/fi";
import { toast } from "sonner";
import { sendFeedback } from "../services/feedback";
import { useAuthModal } from "../context/AuthModalContext";

const TYPES = [
  { value: "bug", label: "Bug Report", icon: FiAlertCircle, desc: "Something isn't working right" },
  { value: "feature", label: "Feature Suggestion", icon: FiStar, desc: "An idea to improve Goover" },
];

export default function FeedbackModal({ onClose }) {
  const { user } = useAuthModal();
  const [type, setType] = useState("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const subjectRef = useRef(null);

  useEffect(() => {
    modalRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) onClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await sendFeedback({
        type,
        subject: subject.trim(),
        message: message.trim(),
        email: user?.email || undefined,
      });
      toast.success("Feedback sent! Thanks for helping improve Bridge.");

      if (typeof pendo !== "undefined") {
        pendo.track("feedback_submitted", {
          feedbackType: type,
          subjectLength: subject.trim().length,
          messageLength: message.trim().length,
          hasEmail: !!user?.email,
        });
      }

      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to send feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const placeholder =
    type === "bug"
      ? "What happened? What did you expect to happen?"
      : "Describe your idea and how it would help you in Bridge.";

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Send feedback"
      className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto px-4"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#111214]">Send Feedback</h2>
              <p className="text-xs text-zinc-500">Help us improve Goover</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-100"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-zinc-700 mb-3">Type</legend>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const selected = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setType(t.value); subjectRef.current?.focus(); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selected
                        ? "border-brand bg-brand/5 ring-1 ring-brand/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <Icon className={`text-lg mb-1.5 ${selected ? "text-brand" : "text-zinc-400"}`} />
                    <p className={`text-sm font-semibold ${selected ? "text-[#111214]" : "text-zinc-600"}`}>
                      {t.label}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="subject" className="text-sm font-semibold text-zinc-700 block mb-1.5">
              Subject
            </label>
            <input
              ref={subjectRef}
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your feedback"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-zinc-700 placeholder-zinc-400 focus:border-zinc-400 focus:outline-2 focus:outline-zinc-300 focus:outline-offset-2 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="message" className="text-sm font-semibold text-zinc-700 block mb-1.5">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-zinc-700 placeholder-zinc-400 focus:border-zinc-400 focus:outline-2 focus:outline-zinc-300 focus:outline-offset-2 transition-colors resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !subject.trim() || !message.trim()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#111214] hover:bg-[#111214]/90 rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <FiSend className="text-sm" />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
