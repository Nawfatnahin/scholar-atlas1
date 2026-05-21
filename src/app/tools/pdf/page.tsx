import React from "react";
import Link from "next/link";
import { ArrowLeftRight, SplitSquareHorizontal, Images, File } from "lucide-react";
import { InstructionButton } from "@/components/InstructionButton";

export default function PdfToolsPage() {
  const tools = [
    {
      title: "Merge PDFs",
      description: "Combine multiple PDF files into one document.",
      icon: <ArrowLeftRight className="w-10 h-10 text-blue-500" />,
      href: "/tools/pdf/merge",
      color: "hover:border-blue-200/50 hover:bg-blue-50/50",
    },
    {
      title: "Split PDF",
      description: "Extract specific pages or separate a PDF into multiple files.",
      icon: <SplitSquareHorizontal className="w-10 h-10 text-emerald-500" />,
      href: "/tools/pdf/split",
      color: "hover:border-emerald-200/50 hover:bg-emerald-50/50",
    },
    {
      title: "PDF to Images",
      description: "Convert each page of a PDF into high-quality images.",
      icon: <Images className="w-10 h-10 text-purple-500" />,
      href: "/tools/pdf/pdf-to-images",
      color: "hover:border-purple-200/50 hover:bg-purple-50/50",
    },
    {
      title: "Images to PDF",
      description: "Combine multiple images into a single PDF document.",
      icon: <File className="w-10 h-10 text-amber-500" />,
      href: "/tools/pdf/images-to-pdf",
      color: "hover:border-amber-200/50 hover:bg-amber-50/50",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-ink mb-4 tracking-tighter">
            Master your materials.
          </h1>
          <p className="text-xl text-ink-3 font-medium max-w-2xl leading-relaxed">
            High performance PDF tools that run entirely in your browser. Fast, private and zero server side processing.
          </p>
        </div>
        <InstructionButton 
          title="PDF Tools"
          description="A suite of powerful, client-side tools to manage your PDF files securely."
          options={[
            { title: "Merge PDFs", description: "Select multiple PDF files, reorder them as needed, and combine them into a single continuous document." },
            { title: "Split PDF", description: "Upload a PDF and select specific page ranges to extract into separate files." },
            { title: "PDF to Images", description: "Convert each page of your PDF document into high-resolution JPG or PNG images." },
            { title: "Images to PDF", description: "Upload images, arrange their order, and compile them into a formatted PDF document." }
          ]}
          className="bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className={`group flex flex-col p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-border-strong bg-white shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 ${tool.color}`}
          >
            <div className="bg-bg group-hover:bg-white w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[24px] flex items-center justify-center mb-6 md:mb-8 border border-border-strong shadow-inner transition-colors duration-500">
              <div className="group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(tool.icon as React.ReactElement, { className: "w-8 h-8 md:w-10 md:h-10" })}
              </div>
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-ink mb-2 md:mb-3 tracking-tight">
              {tool.title}
            </h2>
            <p className="text-ink-3 text-base md:text-lg leading-relaxed font-medium">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
