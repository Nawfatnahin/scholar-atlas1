'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { toast } from 'sonner';
import type { GradeScale, GradeScaleMapping } from '@/lib/cgpa/cgpa-types';
import { saveGradeScale, deleteGradeScale } from '@/app/dashboard/cgpa/actions';

interface GradeScaleEditorProps {
  scales: GradeScale[];
  onScalesChange: (scales: GradeScale[]) => void;
}

export function GradeScaleEditor({ scales, onScalesChange }: GradeScaleEditorProps) {
  const [expanded, setExpanded] = useState(scales.length === 0);
  const [editingScale, setEditingScale] = useState<GradeScale | null>(null);
  const [scaleName, setScaleName] = useState('Default Scale');
  const [mappings, setMappings] = useState<GradeScaleMapping[]>([
    { threshold: 80, gradePoint: 4.00 },
    { threshold: 75, gradePoint: 3.75 },
    { threshold: 70, gradePoint: 3.50 },
    { threshold: 65, gradePoint: 3.25 },
    { threshold: 60, gradePoint: 3.00 },
    { threshold: 55, gradePoint: 2.75 },
    { threshold: 50, gradePoint: 2.50 },
    { threshold: 45, gradePoint: 2.25 },
    { threshold: 40, gradePoint: 2.00 },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const globalScale = scales.find((s) => s.is_global);

  const handleStartEdit = (scale: GradeScale) => {
    setEditingScale(scale);
    setScaleName(scale.scale_name);
    setMappings([...scale.mappings]);
    setExpanded(true);
  };

  const handleStartNew = () => {
    setEditingScale(null);
    setScaleName('Default Scale');
    setMappings([
      { threshold: 80, gradePoint: 4.00 },
      { threshold: 75, gradePoint: 3.75 },
      { threshold: 70, gradePoint: 3.50 },
      { threshold: 65, gradePoint: 3.25 },
      { threshold: 60, gradePoint: 3.00 },
      { threshold: 55, gradePoint: 2.75 },
      { threshold: 50, gradePoint: 2.50 },
      { threshold: 45, gradePoint: 2.25 },
      { threshold: 40, gradePoint: 2.00 },
    ]);
    setExpanded(true);
  };

  const handleAddRow = () => {
    const lowestThreshold = mappings.length > 0 ? Math.min(...mappings.map((m) => m.threshold)) : 50;
    setMappings([...mappings, { threshold: Math.max(lowestThreshold - 5, 0), gradePoint: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (mappings.length <= 1) {
      toast.error('At least one mapping is required, Sir.');
      return;
    }
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const handleMappingChange = (index: number, field: 'threshold' | 'gradePoint', value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setMappings(updated);
  };

  const handleSave = async () => {
    if (mappings.some((m) => isNaN(m.threshold) || isNaN(m.gradePoint))) {
      toast.error('All fields must be valid numbers, Sir.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveGradeScale({
        id: editingScale?.id,
        scale_name: scaleName,
        mappings,
        is_global: true,
      });

      if (res.success) {
        toast.success('Grade scale saved with precision, Sir.');
        // Optimistically update local state
        if (editingScale) {
          onScalesChange(
            scales.map((s) =>
              s.id === editingScale.id
                ? { ...s, scale_name: scaleName, mappings: [...mappings].sort((a, b) => b.threshold - a.threshold) }
                : s
            )
          );
        } else {
          // Refresh needed for new scale — revalidatePath handles it
          window.location.reload();
        }
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteGradeScale(id);
      if (res.success) {
        toast.success('Grade scale removed, Sir.');
        onScalesChange(scales.filter((s) => s.id !== id));
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Sort displayed mappings by threshold descending
  const sortedMappings = [...mappings].sort((a, b) => b.threshold - a.threshold);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-border-strong shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
            <Scale className="w-5 h-5 text-violet-700" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-black text-ink tracking-tight">Grade Scale</h3>
            <p className="text-xs font-medium text-ink-3">
              {globalScale
                ? `${globalScale.mappings.length} thresholds defined`
                : 'No grade scale configured yet'}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-ink-3" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ink-3" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
          {/* Existing scales list */}
          {scales.length > 0 && !editingScale && (
            <div className="space-y-3">
              {scales.map((scale) => (
                <div
                  key={scale.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-border-strong"
                >
                  <div>
                    <p className="text-sm font-bold text-ink">{scale.scale_name}</p>
                    <p className="text-xs text-ink-3">{scale.mappings.length} thresholds</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(scale)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#92400e] bg-[#92400e]/10 hover:bg-[#92400e]/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(scale.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scale editor form */}
          {(scales.length === 0 || editingScale || expanded) && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-[0.2em]">
                  Scale Name
                </label>
                <input
                  type="text"
                  value={scaleName}
                  onChange={(e) => setScaleName(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border-2 border-stone-100 bg-white font-bold text-sm outline-none focus:border-violet-400 transition-all"
                  placeholder="e.g. Default Scale"
                />
              </div>

              {/* Mappings table */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-3 uppercase tracking-[0.2em]">
                  Threshold Mappings
                </label>
                <div className="rounded-2xl border border-stone-100 overflow-hidden">
                  <div className="grid grid-cols-[1fr_1fr_48px] gap-0 bg-stone-50 px-4 py-2.5">
                    <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Min Score (%)</span>
                    <span className="text-[10px] font-black text-ink-3 uppercase tracking-widest">Grade Point</span>
                    <span></span>
                  </div>
                  {sortedMappings.map((mapping, displayIndex) => {
                    // Find the original index in the unsorted mappings array
                    const originalIndex = mappings.findIndex(
                      (m) => m.threshold === mapping.threshold && m.gradePoint === mapping.gradePoint
                    );
                    return (
                      <div
                        key={displayIndex}
                        className="grid grid-cols-[1fr_1fr_48px] gap-0 px-4 py-1.5 border-t border-stone-50 items-center"
                      >
                        <input
                          type="number"
                          value={mapping.threshold}
                          onChange={(e) => handleMappingChange(originalIndex, 'threshold', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-white text-sm font-bold outline-none focus:border-violet-400 transition-all mr-2"
                          min="0"
                          max="100"
                          step="1"
                        />
                        <input
                          type="number"
                          value={mapping.gradePoint}
                          onChange={(e) => handleMappingChange(originalIndex, 'gradePoint', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-white text-sm font-bold outline-none focus:border-violet-400 transition-all mr-2"
                          min="0"
                          max="4"
                          step="0.25"
                        />
                        <button
                          onClick={() => handleRemoveRow(originalIndex)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
              </div>

              {/* Save */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#92400e] text-white font-black text-xs uppercase tracking-widest hover:bg-[#78350f] transition-all active:scale-95 shadow-lg shadow-[#92400e]/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : editingScale ? 'Update Scale' : 'Save Scale'}
                </button>
                {editingScale && (
                  <button
                    onClick={() => {
                      setEditingScale(null);
                      handleStartNew();
                    }}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-ink-3 hover:text-ink hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}

          {/* Create new button (when existing scales exist and not editing) */}
          {scales.length > 0 && !editingScale && (
            <button
              onClick={handleStartNew}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Scale
            </button>
          )}
        </div>
      )}
    </div>
  );
}
