export default function EmptyState({ onNewAnalysis }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">

      <h3 className="text-xl font-semibold text-zinc-900 font-cabinet mb-2">
        No analysis yet
      </h3>
      <p className="text-sm text-zinc-500 max-w-xs text-center leading-relaxed mb-6">
        Create your first analysis to get started.
      </p>
      {onNewAnalysis && (
        <button
          onClick={onNewAnalysis}
          className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-[#f4330d]/90 transition-all cursor-pointer active:scale-[0.98] animate-bounce-in"
        >
          Let's get started
        </button>
      )}
    </div>
  );
}
