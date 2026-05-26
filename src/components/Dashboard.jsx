import { useState, useRef } from "react";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import ChatForm from "./ChatForm";
import OutputResults from "./OutputResults";
import { useAuthModal } from "../context/AuthModalContext";
import { runAnalysis, saveAnalysis } from "../services/analysis";
import OnboardingTour from "./OnboardingTour";
import AnalysisLoading from "./AnalysisLoading";

const PENDO_AGENT_ID = "cFm4fdPaDGg-2RbJnN1mPQX3BkU";

export default function Dashboard() {
  const { user } = useAuthModal();
  const [jobDescription, setJobDescription] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const conversationIdRef = useRef(crypto.randomUUID());
  const lastPromptMessageIdRef = useRef(null);


  const handleRunAnalysis = async () => {
    if (isAnalyzing) return;

    if (!jobDescription.trim() || !experienceSummary.trim()) {
      toast.error("Please fill in both fields before running analysis");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const promptMessageId = crypto.randomUUID();
    lastPromptMessageIdRef.current = promptMessageId;

    if (typeof window !== "undefined" && window.pendo && window.pendo.trackAgent) {
      window.pendo.trackAgent("prompt", {
        agentId: PENDO_AGENT_ID,
        conversationId: conversationIdRef.current,
        messageId: promptMessageId,
        content: `Job Description: ${jobDescription}\n\nExperience Summary: ${experienceSummary}`,
      });
    }

    try {
      const result = await runAnalysis(jobDescription, experienceSummary);

      if (typeof window !== "undefined" && window.pendo && window.pendo.trackAgent) {
        window.pendo.trackAgent("agent_response", {
          agentId: PENDO_AGENT_ID,
          conversationId: conversationIdRef.current,
          messageId: crypto.randomUUID(),
          content: JSON.stringify(result),
        });
      }

      if (user) {
        saveAnalysis(user.id, jobDescription, experienceSummary, result).catch((err) => {
          console.error("Failed to save analysis:", err);
        });
      }

      setAnalysisResult(result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNew = () => {
    if (typeof window !== "undefined" && window.pendo && window.pendo.trackAgent && lastPromptMessageIdRef.current) {
      window.pendo.trackAgent("user_reaction", {
        agentId: PENDO_AGENT_ID,
        conversationId: conversationIdRef.current,
        messageId: lastPromptMessageIdRef.current,
        content: "retry",
      });
    }

    setAnalysisResult(null);
    setJobDescription("");
    setExperienceSummary("");
    conversationIdRef.current = crypto.randomUUID();
    lastPromptMessageIdRef.current = null;
  };

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[192px_1fr] text-zinc-950">
      <OnboardingTour />
      <Sidebar onNew={handleNew} />
      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center overflow-y-auto px-6 py-10 sm:px-8 pb-20 md:pb-10">
        {/* Ambient background glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#f4330d]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-[#f4330d]/3 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-zinc-200/30 rounded-full blur-[80px]" />
        </div>

        {isAnalyzing ? (
          <div className="flex-1 flex items-center justify-center">
            <AnalysisLoading />
          </div>
        ) : analysisResult ? (
          <div className="w-full max-w-5xl h-full flex-1">
            <OutputResults data={analysisResult} />
          </div>
        ) : (
          <>
            {/* Hero section */}
            <div className="relative mb-8 sm:mb-14 text-center max-w-2xl pt-8 sm:pt-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/50 text-[11px] font-semibold text-zinc-600 tracking-wide mb-6 font-cabinet">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f4330d] animate-pulse-glow " />
                Bridge AI
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 font-cabinet leading-[1.15] transition-opacity duration-300">
                Let's get that job, shall we?
              </h1>
              <p className="mx-auto mt-4 sm:mt-5 max-w-lg text-sm sm:text-base leading-relaxed sm:leading-7 text-zinc-400">
                Translate high-impact local experience into language global hiring managers immediately understand.
              </p>
            </div>

            {/* Input section */}
            <div className="relative w-full max-w-5xl">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="relative">
                  <span className="absolute -top-2.5 left-5 z-10 px-2 text-[11px] font-semibold text-zinc-500 tracking-wider uppercase bg-white">
                    Job Description
                  </span>
                  <ChatForm
                    title="Job Description"
                    value={jobDescription}
                    onChange={setJobDescription}
                    placeholder="Paste the job description..."
                    run={false}
                  />
                </div>
                <div className="relative">
                  <span className="absolute -top-2.5 left-5 z-10 px-2 text-[11px] font-semibold text-zinc-500 tracking-wider uppercase bg-white">
                    Your Experience
                  </span>
                  <ChatForm
                    title="Experience Summary"
                    value={experienceSummary}
                    onChange={setExperienceSummary}
                    placeholder="Describe your experience..."
                    run={true}
                    onRun={handleRunAnalysis}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
