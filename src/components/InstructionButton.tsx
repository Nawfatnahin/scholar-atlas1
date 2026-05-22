'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { InstructionModal, InstructionOption } from './InstructionModal';

interface InstructionButtonProps {
  title: string;
  description?: string;
  options: InstructionOption[];
  className?: string;
}

export const InstructionButton: React.FC<InstructionButtonProps> = ({ title, description, options, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] ${className || ''}`}
      >
        <Info className="w-4 h-4" />
        <span>Instructions</span>
      </button>

      <InstructionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        options={options}
      />
    </>
  );
};
