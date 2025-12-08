import React, { useState } from 'react';
import { Recommendation, Citation } from '../types';
import { CITATIONS } from '../data/citations';
import { AlertCircle, Scale, Layers, BarChart2, GraduationCap, AlertTriangle, Info, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { CitationDownloadButtons, BulkCopyDropdown, BulkDownloadDropdown } from './CitationActions';

interface StrategyCardProps {
  recommendation: Recommendation;
}

// --- Citation Export Utilities moved to ../logic/citationFormatting.ts and ./CitationActions.tsx ---

const RegimeWarningCard: React.FC<{ warning: NonNullable<Recommendation['regimeWarnings']>[number] }> = ({ warning }) => {
  const [isExpanded, setIsExpanded] = useState(warning.type !== 'fold-integrity'); // Fold integrity collapsed by default

  const getWarningStyle = () => {
    switch (warning.type) {
      case 'tiny-minority':
        return { bg: 'bg-red-950/40', border: 'border-red-500/30', icon: 'text-red-400', title: 'text-red-300' };
      case 'high-dimensional':
        return { bg: 'bg-orange-950/40', border: 'border-orange-500/30', icon: 'text-orange-400', title: 'text-orange-300' };
      case 'large-scale':
        return { bg: 'bg-blue-950/40', border: 'border-blue-500/30', icon: 'text-blue-400', title: 'text-blue-300' };
      case 'calibration':
        return { bg: 'bg-amber-950/40', border: 'border-amber-500/30', icon: 'text-amber-400', title: 'text-amber-300' };
      case 'fold-integrity':
        return { bg: 'bg-indigo-950/40', border: 'border-indigo-500/30', icon: 'text-indigo-400', title: 'text-indigo-300' };
      default:
        return { bg: 'bg-zinc-900', border: 'border-zinc-700', icon: 'text-zinc-400', title: 'text-zinc-300' };
    }
  };

  const style = getWarningStyle();

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-3.5 h-3.5 ${style.icon}`} />
          <span className={`text-xs font-semibold ${style.title}`}>{warning.title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
      </button>

      {isExpanded && (
        <div className="px-2.5 pb-2.5 pt-0">
          <p className="text-[11px] text-zinc-300 leading-relaxed mb-2">{warning.message}</p>
          {warning.citationIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {warning.citationIds.map(id => {
                const citation = CITATIONS[id];
                if (!citation) return null;
                return (
                  <span key={id} className="text-[9px] px-1.5 py-0.5 bg-black/30 rounded text-zinc-400 font-mono">
                    [{citation.authors.split(',')[0].split(' ').pop()}, {citation.year}]
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Citations Panel Component ---

const CitationsPanel: React.FC<{ citationIds: string[] }> = ({ citationIds }) => {
  const [isOpen, setIsOpen] = useState(false);

  const uniqueCitations = Array.from(new Set(citationIds))
    .map((id: string) => CITATIONS[id])
    .filter(Boolean) as Citation[];

  if (uniqueCitations.length === 0) return null;

  // Determine menu direction based on citation index (last few should open upward)
  const getMenuDirection = (idx: number): 'down' | 'up' => {
    return idx >= uniqueCitations.length - 2 ? 'up' : 'down';
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-visible">
      <div
        className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-zinc-200">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-sm">References & Citations</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-mono">
            {uniqueCitations.length}
          </span>
          <span className="text-[10px] text-zinc-500 ml-1 font-medium tracking-wide opacity-80">
            (Regime-Matched)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Bulk action buttons in header */}
          <BulkCopyDropdown citations={uniqueCitations} />
          <BulkDownloadDropdown citations={uniqueCitations} />
          {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-zinc-800 p-4 overflow-visible">
          {/* Citation List */}
          <div className="space-y-3">
            {uniqueCitations.map((citation, idx) => (
              <div key={citation.id} className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 overflow-visible">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-zinc-200 font-medium leading-tight mb-1">
                      {citation.title}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {citation.authors} ({citation.year})
                    </p>
                    <p className="text-[10px] text-zinc-500 italic">
                      {citation.journal}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CitationDownloadButtons citation={citation} menuDirection={getMenuDirection(idx)} />
                    <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 font-mono">
                      [{idx + 1}]
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-zinc-800/50">
                  <span className="text-[9px] text-emerald-400/80 font-medium">Relevance: </span>
                  <span className="text-[9px] text-zinc-400">{citation.relevance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const StrategyCard: React.FC<StrategyCardProps> = ({ recommendation }) => {
  const { foldAnalysis, sparsityWarning, regimeWarnings, citations, calibrationNote } = recommendation;

  // Collect all citation IDs from regime warnings too
  const allCitationIds = [
    'resampleLab2025',
    ...citations,
    ...regimeWarnings.flatMap(w => w.citationIds)
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Strategy Header */}
      <div
        className="p-5 rounded-xl border shadow-lg relative overflow-hidden transition-colors duration-500"
        style={{
          backgroundColor: `${recommendation.color}15`, // ~8% opacity
          borderColor: `${recommendation.color}40`
        }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Scale size={64} color={recommendation.color} />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: recommendation.color }}>
          Suggested Strategy
        </span>
        <h2 className="text-3xl font-bold text-white mt-1 mb-2">
          {recommendation.title}
        </h2>
        <p className="text-zinc-300 text-lg leading-relaxed">
          {recommendation.description}
        </p>

        {/* Calibration Mode Indicator */}
        {calibrationNote && (
          <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2 text-xs text-amber-200/90">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <p>{calibrationNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Regime Warnings Section */}
      {regimeWarnings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
            <AlertTriangle className="w-3 h-3" />
            Critical Regime Warnings
          </div>
          <div className="space-y-2">
            {regimeWarnings.map((warning, idx) => (
              <RegimeWarningCard key={`${warning.type}-${idx}`} warning={warning} />
            ))}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Rationale Column */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Why this strategy?</h3>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            {recommendation.rationale}
          </p>

          <div className="space-y-2 mt-auto">
            {/* Sparsity Warning Block */}
            {sparsityWarning && (
              <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2 text-xs text-amber-200/80">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <p>{sparsityWarning}</p>
                </div>
              </div>
            )}

            {/* Training Impact Info */}
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-1">
                <GraduationCap className="w-3 h-3" />
                Effective Training Data
              </div>
              <p className="text-xs text-zinc-500 leading-tight">
                {foldAnalysis.trainingImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Fold Analysis & Stats Column */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3 h-full">

          {/* Fold Viability Meter */}
          <div className={`p-3.5 rounded-lg border ${foldAnalysis.statusBg}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
                <Layers className="w-4 h-4" />
                Fold Viability (Val)
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/20 ${foldAnalysis.statusColor}`}>
                {foldAnalysis.label}
              </span>
            </div>

            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-mono font-bold text-white leading-none tracking-tighter">
                {foldAnalysis.minPerFold}
              </span>
              <span className="text-xs text-zinc-400 mb-1 font-medium">Samples / Fold</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2 border border-white/5">
              <div
                className="h-full transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{
                  width: `${foldAnalysis.viabilityScore}%`,
                  backgroundColor: foldAnalysis.viabilityScore < 30 ? '#f87171' : foldAnalysis.viabilityScore < 100 ? '#fbbf24' : '#34d399'
                }}
              />
            </div>

            <p className="text-[11px] leading-relaxed opacity-90 font-medium">
              {foldAnalysis.validationRisk}
            </p>
          </div>

          {/* Strategy Mix Details */}
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mt-1">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Execution Targets
            </div>
            <div className="text-xs text-zinc-400 bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50 space-y-3">
              <div>
                <span className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Resampling Ratio</span>
                <span className="text-zinc-300">{recommendation.samplingMix}</span>
              </div>
              <div className="w-full h-px bg-zinc-800/50"></div>
              <div>
                <span className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Validation Target</span>
                <span className="text-zinc-300">{recommendation.foldTarget}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Citations Panel */}
      <CitationsPanel citationIds={allCitationIds} />

      {/* Disclaimer Footer */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/30 border border-zinc-800/50">
        <Info className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          <strong>Heuristic Disclaimer:</strong> This engine maps dataset geometry to standard resampling heuristics. It does not account for feature importance, label noise, or business-specific cost functions. Please use these results as a <em>hypothesis</em> for empirical validation on a hold-out test set.
        </p>
      </div>
    </div>
  );
};