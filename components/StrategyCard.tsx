import React from 'react';
import { Recommendation } from '../types';
import { AlertCircle, Scale, Layers, BarChart2, GraduationCap, AlertTriangle, Info } from 'lucide-react';

interface StrategyCardProps {
  recommendation: Recommendation;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ recommendation }) => {
  const { foldAnalysis, sparsityWarning } = recommendation;

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
      </div>

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