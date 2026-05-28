import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiX } from "react-icons/fi";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";

export default function AuthModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    modalRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose, isLoading]);

  const handleSocialLogin = async (platform) => {
    setIsLoading(true);
    try {
      if (platform.toLowerCase() === "google") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/app",
          },
        });
        if (error) throw error;
        toast.success(`Connecting with ${platform}...`);
      } else {
        toast.error(`${platform} login is not configured yet.`);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(error.message || `Failed to sign in with ${platform}`);
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/app",
        },
      });
      if (error) throw error;
      toast.success("Magic link sent! Check your email inbox.");

      if (typeof pendo !== "undefined") {
        pendo.track("magic_link_requested", {
          emailDomain: email.split("@")[1] || "unknown",
        });
      }

      onClose();
      setEmail("");
    } catch (error) {
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication"
      className="fixed inset-0 flex items-center justify-center text-[#141414] z-50 overflow-y-auto px-4 select-none bg-white"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.04)_0%,transparent_60%)] pointer-events-none" />

      {/* Close button top right of screen */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-[#141414] hover:text-black transition-colors cursor-pointer p-2 rounded-full"
        aria-label="Close"
      >
        <FiX className="w-6 h-6 text-6xl" />
      </button>

      {/* Modal Container */}
      <div className="w-full max-w-120 text-center flex flex-col items-center py-8 relative animate-fade-in">

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#141414] mb-2 leading-tight max-w-105 font-cabinet">
          Sign up below to unlock the full potential of Goover
        </h1>

        {/* Privacy Terms */}
        <p className="text-base text-zinc-500 mb-8 font-medium max-w-90">
          By continuing, you agree to our{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700 transition-colors">
            privacy policy
          </a>.
        </p>

        {/* Auth Buttons */}
        <div className="w-full space-y-3 px-4 max-w-95">
          {/* Google Sign In */}
          <button
            onClick={() => handleSocialLogin("Google")}
            disabled={isLoading}
            className="w-full py-3.5 px-4 hover:bg-white text-[#111214] font-medium rounded-[4px] flex items-center justify-center space-x-3 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none border border-gray-300"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-base tracking-wide">Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white text-zinc-500 text-sm font-medium px-4">
                OR
              </span>
            </div>
          </div>

          {/* Divider with Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full py-3.5 border border-gray-300 focus:border-gray-500 focus:outline-2 focus:outline-gray-600 focus:outline-offset-2 rounded-[4px] text-zinc-600 placeholder-zinc-600 transition-colors px-4 text-base "
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-brand text-white font-medium rounded-[4px] flex items-center justify-center space-x-3 transition-all duration-200 hover:bg-[#111214]/95 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Loading..." : "Continue with email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
