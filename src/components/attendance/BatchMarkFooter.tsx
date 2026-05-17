'use client';

import React from 'react';
import { Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BatchMarkFooterProps {
  isVisible: boolean;
  changeCount: number;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export const BatchMarkFooter: React.FC<BatchMarkFooterProps> = ({
  isVisible,
  changeCount,
  onSave,
  onCancel,
  isPending,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4"
        >
          <div className="bg-zinc-900 border border-white/10 rounded-[30px] p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 pl-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black">
                {changeCount}
              </div>
              <p className="text-sm font-bold text-white">Changes pending</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-6 py-3 rounded-2xl text-sm font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isPending || changeCount === 0}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-4 h-4" />
                {isPending ? 'Saving...' : 'Save All'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
