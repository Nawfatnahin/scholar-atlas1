"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2, BookOpen } from "lucide-react";
import { addResourceLink, deleteResourceLink } from "@/app/dashboard/resources/actions";
import { RESOURCE_ICONS } from "@/lib/resourceUtils";
import type { ResourceType } from "@/types/resources";

interface DashboardResourceLinksProps {
  initialLinks: {
    id: string;
    title: string;
    url: string;
    type: ResourceType;
  }[];
}

export default function DashboardResourceLinks({ initialLinks }: DashboardResourceLinksProps) {
  const [links, setLinks] = useState(initialLinks);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    try {
      setIsSubmitting(true);
      // Wait for server action
      await addResourceLink({ title, url });
      
      // We do a soft refresh or trust revalidatePath to update data,
      // but to feel snappy, we can just reload the page or wait for next.js revalidation.
      // Since it's a server action with revalidatePath, Next.js will refresh the route.
      setTitle("");
      setUrl("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add link:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      setLinks(links.filter(l => l.id !== id));
      await deleteResourceLink(id);
    } catch (error) {
      console.error("Failed to delete link:", error);
      // Revert optimistic update if needed (not implemented for brevity)
    }
  };

  return (
    <div className="bg-bg-surface/80 backdrop-blur-xl p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border border-border-strong shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:bg-bg-elevated/80 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
        <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
          <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-accent" />
          Global Resources
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 sm:px-4 sm:py-2 rounded-xl bg-accent text-white hover:scale-105 shadow-md shadow-accent/20 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Link</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-2xl bg-bg-base border border-border-subtle shrink-0">
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Link Name (e.g. CS101 Syllabus)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium"
                required
              />
            </div>
            <div>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-bg-surface transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {links.length > 0 ? (
          links.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:bg-bg-base transition-colors group border border-transparent hover:border-border-subtle">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-xl sm:text-2xl shrink-0" title={link.type}>
                  {RESOURCE_ICONS[link.type] || RESOURCE_ICONS.link}
                </span>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm sm:text-base font-bold text-text-primary truncate">{link.title}</span>
                  <span className="text-[10px] sm:text-xs text-text-tertiary truncate max-w-[200px]">{link.url}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400 transition-colors"
                  title="Visit Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => handleDelete(link.id)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors"
                  title="Delete Link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          !isAdding && (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-tertiary">
              <BookOpen className="w-10 h-10 mb-4 opacity-20" />
              <p className="text-sm font-medium">No global resources yet.</p>
              <p className="text-xs mt-1">Add your most used links here for quick access.</p>
            </div>
          )
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(150, 150, 150, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(150, 150, 150, 0.4);
        }
      `}} />
    </div>
  );
}
