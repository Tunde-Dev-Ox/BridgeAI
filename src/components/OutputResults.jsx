import { useState, useCallback, useRef, useEffect } from "react";
import { FiCheck, FiCopy, FiCheckCircle, FiAlertCircle, FiGlobe, FiFileText, FiTarget, FiAlertTriangle, FiEdit2, FiSave, FiDownload } from "react-icons/fi";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { useParams } from "react-router-dom";
import { updateCoverLetter } from "../services/analyses";

export default function OutputResults({ data, analysisId }) {
  const { id: routeId } = useParams();
  const activeId = analysisId || routeId;
  const [activeTab, setActiveTab] = useState("fit");
  const [copied, setCopied] = useState(false);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [editedLetter, setEditedLetter] = useState(data?.coverLetter ?? "");
  const copiedTimeoutRef = useRef(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedLetter);
      setCopied(true);
      toast.success("Cover letter copied to clipboard!");
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Your browser may not support clipboard access.");
    }
  }, [editedLetter]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const handleSaveDraft = useCallback(async () => {
    if (!activeId) {
      toast.error("Cannot save: analysis ID not available");
      return;
    }
    try {
      await updateCoverLetter(activeId, editedLetter);
      setIsEditingLetter(false);
      toast.success("Cover letter draft saved");
    } catch (error) {
      toast.error(error.message || "Failed to save cover letter");
    }
  }, [activeId, editedLetter]);

  const handleDownloadPdf = useCallback(() => {
    try {
      const doc = new jsPDF({ unit: "in", format: "letter" });
      const margin = 1;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Cover Letter", margin, 1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });
      doc.text(dateStr, margin, 1.35);

      const target = data.targetCompany
        ? `Application for ${data.targetRole} at ${data.targetCompany}`
        : "Application";
      doc.setFont("helvetica", "italic");
      doc.text(target, margin, 1.55);

      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const lines = doc.splitTextToSize(editedLetter, maxWidth);
      let y = 2;

      for (let i = 0; i < lines.length; i++) {
        if (y > 9.5) {
          doc.addPage();
          y = 1;
        }
        doc.text(lines[i], margin, y);
        y += 0.25;
      }

      const safeName = target.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50) || "cover_letter";
      doc.save(`${safeName}.pdf`);
      toast.success("Cover letter downloaded as PDF");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  }, [editedLetter, data]);

  const tabs = [
    { id: "fit", label: "Fit Score", icon: FiTarget },
    { id: "translation", label: "Experience Translation", icon: FiGlobe },
    { id: "gap", label: "Gap Analysis", icon: FiAlertTriangle },
    { id: "letter", label: "Cover Letter Draft", icon: FiFileText },
  ];

  const safeFitScore = data?.fitScore ?? 0;
  const safeFitBreakdown = data?.fitBreakdown ?? [];
  const safeTranslations = data?.translations ?? [];
  const safeGapAnalysis = data?.gapAnalysis ?? [];
  const safeTargetCompany = data?.targetCompany ?? "Company";
  const safeTargetRole = data?.targetRole ?? "Role";

  return (
    <div className="rounded-2xl flex flex-col h-full animate-fade-in">
      {/* Header Overview Summary */}
      <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-800">Analysis Complete</span>
          <h2 className="text-xl font-bold text-zinc-950 mt-1">Bridging Report for {safeTargetCompany}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Role: {safeTargetRole}</p>
        </div>

        {/* Quick Fit Badge */}
        <div className="flex items-center space-x-3 py-2 px-4 rounded-xl border border-gray-200">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle cx="20" cy="20" r="16" stroke="#fff" strokeWidth="3" fill="transparent" />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#000"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 - (safeFitScore / 100) * (2 * Math.PI * 16)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-bold text-zinc-950">{safeFitScore}%</span>
          </div>
          <div>
            <div className="text-[10px] text-zinc-800 uppercase tracking-wider font-semibold">Overall Alignment</div>
            <div className="text-xs font-medium text-zinc-500">High Match Potential</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto overflow-y-hidden scrollbar-none -mb-px pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? "border-zinc-700 text-zinc-800 bg-[#17191d]/5"
                  : "border-transparent text-zinc-600 hover:text-zinc-800 hover:bg-white"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6 grow overflow-y-auto max-h-[580px]">
        {/* FIT SCORE TAB */}
        {activeTab === "fit" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-6 border border-gray-200 rounded-xl">
              {/* SVG Radial Progress */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="#e0e0e0" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="black"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 - (safeFitScore / 100) * (2 * Math.PI * 60)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-zinc-950 tracking-tighter">{safeFitScore}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Fit Index</span>
                </div>
              </div>

              {/* Explainer */}
              <div className="space-y-3 grow text-center md:text-left">
                <h3 className="text-lg font-semibold text-zinc-950">Why you scored {safeFitScore}%</h3>
                <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
                  Your experience in African technology giants exhibits deep technical execution and resilience under infrastructural challenges. This maps closely to the target role's core needs, particularly in scalable system architecture. We've highlighted areas where your credentials match, along with minor context gaps.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 border border-emerald-500/20 text-emerald-700 rounded-full text-xs">
                    Core Technical Alignment
                  </span>
                  <span className="px-3 py-1 border border-amber-500/20 text-amber-700 rounded-full text-xs">
                    Scale Translation Needed
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist breakdown */}
            <div className="bg-white py-6">
              <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Requirements Audit</h4>
              <div className="space-y-3">
                {safeFitBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 p-4 rounded-xl border border-gray-200 transition-colors`}
                  >
                    {item.status === "match" ? (
                      <FiCheckCircle className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <h5 className={`text-sm font-bold ${item.status === "match" ? "text-emerald-700" : "text-amber-400"}`}>
                        {item.area} {item.status === "gap" && "(Translational Gap)"}
                      </h5>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRANSLATION TAB */}
        {activeTab === "translation" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>How translation works:</strong> Global hiring managers review resumes in under 6 seconds. Translating local infrastructure constraints (like USSD payment flows, erratic banking APIs, or address-sparse maps) to global standard terminology (APMs, failover routing systems, geospatial landmark arrays) makes your resume instantly understandable.
              </p>
            </div>

            {/* Card lists */}
            <div className="space-y-6">
              {safeTranslations.map((t) => (
                <div key={t.id} className="border border-gray-200 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 border-gray-200">

                    {/* Before Card */}
                    <div className="p-5 border-r border-gray-200 relative">
                      <span className="absolute top-4 right-4 text-[9px] font-normal text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Local Context
                      </span>
                      <h5 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-3">Your Original Bullet</h5>
                      <p className="text-sm text-zinc-500 leading-relaxed line-through decoration-zinc-500">
                        "{t.original}"
                      </p>
                    </div>

                    {/* After Card */}
                    <div className="p-5 relative">
                      <span className="absolute top-4 right-4 text-[9px] font-normal text-zinc-800 bg-zinc-800/10 border border-zinc-800/20 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        Global Translation
                      </span>
                      <h5 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-3">Bridge Translation</h5>
                      <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                        "{t.translated}"
                      </p>
                    </div>

                  </div>

                  {/* Rationale Bottom Panel */}
                  <div className="p-4 bg-white/70 rounded-b-xl text-xs border-t border-gray-200 flex items-start space-x-2 flex-col">
                    <span className="text-zinc-800 font-bold uppercase tracking-wide flex-0 mt-0.5">Rationale:</span>
                    <p className="leading-relaxed text-zinc-500 font-light">{t.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAP ANALYSIS TAB */}
        {activeTab === "gap" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Identified gaps & bridge steps</h4>
            <div className="space-y-4">
              {safeGapAnalysis.map((gap) => (
                <div key={gap.id} className="p-5 border border-gray-200 rounded-xl transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h5 className="text-base font-semibold text-zinc-750 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-[#f4330d] rounded-full"></span>
                      {gap.title}
                    </h5>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${gap.impact === "High"
                      ? "bg-red-500/30 border border-red-500/20 text-red-800"
                      : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      }`}>
                      {gap.impact} Impact
                    </span>
                  </div>

                  <p className="text-sm text-zinc-600 mt-2 leading-relaxed font-light">
                    {gap.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-start flex-col space-x-2">
                    <span className="text-xs text-emerald-400 uppercase tracking-wider mt-0.5">How to Bridge:</span>
                    <p className="text-xs text-zinc-600 leading-relaxed font-light max-w-[650px]">{gap.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COVER LETTER TAB */}
        {activeTab === "letter" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">Tailored Cover Letter</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={isEditingLetter ? handleSaveDraft : () => setIsEditingLetter(true)}
                  className="flex items-center space-x-1.5 py-1 px-3 bg-[fff] hover:bg-zinc-100 border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
                >
                  {isEditingLetter ? (
                    <>
                      <FiSave className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="w-3.5 h-3.5" />
                      <span>Edit Draft</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 py-1 px-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-3.5 h-3.5" />
                      <span>Copy Letter</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center space-x-1.5 p-2 bg-[#f4330d] border border-[#f4330d] hover:border-gray-300 rounded-full justify-center text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  <FiDownload className="w-5 h-5 text-white" />
                </button>

              </div>
            </div>

            {/* Letter Textarea or Container */}
            <div className="p-6 border border-gray-200 rounded-xl text-sm text-zinc-300 leading-relaxed shadow-inner min-h-[350px]">
              {isEditingLetter ? (
                <textarea
                  value={editedLetter}
                  onChange={(e) => setEditedLetter(e.target.value)}
                  className="w-full h-[400px] bg-transparent text-black focus:outline-none border-none resize-none text-sm leading-relaxed scrollbar-none"
                />
              ) : (
                <div className="whitespace-pre-line text-black scrollbar-none">
                  {editedLetter}  
                </div>
              )}
            </div>

            <div className="flex items-center justify-center p-3">
              <span className="text-[10px] text-zinc-700">
                💡 Generated cover letter links your local projects directly to global challenges.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
