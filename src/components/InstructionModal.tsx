'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

export interface InstructionOption {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  options: InstructionOption[];
}

export const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  options,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-bg rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh] border-b-8 border-blue-600/10"
          >
            <div className="px-10 py-8 border-b border-border-strong flex justify-between items-center bg-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-ink">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-ink-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-white/30">
              {description && (
                <p className="text-lg text-ink-2 font-medium leading-relaxed">
                  {description}
                </p>
              )}

              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="p-6 bg-white border border-border-strong rounded-[28px] shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      {option.icon && (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                          {option.icon}
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-bold text-ink mb-2">{option.title}</h4>
                        <p className="text-ink-3 text-sm leading-relaxed font-medium">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-10 py-6 border-t border-border-strong bg-white/80">
              <button
                onClick={onClose}
                className="w-full py-4 bg-ink hover:bg-ink-2 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-ink/20 active:scale-[0.98]"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
