"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { File, X, Plus, Loader2, Images } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { usePdfSessionLimit } from "@/hooks/usePdfSessionLimit";
import { useSubscription } from "@/components/SubscriptionProvider";
import { LimitModal } from "./LimitModal";
import { validatePdfServerSide } from "@/app/tools/pdf/actions";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function PdfToImages() {
  const [pdfFile, setPdfFile] = useState<{ file: File; buffer: ArrayBuffer; totalPages: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");
  
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
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        
        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        setPdfFile({ file, buffer, totalPages: pdf.numPages });
      } catch (e) {
        console.error(e);
        toast.error("Could not read PDF. It might be corrupted or password protected.");
      } finally {
        setIsLoadingPdf(false);
      }
    }
  });

  const handleConvert = async () => {
    if (!pdfFile) return;
    if (!canPerformAction) {
      triggerLimitModal();
      return;
    }

    setIsProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: pdfFile.buffer });
      const pdf = await loadingTask.promise;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL(format);
          const base64Data = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
          const ext = format === "image/png" ? "png" : "jpg";
          zip.file(`page_${i}.${ext}`, base64Data, { base64: true });
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = pdfFile.file.name.replace(/\.pdf$/i, '');
      link.download = `${baseName}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addAction({
        type: 'pdf-to-image',
        filename: `${baseName}_images.zip`,
      });

      toast.success("PDF converted to images successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to convert PDF to images.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink mb-2">PDF to Images</h2>
        <p className="text-ink-2 text-sm">Convert each page of your PDF into high-quality PNG or JPG images, downloaded as a ZIP.</p>
      </div>

      {!pdfFile ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            isDragActive ? "border-purple-500 bg-purple-50" : "border-stone-200 hover:border-purple-300 hover:bg-stone-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-purple-500 mb-2">
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
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg shrink-0">
              <File className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{pdfFile.file.name}</p>
              <p className="text-xs text-stone-500">{(pdfFile.file.size / 1024 / 1024).toFixed(2)} MB • {pdfFile.totalPages} pages</p>
            </div>
            <button
              onClick={() => setPdfFile(null)}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-4 justify-between items-center">
             <div className="flex items-center gap-3 w-full sm:w-auto">
               <label className="text-sm font-medium text-ink whitespace-nowrap">Format:</label>
               <select 
                 value={format}
                 onChange={(e) => setFormat(e.target.value as "image/png" | "image/jpeg")}
                 className="px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white"
               >
                 <option value="image/png">PNG (High Quality)</option>
                 <option value="image/jpeg">JPG (Smaller Size)</option>
               </select>
             </div>
             
             <button
               onClick={handleConvert}
               disabled={isProcessing}
               className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-stone-300 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
             >
               {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Images className="w-5 h-5" />}
               {isProcessing ? "Converting..." : "Convert & Download ZIP"}
             </button>
          </div>
        </div>
      )}
      
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}

