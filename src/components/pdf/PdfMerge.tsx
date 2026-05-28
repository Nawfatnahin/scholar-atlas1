"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { File, X, GripVertical, Plus, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { usePdfSessionLimit } from "@/hooks/usePdfSessionLimit";
import { useSubscription } from "@/components/SubscriptionProvider";
import { LimitModal } from "./LimitModal";
import { validatePdfServerSide } from "@/app/tools/pdf/actions";

const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

interface PdfFile {
  id: string;
  file: File;
}

function SortableItem({ pdf, onRemove }: { pdf: PdfFile; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pdf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm group transition-colors ${
        isDragging ? "border-amber-500 opacity-90" : "border-stone-200 hover:border-amber-200"
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-stone-400 hover:text-amber-600">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg shrink-0">
        <File className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{pdf.file.name}</p>
        <p className="text-xs text-stone-500">{(pdf.file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(pdf.id)}
        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function PdfMerge() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputName, setOutputName] = useState("merged.pdf");
  
  const { isPro } = useSubscription();
  const { canPerformAction, addAction, showLimitModal, setShowLimitModal, triggerLimitModal } = usePdfSessionLimit(isPro);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (!canPerformAction) {
        triggerLimitModal();
        return;
      }
      if (rejectedFiles.length > 0) {
        toast.error("Only PDF files are allowed.");
      }
      
      const currentSize = pdfs.reduce((acc, p) => acc + p.file.size, 0);
      const newFilesSize = acceptedFiles.reduce((acc, f) => acc + f.size, 0);
      
      if (!isPro && currentSize + newFilesSize > MAX_TOTAL_SIZE) {
        toast.error("Total file size exceeds the 50MB limit for free users. Upgrade to Pro for unlimited size.");
        return;
      }

      const validPdfs = [];
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await validatePdfServerSide(formData);
        if (!res.success) {
          toast.error(res.error);
        } else {
          validPdfs.push(file);
        }
      }

      const newPdfs = validPdfs.map(file => ({
        id: Math.random().toString(36).substring(2, 15),
        file
      }));
      setPdfs(prev => [...prev, ...newPdfs]);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPdfs((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMerge = async () => {
    if (pdfs.length < 2) {
      toast.error("Please add at least 2 PDFs to merge.");
      return;
    }
    if (!canPerformAction) {
      triggerLimitModal();
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfItem of pdfs) {
        const arrayBuffer = await pdfItem.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      
      // Download
      const blob = new Blob([mergedPdfFile as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      let finalName = outputName.trim();
      if (!finalName.toLowerCase().endsWith(".pdf")) finalName += ".pdf";
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Log Action
      addAction({
        type: 'merge',
        filename: finalName,
      });

      toast.success("PDFs merged successfully!");
      setPdfs([]); // clear after success
    } catch (error) {
      console.error(error);
      toast.error("Failed to merge PDFs. The files might be corrupted or protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink mb-2">Merge PDFs</h2>
        <p className="text-ink-2 text-sm">Combine multiple PDFs into a single file in the exact order you want.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-3xl p-6 md:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragActive ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-amber-300 hover:bg-stone-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-amber-500 mb-2">
          <Plus className="w-8 h-8" />
        </div>
        <div>
          <p className="text-ink font-medium text-lg">Click to upload or drag & drop</p>
          {!isPro && <p className="text-stone-500 text-sm mt-1">PDF files up to 50MB total</p>}
        </div>
      </div>

      {pdfs.length > 0 && (
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="font-semibold text-ink flex items-center gap-2 text-sm">
              <span className="bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">{pdfs.length} files</span>
            </h3>
            <p className="text-xs text-stone-500">Drag to reorder</p>
          </div>
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pdfs} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {pdfs.map((pdf) => (
                  <SortableItem key={pdf.id} pdf={pdf} onRemove={(id) => setPdfs(pdfs.filter(p => p.id !== id))} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
             <div className="flex items-center gap-3 w-full sm:w-auto">
               <label className="text-sm font-medium text-ink whitespace-nowrap">Output Name:</label>
               <input 
                 type="text" 
                 value={outputName}
                 onChange={(e) => setOutputName(e.target.value)}
                 className="flex-1 sm:w-48 px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
               />
             </div>
             
             <button
               onClick={handleMerge}
               disabled={pdfs.length < 2 || isProcessing}
               className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
             >
               {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
               {isProcessing ? "Merging..." : "Merge PDFs"}
             </button>
          </div>
        </div>
      )}
      
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}
