import Link from "next/link";
import Footer from "@/components/Footer";
import { ActionHistorySidebar } from "@/components/pdf/ActionHistorySidebar";
import { ArrowLeft, Home, FileText } from "lucide-react";

export const metadata = {
  title: "PDF Tools - Scholar Atlas",
  description: "Fast, secure, and client-side PDF manipulation tools for students.",
};

export default function PdfToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg font-body">
      <header className="bg-white/95 backdrop-blur-md border-b border-border-strong py-3 md:py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="p-3 rounded-2xl bg-bg text-ink-2 hover:bg-stone-100 transition-all border border-border-strong">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-ink tracking-tight uppercase tracking-[0.1em]">PDF Toolkit</h1>
            </div>
          </div>
          
          <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-ink-2 hover:bg-stone-50 transition-all">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full px-4 md:px-8 py-8 md:py-12 gap-8 md:gap-12">
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl md:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-border-strong p-5 md:p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700"></div>
            {children}
          </div>
        </main>

        {/* Action History Sidebar */}
        <aside className="w-full lg:w-96 shrink-0">
          <ActionHistorySidebar />
        </aside>

      </div>
      
      <Footer />
    </div>
  );
}
