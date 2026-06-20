import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart, FiGlobe, FiTarget, FiFileText, FiLinkedin, FiTwitter, FiChevronDown } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { useAuthModal } from "../context/AuthModalContext";
import { supabase } from "../supabaseClient";

const FEATURES = [
  {
    icon: FiBarChart,
    title: "Fit Score Analysis",
    desc: "Get a data-driven match score across role alignment, experience depth, industry context, and cultural fluency.",
  },
  {
    icon: FiGlobe,
    title: "Experience Translation",
    desc: "Turn local market achievements into language global hiring managers immediately understand and value.",
  },
  {
    icon: FiTarget,
    title: "Gap Analysis",
    desc: "Identify exactly what's missing between your profile and the job description, with actionable suggestions.",
  },
  {
    icon: FiFileText,
    title: "Cover Letter Generator",
    desc: "Generate a tailored cover letter that bridges your experience to the role's requirements.",
  },
];

const STEPS = [
  { num: "01", title: "Paste a Job Description", desc: "Copy and paste any job description, upload a PDF, or fetch from a URL." },
  { num: "02", title: "Describe Your Experience", desc: "Tell us about your projects, achievements, and impact in your local market." },
  { num: "03", title: "Get Your Analysis", desc: "Receive a comprehensive fit score, translation, gap analysis, and cover letter." },
];

const FAQS = [
  {
    q: "What is Goover?",
    a: "Goover is an AI-powered tool that helps product managers translate their local market experience into language global hiring managers immediately understand. It analyzes your profile against any job description and delivers a fit score, experience translation, gap analysis, and tailored cover letter.",
  },
  {
    q: "How does the fit score work?",
    a: "The fit score is calculated across four dimensions: role alignment (how your title and responsibilities match), experience depth (years and complexity), industry context (domain relevance), and cultural fluency (cross-market adaptability). Each dimension gets a score from 0-100, combined into an overall fit percentage.",
  },
  {
    q: "Is Goover free to use?",
    a: "Yes, Goover is completely free during our beta. You can run unlimited analyses, generate cover letters, and save your history. We'll announce pricing if we introduce paid plans in the future.",
  },
  {
    q: "What file types can I upload?",
    a: "You can upload PDF, DOCX, and TXT files. Goover extracts the text automatically and uses it for analysis. You can also paste text directly, copy from your clipboard, or fetch content from a URL.",
  },
  {
    q: "How is my data handled?",
    a: "Your data is encrypted in transit and at rest. Job descriptions and experience summaries are sent to Google Gemini solely for analysis and are not used for training. Analysis results are stored in your private account and you can delete them anytime.",
  },
  {
    q: "Can I use Goover on mobile?",
    a: "Yes, Goover is fully responsive and works on mobile, tablet, and desktop. The interface adapts to your screen size with a bottom navigation bar on mobile devices.",
  },
  {
    q: "Who is Goover built for?",
    a: "Goover is built for emerging market product managers who want to take their careers global. But, it can also be used by other tech professionals from emerging markets who want to take their careers global.",
  }
];

const FOOTER_LINKS = {
  Product: [
    { label: "How It Works", to: "/#how-it-works" },
    { label: "Features", to: "/#features" },
    { label: "FAQ", to: "/#faq" }
  ],
  Company: [
    { label: "Privacy", to: "/privacy" },
  ],
};

