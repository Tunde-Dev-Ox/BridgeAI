import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import ChatForm from "../../components/ChatForm";
import OutputResults from "../../components/OutputResults";
import { useAuthModal } from "../../context/AuthModalContext";
import { runAnalysis, saveAnalysis } from "../../services/analysis";
import AnalysisLoading from "../../components/AnalysisLoading";

const PENDO_AGENT_ID = "cFm4fdPaDGg-2RbJnN1mPQX3BkU";

export default function Dashboard() {
  const { user } = useAuthModal();
  const { resetKey } = useOutletContext();
  const [jobDescription, setJobDescription] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const conversationIdRef = useRef(crypto.randomUUID());
  const lastPromptMessageIdRef = useRef(null);
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    setAnalysisResult(null);
    setJobDescription("");
    setExperienceSummary("");
    conversationIdRef.current = crypto.randomUUID();
    lastPromptMessageIdRef.current = null;
  }, [resetKey]);

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

      if (typeof pendo !== "undefined") {
        pendo.track("analysis_completed", {
          fitScore: result?.fitScore,
          tag: result?.targetRole && result?.targetCompany
            ? [result.targetRole, result.targetCompany].join(" ").toLowerCase().includes("design") ? "PRODUCT DESIGN" : "PRODUCT"
            : undefined,
          targetRole: result?.targetRole,
          targetCompany: result?.targetCompany,
          fitBreakdownCount: result?.fitBreakdown?.length ?? 0,
          translationsCount: result?.translations?.length ?? 0,
          gapAnalysisCount: result?.gapAnalysis?.length ?? 0,
          hasCoverLetter: !!result?.coverLetter,
          isAuthenticated: !!user,
          jobDescriptionLength: jobDescription.length,
          experienceSummaryLength: experienceSummary.length,
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Analysis failed. Please try again.");

      if (typeof pendo !== "undefined") {
        pendo.track("analysis_failed", {
          errorMessage: (error.message || "Unknown error").substring(0, 100),
          jobDescriptionLength: jobDescription.length,
          experienceSummaryLength: experienceSummary.length,
          isAuthenticated: !!user,
        });
      }
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
    <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center overflow-y-auto px-6 py-10 sm:px-8 pb-20 md:pb-10">
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
          <div className="relative mb-8 sm:mb-14 text-center max-w-2xl pt-8 sm:pt-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 font-cabinet leading-[1.15] transition-opacity duration-300">
              Let's get that job, shall we?
            </h1>
            <p className="mx-auto mt-4 sm:mt-5 max-w-lg text-sm sm:text-base leading-relaxed sm:leading-7 text-zinc-400">
              Translate high-impact local experience into language global hiring managers immediately understand.
            </p>
          </div>

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
  );
}

