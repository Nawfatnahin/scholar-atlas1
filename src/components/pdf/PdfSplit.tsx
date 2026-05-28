"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { File, X, Plus, Loader2, SplitSquareHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { usePdfSessionLimit } from "@/hooks/usePdfSessionLimit";
import { useSubscription } from "@/components/SubscriptionProvider";
import { LimitModal } from "./LimitModal";
import { validatePdfServerSide } from "@/app/tools/pdf/actions";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function PdfSplit() {
  const [pdfFile, setPdfFile] = useState<{ file: File; totalPages: number; buffer: ArrayBuffer } | null>(null);
  const [ranges, setRanges] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  
  const { isPro } = useSubscription();
  const { canPerformAction, addAction, showLimitModal, setShowLimitModal, triggerLimitModal } = usePdfSessionLimit(isPro);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (!canPerformAction) {
        triggerLimitModal();
        return;
      }
      if (rejectedFiles.length > 0) {
        toast.error("Please upload a single PDF file under 50MB.");
        return;
      }
      
      const file = acceptedFiles[0];
      if (!isPro && file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds the 50MB limit for free users. Upgrade to Pro for unlimited size.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      const res = await validatePdfServerSide(formData);
      if (!res.success) {
        toast.error(res.error);
        return;
      }

      setIsLoadingPdf(true);
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const totalPages = pdfDoc.getPageCount();
        setPdfFile({ file, totalPages, buffer });
      } catch (e) {
        console.error(e);
        toast.error("Could not read PDF. It might be corrupted or password protected.");
      } finally {
        setIsLoadingPdf(false);
      }
    }
  });

  const parseRanges = (rangeStr: string, maxPages: number) => {
    const parts = rangeStr.split(",").map(s => s.trim()).filter(s => s.length > 0);
    const validRanges: { start: number, end: number, original: string }[] = [];

    for (const part of parts) {
      if (part.includes("-")) {
        const [s, e] = part.split("-").map(n => parseInt(n.trim(), 10));
        if (isNaN(s) || isNaN(e) || s > e || s < 1 || e > maxPages) {
          throw new Error(`Invalid range: ${part}. Pages must be between 1 and ${maxPages}.`);
        }
        validRanges.push({ start: s - 1, end: e - 1, original: part }); // 0-indexed
      } else {
        const p = parseInt(part, 10);
        if (isNaN(p) || p < 1 || p > maxPages) {
          throw new Error(`Invalid page: ${part}. Must be between 1 and ${maxPages}.`);
        }
        validRanges.push({ start: p - 1, end: p - 1, original: part });
      }
    }
    return validRanges;
  };

  const handleSplit = async () => {
    if (!pdfFile || !ranges.trim()) {
      toast.error("Please provide page ranges.");
      return;
    }
    if (!canPerformAction) {
      triggerLimitModal();
      return;
    }

    let parsed: { start: number, end: number, original: string }[] = [];
    try {
      parsed = parseRanges(ranges, pdfFile.totalPages);
      if (parsed.length === 0) throw new Error("No valid ranges provided.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e));
      return;
    }

    setIsProcessing(true);
    try {
      const sourcePdf = await PDFDocument.load(pdfFile.buffer);
      const zip = new JSZip();

      for (let i = 0; i < parsed.length; i++) {
        const { start, end, original } = parsed[i];
        const newPdf = await PDFDocument.create();
        
        // Generate array of page indices to copy
        const indices = [];
        for (let p = start; p <= end; p++) indices.push(p);
        
        const copiedPages = await newPdf.copyPages(sourcePdf, indices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        zip.file(`split_${original}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = pdfFile.file.name.replace(/\.pdf$/i, '');
      link.download = `${baseName}_split.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addAction({
        type: 'split',
        filename: `${baseName}_split.zip`,
      });

      toast.success("PDF split successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink mb-2">Split PDF</h2>
        <p className="text-ink-2 text-sm">Extract specific pages into separate PDF files. We&apos;ll pack them into a ZIP.</p>
      </div>

      {!pdfFile ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            isDragActive ? "border-emerald-500 bg-emerald-50" : "border-stone-200 hover:border-emerald-300 hover:bg-stone-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-emerald-500 mb-2">
            {isLoadingPdf ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
          </div>
          <div>
            <p className="text-ink font-medium text-lg">
              {isLoadingPdf ? "Loading PDF..." : "Click to upload or drag & drop"}
            </p>
            {!isPro && <p className="text-stone-500 text-sm mt-1">One PDF up to 50MB</p>}
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-xl shadow-sm">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg shrink-0">
              <File className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{pdfFile.file.name}</p>
              <p className="text-xs text-stone-500">{(pdfFile.file.size / 1024 / 1024).toFixed(2)} MB • {pdfFile.totalPages} pages</p>
            </div>
            <button
              onClick={() => { setPdfFile(null); setRanges(""); }}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <label className="block text-sm font-medium text-ink mb-2">
              Page Ranges to Extract
            </label>
            <input 
              type="text" 
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="e.g., 1-3, 5, 7-10"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm mb-2"
            />
            <p className="text-xs text-stone-500">
              Separate ranges by commas. Each range will be extracted as its own PDF.
            </p>
          </div>

          <div className="mt-2 flex justify-end">
             <button
               onClick={handleSplit}
               disabled={isProcessing || !ranges.trim()}
               className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
             >
               {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <SplitSquareHorizontal className="w-5 h-5" />}
               {isProcessing ? "Splitting..." : "Split & Download ZIP"}
             </button>
          </div>
        </div>
      )}
      
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}

