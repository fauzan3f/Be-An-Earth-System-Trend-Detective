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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white border border-[#E0E0E0] rounded-sm shadow-xl p-6 text-[#1B1B1B] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-[#1967D2]" aria-hidden="true" />
            <h2 id="upload-modal-title" className="text-base font-bold text-[#1B1B1B]">
              Load Role 1 CSV / JSON Data
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-1 text-[#58585B] hover:text-[#1B1B1B] rounded hover:bg-[#F0F0F0] focus:outline-none focus:ring-2 focus:ring-[#1967D2]"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Target Variable Selector */}
        <div className="space-y-1.5">
          <label htmlFor="target-variable-select" className="block text-xs font-mono font-bold uppercase tracking-wider text-[#58585B]">
            Target Variable Dataset
          </label>
          <div className="grid grid-cols-2 gap-3" id="target-variable-select">
            <button
              type="button"
              onClick={() => {
                setTargetVariable("NO2");
                if (rawText && fileName) handleProcessContent(rawText, fileName);
              }}
              className={`p-3 rounded-sm border text-left flex items-center justify-between transition-colors ${
                targetVariable === "NO2"
                  ? "bg-[#E8F0FE] border-[#1967D2] text-[#1967D2]"
                  : "bg-white border-[#D1D5DB] text-[#58585B] hover:border-[#9CA3AF]"
              }`}
            >
              <div>
                <div className="font-bold text-sm text-[#1B1B1B]">NO2 Tropospheric Column</div>
                <div className="text-[11px] text-[#58585B] font-mono">Aura/OMI OMNO2d</div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-[#1967D2] border border-[#BFDBFE] font-bold">
                NO2
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetVariable("AOD");
                if (rawText && fileName) handleProcessContent(rawText, fileName);
              }}
              className={`p-3 rounded-sm border text-left flex items-center justify-between transition-colors ${
                targetVariable === "AOD"
                  ? "bg-[#FEF3C7] border-[#D97706] text-[#B45309]"
                  : "bg-white border-[#D1D5DB] text-[#58585B] hover:border-[#9CA3AF]"
              }`}
            >
              <div>
                <div className="font-bold text-sm text-[#1B1B1B]">AOD Aerosol Optical Depth</div>
                <div className="text-[11px] text-[#58585B] font-mono">MODIS MYD08_M3</div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-[#B45309] border border-[#FDE68A] font-bold">
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
          className="border-2 border-dashed border-[#D1D5DB] hover:border-[#1967D2] rounded-sm p-6 text-center cursor-pointer transition-colors bg-[#F9F9F9] hover:bg-[#F0F4F8] space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="mx-auto w-10 h-10 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#1967D2]">
            <Upload className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-sm font-semibold text-[#1B1B1B]">
            {fileName ? fileName : "Click to select or drag and drop Role 1 file here"}
          </div>
          <div className="text-xs text-[#58585B]">
            Accepts CSV (`date,value` with fill values like NaN or -999) or JSON TrendAnalysisContract
          </div>
        </div>

        {/* Loading State */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-[#1967D2]">
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Parsing data and recalculating Sen's slope...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-sm bg-[#FFF5F5] border border-[#FECACA] text-[#991B1B] text-xs">
            <AlertCircle className="w-4 h-4 text-[#E4002B] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold">Import Error: </span>
              {error}
            </div>
          </div>
        )}

        {/* Success Preview State */}
        {parsedPreview && (
          <div className="p-4 rounded-sm bg-[#F0FDF4] border border-[#BBF7D0] text-xs space-y-2 text-[#166534]">
            <div className="flex items-center gap-2 font-bold text-[#15803D]">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Valid Role 1 Dataset Verified</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
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
        <div className="flex items-center justify-between pt-3 border-t border-[#E0E0E0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-sm text-xs font-semibold text-[#58585B] hover:text-[#1B1B1B] hover:bg-[#F0F0F0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedPreview}
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1967D2] hover:bg-[#1557B0] disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1967D2]"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Apply to {targetVariable} Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
