import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart, FiGlobe, FiTarget, FiFileText, FiLinkedin, FiTwitter, FiChevronDown } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { useAuthModal } from "../context/AuthModalContext";

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
    q: "What is Bridge?",
    a: "Bridge is an AI-powered tool that helps African product managers translate their local market experience into language global hiring managers immediately understand. It analyzes your profile against any job description and delivers a fit score, experience translation, gap analysis, and tailored cover letter.",
  },
  {
    q: "How does the fit score work?",
    a: "The fit score is calculated across four dimensions: role alignment (how your title and responsibilities match), experience depth (years and complexity), industry context (domain relevance), and cultural fluency (cross-market adaptability). Each dimension gets a score from 0-100, combined into an overall fit percentage.",
  },
  {
    q: "Is Bridge free to use?",
    a: "Yes, Bridge is completely free during our beta. You can run unlimited analyses, generate cover letters, and save your history. We'll announce pricing if we introduce paid plans in the future.",
  },
  {
    q: "What file types can I upload?",
    a: "You can upload PDF, DOCX, and TXT files. Bridge extracts the text automatically and uses it for analysis. You can also paste text directly, copy from your clipboard, or fetch content from a URL.",
  },
  {
    q: "How is my data handled?",
    a: "Your data is encrypted in transit and at rest. Job descriptions and experience summaries are sent to Google Gemini solely for analysis and are not used for training. Analysis results are stored in your private account and you can delete them anytime.",
  },
  {
    q: "Can I use Bridge on mobile?",
    a: "Yes, Bridge is fully responsive and works on mobile, tablet, and desktop. The interface adapts to your screen size with a bottom navigation bar on mobile devices.",
  },
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
    <div className="border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer bg-white hover:bg-zinc-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-zinc-800 pr-4">{q}</span>
        <FiChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? height : 0 }}
      >
        <div ref={contentRef} className="px-5 pb-4">
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
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-xs" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold font-cabinet bg-[#f4330d] text-white px-2 py-0.5 transition-transform hover:scale-105">Bridge.</a>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/app"
                className="px-5 py-2 bg-[#111214] text-white text-sm font-semibold rounded-lg hover:bg-[#111214]/90 transition-all active:scale-[0.97]"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-5 py-2 bg-[#f4330d] text-white text-sm font-semibold rounded-lg hover:bg-[#f4330d]/90 transition-all active:scale-[0.97] cursor-pointer"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#f4330d]/5 rounded-full blur-[150px]" />
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[#f4330d]/3 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4330d]/5 border border-[#f4330d]/10 text-xs font-semibold text-[#f4330d] mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f4330d] animate-pulse-glow" />
            Built for African Product Managers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight font-cabinet leading-[1.1] max-w-4xl mx-auto animate-fade-in">
            You have the experience.
            <br />
            <span className="text-[#f4330d]">Global companies</span> just don't see it yet.
          </h1>
          <p className="mt-5 text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Bridge translates your local market experience into the language global hiring managers immediately understand — so you can compete anywhere.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in max-[540px]:flex-col" style={{ animationDelay: "0.3s" }}>
            <button
              onClick={openAuthModal}
              className="px-6 py-3 bg-[#111214] text-white font-semibold rounded-xl hover:bg-[#111214]/90 transition-all flex items-center gap-2 text-sm active:scale-[0.97] cursor-pointer"
            >
              Try Bridge Free
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="px-6 py-3 border border-zinc-300 text-zinc-700 font-semibold rounded-xl hover:bg-zinc-50 hover:border-zinc-400 transition-all text-sm active:scale-[0.97]"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-zinc-50">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-cabinet">How It Works</h2>
              <p className="mt-3 text-zinc-500 max-w-lg mx-auto">Three steps to unlock your global career potential.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <div key={step.num} className="text-center group">
                  <div className="w-12 h-12 rounded-xl bg-[#f4330d]/10 text-[#f4330d] font-bold text-lg flex items-center justify-center mx-auto mb-4 font-cabinet group-hover:scale-110 group-hover:bg-[#f4330d]/20 transition-all duration-300">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-zinc-900 transition-colors">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-cabinet">Everything You Need to Stand Out</h2>
              <p className="mt-3 text-zinc-500 max-w-lg mx-auto">Bridge analyzes your profile against any job description and delivers actionable insights.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-lg bg-[#f4330d]/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#f4330d]/20 transition-all duration-300">
                    <Icon className="text-[#f4330d] text-lg" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-zinc-50">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-cabinet">Frequently Asked Questions</h2>
              <p className="mt-3 text-zinc-500 max-w-lg mx-auto">Everything you need to know about Bridge.</p>
            </div>
            <div className="space-y-3">
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

      {/* CTA with curved clip-path */}
      <section className="relative bg-[#111214]" style={{ clipPath: "ellipse(85% 100% at 50% 100%)" }}>
        <div className="py-28 pb-36 px-6">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-cabinet text-white">
                Ready to bridge the gap?
              </h2>
              <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
                Thousands of African PMs are already using Bridge to land global roles. Start your journey today.
              </p>
              <Link
                to="/app"
                className="mt-8 inline-flex px-6 py-3 bg-[#f4330d] text-white font-semibold rounded-xl hover:bg-[#f4330d]/90 transition-all items-center gap-2 text-sm active:scale-[0.97]"
              >
                Get Started Free
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold font-cabinet bg-[#f4330d] text-white px-2 py-0.5">Bridge.</span>
              <p className="mt-3 text-sm text-zinc-500 leading-relaxed max-w-xs">
                Translate your local experience into a language global hiring managers understand.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">{heading}</h4>
                <ul className="space-y-2.5">
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
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">Connect</h4>
              <div className="flex items-center gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#f4330d] hover:border-[#f4330d]/30 hover:bg-[#f4330d]/5 transition-all">
                  <FiLinkedin className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#f4330d] hover:border-[#f4330d]/30 hover:bg-[#f4330d]/5 transition-all">
                  <FiTwitter className="w-4 h-4" />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#f4330d] hover:border-[#f4330d]/30 hover:bg-[#f4330d]/5 transition-all">
                  <FaDiscord className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} Bridge. All rights reserved.</p>
            <p className="text-xs text-zinc-400">Built by <a href="https://www.linkedin.com/in/josephtunde/" target="_blank" className="text-zinc-500 hover:text-zinc-800 transition-colors underline">Tunde</a> for Mind The Product World Product Day 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
