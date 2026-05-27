import { useRef, useState } from "react";
import { FiLink, FiClipboard } from "react-icons/fi";
import { MdAttachFile } from "react-icons/md";
import { IoArrowUpSharp, IoCloseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { extractTextFromFile } from "../services/fileUtils";
import { fetchUrl as fetchUrlService } from "../services/analysis";

function ChatForm({ title, value, onChange, placeholder, run = false, onRun }) {
  const fileInputRef = useRef(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const appendText = (text) => {
    if (!text) return;
    onChange(value ? `${value}\n\n${text}` : text);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text) {
        toast.warning("No text could be extracted from that file");
        return;
      }
      appendText(text);
      toast.success(`Extracted ${text.split(/\s+/).length} words from ${file.name}`);

      if (typeof pendo !== "undefined") {
        pendo.track("file_uploaded", {
          fileType: file.type,
          fileName: file.name,
          wordCount: text.split(/\s+/).length,
          fieldTarget: title,
          fileSizeBytes: file.size,
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to extract text from file");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.warning("Clipboard is empty");
        return;
      }
      appendText(text);
      toast.success(`Pasted ${text.split(/\s+/).length} words from clipboard`);

      if (typeof pendo !== "undefined") {
        pendo.track("clipboard_pasted", {
          wordCount: text.split(/\s+/).length,
          fieldTarget: title,
        });
      }
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.error("Allow clipboard access in your browser settings");
      } else {
        toast.error("Failed to read clipboard");
      }
    }
  };

  const handleFetchUrl = async () => {
    const url = urlValue.trim();
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Invalid URL");
      return;
    }
    setIsFetching(true);
    try {
      const { text, title } = await fetchUrlService(url);
      const prefix = title ? `[Source: ${title}](${url})\n\n` : "";
      appendText(prefix + text);
      toast.success(`Fetched ${text.split(/\s+/).length} words from URL`);

      if (typeof pendo !== "undefined") {
        pendo.track("url_content_fetched", {
          url,
          wordCount: text.split(/\s+/).length,
          hasTitle: !!title,
          fieldTarget: title,
        });
      }
      setShowUrlInput(false);
      setUrlValue("");
    } catch (error) {
      toast.error(error.message || "Failed to fetch URL");
    } finally {
      setIsFetching(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && onRun && value.trim()) {
      e.preventDefault();
      onRun();
    }
  };

  const handleUrlKeyDown = (e) => {
    if (e.key === "Enter" && !isFetching) {
      handleFetchUrl();
    }
    if (e.key === "Escape") {
      setShowUrlInput(false);
      setUrlValue("");
    }
  };

  return (
    <section className="group relative min-h-20 overflow-hidden rounded-[28px] border border-gray-300 shadow-[0_22px_70px_rgba(15,23,42,0.08)] transition-all duration-300">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
      <div className="flex h-full min-h-40 flex-col p-4">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          data-tour={title === "Job Description" ? "jd-form" : title === "Experience Summary" ? "exp-form" : undefined}
          className="mt-4 min-h-10 flex-1 resize-none border-0 bg-transparent p-0 text-base leading-7 text-zinc-500 outline-none placeholder:text-base placeholder:font-normal placeholder:leading-snug placeholder:text-zinc-500 focus:ring-0"
        />

        {showUrlInput && (
          <div className="mt-3 flex items-center gap-2 animate-fade-in">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              placeholder="Paste job posting URL..."
              className="flex-1 py-2 px-3 border border-gray-200 rounded-lg text-sm text-zinc-700 outline-none focus:border-gray-200 focus:ring-1 focus:ring-gray-200 transition-all"
              autoFocus
              disabled={isFetching}
            />
            <button
              type="button"
              onClick={handleFetchUrl}
              disabled={isFetching}
              className="grid place-items-center rounded-full bg-[#f4330d] text-white cursor-pointer hover:bg-[#f4330d]/80 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {isFetching ? (
                <span className="block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IoArrowUpSharp className="text-[1.4rem] text-white m-1 font-light" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setUrlValue(""); }}
              disabled={isFetching}
              className="grid place-items-center rounded-full bg-zinc-200 hover:text-zinc-800 cursor-pointer disabled:opacity-50 hover:bg-zinc-100 active:scale-[0.98] transition-all"
            >
              <IoCloseOutline className="text-[1.4rem] text-zinc-600 m-1 font-light" />
            </button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-zinc-100 pt-5">
          <div className="flex min-w-0 items-center gap-2 w-full" data-tour="tools">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload file input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
              aria-label={`Upload ${title.toLowerCase()} file`}
              className="grid h-11 w-11 flex-none place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-950 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <span className="block w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              ) : (
                <MdAttachFile className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={handlePasteClipboard}
              aria-label={`Paste into ${title.toLowerCase()}`}
              className="grid h-11 w-11 flex-none place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-950 cursor-pointer active:scale-[0.98]"
            >
              <FiClipboard className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              aria-label={`Fetch URL for ${title.toLowerCase()}`}
              className="grid h-11 w-11 flex-none place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-950 cursor-pointer active:scale-[0.98]"
            >
              <FiLink className="h-4 w-4" />
            </button>

            {run && (
              <button
                type="button"
                onClick={onRun}
                disabled={!value}
                data-tour="run-btn"
                aria-label={`Run ${title.toLowerCase()} analysis`}
                className="grid h-11 w-11 flex-none place-items-center rounded-full border border-zinc-200 bg-[#f4330d] text-white shadow-sm transition-colors hover:border-zinc-300 hover:text-white/80 cursor-pointer active:scale-[0.98] ml-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IoArrowUpSharp className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChatForm;
