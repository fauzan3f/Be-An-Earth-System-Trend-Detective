import React, { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { parseUploadedFile } from "../services/dataLoader";
import type { DatasetPayload } from "../types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (variable: "NO2" | "AOD", dataset: DatasetPayload) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onApplyDataset,
}) => {
  const [targetVariable, setTargetVariable] = useState<"NO2" | "AOD">("NO2");
  const [fileName, setFileName] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [parsedPreview, setParsedPreview] = useState<DatasetPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      setError(null);
      setParsedPreview(null);
      setFileName("");
      setRawText("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessContent = (content: string, name: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = parseUploadedFile(content, name, targetVariable);
      setParsedPreview(result);
      setFileName(name);
      setRawText(content);
    } catch (err) {
      setError((err as Error).message || "Failed to parse file.");
      setParsedPreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (parsedPreview) {
      onApplyDataset(targetVariable, parsedPreview);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-space-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <h2 id="upload-modal-title" className="text-lg font-semibold text-slate-100">
              Load Role 1 CSV / JSON Data
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Target Variable Selector */}
        <div className="space-y-1.5">
          <label htmlFor="target-variable-select" className="block text-xs font-semibold text-slate-300">
            Target Variable Dataset
          </label>
          <div className="grid grid-cols-2 gap-3" id="target-variable-select">
            <button
              type="button"
              onClick={() => {
                setTargetVariable("NO2");
                if (rawText && fileName) handleProcessContent(rawText, fileName);
              }}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                targetVariable === "NO2"
                  ? "bg-sky-950/60 border-sky-600 text-sky-200"
                  : "bg-space-850 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="font-semibold text-sm">NO2 Tropospheric Column</div>
                <div className="text-[11px] text-slate-400">Aura/OMI OMNO2d</div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-900/40 text-sky-300">
                NO2
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetVariable("AOD");
                if (rawText && fileName) handleProcessContent(rawText, fileName);
              }}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                targetVariable === "AOD"
                  ? "bg-amber-950/60 border-amber-600 text-amber-200"
                  : "bg-space-850 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="font-semibold text-sm">AOD Aerosol Optical Depth</div>
                <div className="text-[11px] text-slate-400">MODIS MYD08_M3</div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300">
                AOD
              </span>
            </button>
          </div>
        </div>

        {/* File Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const text = event.target?.result as string;
                handleProcessContent(text, file.name);
              };
              reader.readAsText(file);
            }
          }}
          className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-space-850/50 hover:bg-space-850 space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400">
            <Upload className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-sm font-medium text-slate-200">
            {fileName ? fileName : "Click to select or drag and drop Role 1 file here"}
          </div>
          <div className="text-xs text-slate-400">
            Accepts CSV (`date,value` with fill values like NaN or -999) or JSON TrendAnalysisContract
          </div>
        </div>

        {/* Loading State */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-sky-400">
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Parsing data and recalculating Sen's slope...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold">Import Error: </span>
              {error}
            </div>
          </div>
        )}

        {/* Success Preview State */}
        {parsedPreview && (
          <div className="p-4 rounded-lg bg-space-850 border border-emerald-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Valid Role 1 Dataset Verified</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
              <div>Series Length: {parsedPreview.series.length} months</div>
              <div>Valid Months: {parsedPreview.metadata.valid_months}</div>
              <div>Missing Months: {parsedPreview.metadata.missing_months}</div>
              <div>Period: {parsedPreview.metadata.period}</div>
              <div>Sen's Slope: {parsedPreview.metadata.slope_per_year} / yr</div>
              <div>p-value: {parsedPreview.metadata.p_value}</div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedPreview}
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Apply to {targetVariable} Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