function ScrollReveal({ children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

function AccordionItem({ q, a, open, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div className="border border-zinc-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-300 hover:shadow-xs">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer bg-white hover:bg-zinc-50/50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-zinc-800 pr-4">{q}</span>
        <FiChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[#533afd]" : ""}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? height : 0 }}
      >
        <div ref={contentRef} className="px-6 pb-5">
          <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, openAuthModal } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-zinc-200/40 shadow-xs" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="w-24 hover:opacity-90 transition-opacity">
            <img src="/goover.svg" alt="Goover Logo" className="w-full h-full object-contain" />
          </a>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/app"
                className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 hover:shadow-lg hover:shadow-[#533afd]/20 transition-all active:scale-[0.97]"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 hover:shadow-lg hover:shadow-[#533afd]/20 transition-all active:scale-[0.97] cursor-pointer"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* Visual elements for facelift: radial mask + grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern mask-radial-fade opacity-70 pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Glowing beta intro badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand/5 border border-brand/10 text-xs font-semibold text-brand tracking-wide mb-6 animate-fade-in hover:bg-brand/10 transition-colors cursor-pointer select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            Introducing Goover Beta
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] max-w-4xl mx-auto animate-fade-in">
            You have the experience.
            <br />
            <span className="bg-linear-to-r from-brand to-[#3217cb] bg-clip-text text-transparent">Global companies</span> just don't see it yet.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Goover translates your local market experience into the language global hiring managers immediately understand, so you can compete anywhere.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in max-[540px]:flex-col" style={{ animationDelay: "0.3s" }}>
            {user ? (
              <Link
                to="/app"
                className="px-7 py-3.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#533afd]/25 transition-all flex items-center gap-2 text-sm active:scale-[0.97]"
              >
                Go to Dashboard
                <FiArrowRight className="w-4.5 h-4.5" />
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-7 py-3.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#533afd]/25 transition-all flex items-center gap-2 text-sm active:scale-[0.97] cursor-pointer"
              >
                Try Goover Free
                <FiArrowRight className="w-4.5 h-4.5" />
              </button>
            )}
            
            <a
              href="#how-it-works"
              className="px-7 py-3.5 border border-zinc-200 text-zinc-600 font-semibold rounded-lg hover:border-zinc-300 hover:text-zinc-900 hover:-translate-y-0.5 hover:bg-zinc-50/50 transition-all text-sm active:scale-[0.97] bg-white/50 backdrop-blur-xs"
            >
              See How It Works
            </a>
          </div>

          {/* Styled video-ready preview frame with browser container styling */}
          <figure className="mt-16 sm:mt-20 relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-zinc-200/80 shadow-[0_30px_100px_rgba(83,58,253,0.12)] bg-zinc-50 p-2 animate-fade-in group" style={{ animationDelay: "0.45s" }}>
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-200/60 bg-zinc-100/80">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-zinc-400 font-medium tracking-wide">Goover App Demo</span>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-b-xl bg-white flex items-center justify-center">
              <img 
                src="/goover-main.png" 
                alt="Goover Product Interface" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]" 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/95 shadow-xl flex items-center justify-center text-brand scale-90 group-hover:scale-100 transition-all duration-300 opacity-90 group-hover:opacity-100">
                  <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-zinc-50/70 border-y border-zinc-100 relative">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight font-sans">How It Works</h2>
              <p className="mt-3 text-zinc-500 max-w-lg mx-auto">Three simple steps to unlock your global career potential.</p>
            </div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
              {/* Connection line in desktop viewport */}
              <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5 border-t-2 border-dashed border-zinc-200 z-0" />
              
              {STEPS.map((step, i) => (
                <div 
                  key={step.num} 
                  className="bg-white border border-zinc-200/50 p-8 rounded-2xl shadow-xs transition-all duration-300 hover:border-[#533afd]/30 hover:shadow-md hover:-translate-y-1 relative overflow-hidden group z-10"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#533afd]/10 text-brand font-medium text-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-zinc-800 transition-colors">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Features (Bento Grid) */}
      <section id="features" className="py-24 px-6 relative">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">Everything You Need to Stand Out</h2>
              <p className="mt-3 text-zinc-500 max-w-lg mx-auto">Goover analyzes your profile against any job description and delivers actionable insights.</p>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => {
                // Alternating sizes for Bento layout (7 col & 5 col)
                const gridSpanClass = i === 0 || i === 3 ? "md:col-span-7" : "md:col-span-5";
                
                return (
                  <div 
                    key={title} 
                    className={`${gridSpanClass} bg-white border border-zinc-200/60 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-[#533afd]/4 hover:border-[#533afd]/40 group overflow-hidden relative`}
                  >
                    {/* Glowing background highlights in bento cards */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-[#533afd]/3 blur-2xl group-hover:bg-[#533afd]/8 transition-colors duration-300" />
                    
                    <div className="w-12 h-12 rounded-xl bg-[#533afd]/8 text-[#533afd] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#533afd]/15 transition-all duration-300">
                      <Icon className="text-xl" />
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 text-zinc-800">{title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed relative z-10">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-zinc-50/70 border-t border-zinc-100">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight font-sans">Frequently Asked Questions</h2>
              <p className="mt-3 text-zinc-500 max-w-lg mx-auto">Everything you need to know about Goover.</p>
            </div>
            
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <AccordionItem
                  key={faq.q}
                  q={faq.q}
                  a={faq.a}
                  open={openFaq === faq.q}
                  onToggle={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA with subtle overlay grid and glowing orb */}
      <section className="relative bg-[#111214] overflow-hidden" style={{ clipPath: "ellipse(95% 100% at 50% 100%)" }}>
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        {/* Glowing atmospheric background orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#533afd]/20 blur-3xl pointer-events-none" />

        <div className="py-28 pb-36 px-6 relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white font-sans">
                Ready to go over?
              </h2>
              <p className="mt-4 text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Thousands of product managers are already using Goover to land global roles. Start your journey today.
              </p>
              
              {user ? (
                <Link
                  to="/app"
                  className="mt-8 inline-flex px-7 py-3.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 hover:shadow-lg hover:shadow-[#533afd]/20 transition-all items-center gap-2 text-sm active:scale-[0.97]"
                >
                  Go to Dashboard
                  <FiArrowRight className="w-4.5 h-4.5" />
                </Link>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="mt-8 inline-flex px-7 py-3.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 hover:shadow-lg hover:shadow-[#533afd]/20 transition-all items-center gap-2 text-sm active:scale-[0.97] cursor-pointer"
                >
                  Get Started Free
                  <FiArrowRight className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="block w-24">
                <img src="/goover.svg" alt="Goover Logo" className="w-full object-contain" />
              </span>
              <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
                Translate your local experience into a language global hiring managers understand.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">{heading}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.to.startsWith("/#") ? (
                        <a href={link.to} className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.to} className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Social */}
            <div>
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Connect</h4>
              <div className="flex items-center gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#533afd] hover:border-[#533afd]/30 hover:bg-[#533afd]/5 transition-all">
                  <FiLinkedin className="w-4.5 h-4.5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#533afd] hover:border-[#533afd]/30 hover:bg-[#533afd]/5 transition-all">
                  <FiTwitter className="w-4.5 h-4.5" />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#533afd] hover:border-[#533afd]/30 hover:bg-[#533afd]/5 transition-all">
                  <FaDiscord className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} Goover. All rights reserved.</p>
            <p className="text-sm text-zinc-500">Built by <a href="https://www.linkedin.com/in/josephtunde/" target="_blank" className="text-[#533afd] hover:text-[#533afd]/80 transition-colors underline">Joseph Tunde</a> for Mind The Product World Product Day 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
