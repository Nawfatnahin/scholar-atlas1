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
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-ink-2 hover:bg-white border border-transparent hover:border-border-strong shadow-sm transition-all ${className || ''}`}
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
