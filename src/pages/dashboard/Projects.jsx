import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSearch, FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import OutputResults from "../../components/OutputResults";
import ConfirmModal from "../../components/ConfirmModal";
import { useAuthModal } from "../../context/AuthModalContext";
import EmptyState from "../../components/EmptyState";
import { fetchAnalyses, fetchAnalysisById, deleteAnalysis, PAGE_SIZE } from "../../services/analyses";

export default function Projects() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthModal();

  const [selectedResult, setSelectedResult] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const searchTimerRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [analyses, setAnalyses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!id || !user) return;
    setIsLoadingDetail(true);
    setSelectedResult(null);
    fetchAnalysisById(id)
      .then((data) => setSelectedResult(data.result))
      .catch((err) => {
        console.error("Failed to load analysis:", err);
        toast.error("Analysis not found");
        navigate("/app/projects", { replace: true });
      })
      .finally(() => setIsLoadingDetail(false));
  }, [id, user, navigate]);

  const loadAnalyses = useCallback(async (pageNum, filter, search) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, count } = await fetchAnalyses(user.id, {
        page: pageNum,
        limit: PAGE_SIZE,
        filter: filter === "ALL" ? undefined : filter,
        search: search || undefined,
      });
      if (pageNum === 0) {
        setAnalyses(data);
      } else {
        setAnalyses((prev) => [...prev, ...data]);
      }
      setTotalCount(count);
    } catch (error) {
      console.error("Failed to load analyses:", error);
      toast.error(error.message || "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (id) return;
    setPage(0);
    loadAnalyses(0, activeFilter, searchQuery);
  }, [user, activeFilter, id, loadAnalyses, searchQuery]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(0);
      loadAnalyses(0, activeFilter, value);

      if (value && typeof pendo !== "undefined") {
        pendo.track("analysis_history_searched", {
          searchQuery: value.substring(0, 100),
          activeFilter,
        });
      }
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadAnalyses(nextPage, activeFilter, searchQuery);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAnalysis(deleteTarget);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTarget));
      setDeleteTarget(null);
      toast.success("Analysis deleted");

      if (typeof pendo !== "undefined") {
        pendo.track("analysis_deleted", {
          analysisId: deleteTarget,
          deletedFromDetailView: !!id,
        });
      }
      if (id === deleteTarget) {
        navigate("/app/projects", { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete analysis");
    }
  };

  const getTagStyles = (tag) => {
    switch (tag) {
      case "PRODUCT DESIGN":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      case "ENGINEERING":
        return "bg-sky-50 text-sky-700 border border-sky-200/50";
      case "PRODUCT":
        return "bg-purple-50 text-purple-700 border border-purple-200/50";
      case "MARKETING":
        return "bg-rose-50 text-rose-700 border border-rose-200/50";
      default:
        return "bg-zinc-50 text-zinc-700 border border-zinc-200";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-emerald-500 shadow-sm shadow-emerald-500/20";
    if (score >= 60) return "bg-amber-500 shadow-sm shadow-amber-500/20";
    return "bg-rose-500 shadow-sm shadow-rose-500/20";
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasMore = analyses.length < totalCount;

  const showDetail = id && (selectedResult || isLoadingDetail);
  const showList = !id;

  return (
    <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-start justify-start overflow-y-auto px-6 py-10 sm:px-8 pb-20 md:pb-10">
      {showDetail ? (
        isLoadingDetail ? (
          <div className="flex justify-center py-20 w-full">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#f4330d] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-full max-w-5xl h-full flex flex-col">
            <button
              onClick={() => navigate("/app/projects")}
              className="mb-4 w-fit flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 transition-colors font-semibold text-sm cursor-pointer hover:bg-zinc-100 px-3.5 py-2 rounded-lg border border-zinc-200/80 shadow-sm shrink-0"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to History</span>
            </button>
            <div className="flex-1 min-h-0">
              <OutputResults data={selectedResult} />
            </div>
          </div>
        )
      ) : null}

      {showList ? (
        <div className="w-full flex flex-col space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 font-cabinet">
              Analysis History
            </h1>
            <p className="mt-2 text-base text-zinc-500">
              A complete log of your tailored application materials and fit analyses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center border-b border-zinc-100 pb-5">
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "PRODUCT DESIGN", "ENGINEERING", "PRODUCT", "MARKETING"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                    activeFilter === filter
                      ? "bg-[#111214] text-white border-transparent"
                      : "bg-transparent text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  {filter === "ALL" ? "All Categories" : filter}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full flex items-center">
              <FiSearch className="absolute left-3 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full py-1.5 pl-9 pr-4 border border-gray-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white"
              />
            </div>
          </div>

          {isLoading && analyses.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#f4330d] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((item) => {
                const r = item.result;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col sm:flex-row justify-between sm:items-center w-full gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className={`px-2.5 py-1 text-[9px] font-bold tracking-wider rounded-md uppercase ${getTagStyles(item.tag)}`}>
                          {item.tag}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400 ml-3">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900 mt-2.5 truncate">
                        {r?.targetRole || "Position Analysis"}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        {r?.targetCompany ? `${r.targetCompany} • ` : ""}Fit analysis for role alignment
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-zinc-100 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-zinc-400 tracking-wider block mb-1 uppercase">
                          Fit Score
                        </span>
                        <div className="flex items-center justify-end space-x-1.5">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor(item.fit_score)}`} />
                          <span className="text-xl font-bold text-zinc-900 font-cabinet">
                            {item.fit_score}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/app/projects/${item.id}`)}
                        className="px-4.5 py-2 border border-zinc-300 rounded-lg text-sm font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 hover:border-zinc-400 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        aria-label="Delete analysis"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {analyses.length === 0 && (
                <EmptyState onNewAnalysis={() => navigate("/app")} />
              )}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="flex items-center space-x-1.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 transition-colors px-5 py-2.5 rounded-lg border border-zinc-300/80 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load older analyses"}
              </button>
            </div>
          )}
        </div>
      ) : null}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete analysis"
        message="Are you sure you want to delete this analysis? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}
