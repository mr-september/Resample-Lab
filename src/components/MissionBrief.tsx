import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MousePointerClick, Info } from 'lucide-react';

export const MissionBrief = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-2.5 text-sm font-semibold text-indigo-200">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span>Quick Start Guide</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>

            {isOpen && (
                <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-zinc-400 text-xs leading-relaxed border-t border-zinc-800/50">
                    <div className="space-y-1.5">
                        <strong className="text-zinc-200 block">1. Define Parameters</strong>
                        <p>Set feature count (p) and class sizes. The engine evaluates if your minority density supports the feature dimensionality.</p>
                    </div>
                    <div className="space-y-1.5">
                        <strong className="text-zinc-200 block">2. Explore Phase Space</strong>
                        <p>The 4 charts map the "Resampling Phase Space". <span className="text-indigo-300 inline-flex items-center"><MousePointerClick className="w-3 h-3 mx-0.5" /> Click & Drag</span> charts to simulate different dataset conditions.</p>
                    </div>
                    <div className="space-y-1.5">
                        <strong className="text-zinc-200 block">3. Analyze Strategy</strong>
                        <p>Review the heuristic recommendation. These are general guidelines; always consult domain-specific best practices.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
