import React, { useState, useCallback } from 'react';
import { DatasetParams, AxisConfig } from './types';
import { Controls } from './components/Controls';
import { PhaseChart } from './components/PhaseChart';
import { StrategyCard } from './components/StrategyCard';
import { MissionBrief } from './components/MissionBrief';
import { CitationButton } from './components/CitationButton';
import { analyzeDataset, COLORS, getSmoothStrategyRGB, getFoldStabilityRGB } from './logic/recommendationEngine';
import {
  FeaturesVsMinorityOverlay,
  FeaturesVsTotalOverlay,
  TotalVsMinorityOverlay,
  FoldsVsMinorityOverlay
} from './components/ChartOverlays';
import { FlaskConical, ChevronDown, Layers, Github, Heart } from 'lucide-react';

// --- Static Configurations ---

const CFG_MINORITY: AxisConfig = { key: 'minority', min: 10, max: 10000, label: 'Minority (N)', scale: 'log' };
const CFG_FEATURES: AxisConfig = { key: 'features', min: 5, max: 10000, label: 'Features (p)', scale: 'log' };
const CFG_TOTAL: AxisConfig = { key: 'total', min: 100, max: 10000000, label: 'Total Samples', scale: 'log' };
const CFG_FOLDS: AxisConfig = { key: 'folds', min: 2, max: 100, label: 'CV Folds (K)', scale: 'log' };


function App() {
  const [params, setParams] = useState<DatasetParams>({
    features: 50,
    minority: 150,
    total: 2000,
    folds: 5,
    sparsity: 0.0,
    sparsityHomogeneity: 0.5,
    requiresCalibratedProbabilities: false,
  });

  const recommendation = analyzeDataset(params);

  const handleUpdate = useCallback((newParams: Partial<DatasetParams>) => {
    setParams(prev => {
      const next = { ...prev, ...newParams };
      // Enforce constraint: Total >= Minority
      if (next.total < next.minority) {
        if (newParams.total) next.total = next.minority;
        if (newParams.minority) next.minority = next.total;
      }
      return next;
    });
  }, []);

  // Memoized Color Generators
  const getColorMinorityFeatures = useCallback((x: number, y: number) =>
    getSmoothStrategyRGB(y, x, params.total, params.sparsity, params.sparsityHomogeneity),
    [params.total, params.sparsity, params.sparsityHomogeneity]);

  const getColorTotalFeatures = useCallback((x: number, y: number) =>
    getSmoothStrategyRGB(y, params.minority, x, params.sparsity, params.sparsityHomogeneity),
    [params.minority, params.sparsity, params.sparsityHomogeneity]);

  const getColorMinorityTotal = useCallback((x: number, y: number) =>
    getSmoothStrategyRGB(params.features, x, y, params.sparsity, params.sparsityHomogeneity),
    [params.features, params.sparsity, params.sparsityHomogeneity]);

  const getColorFolds = useCallback((x: number, y: number) =>
    getFoldStabilityRGB(x, y),
    []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050507] text-zinc-100 selection:bg-indigo-500/30 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">Resample Lab</h1>
              <p className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-1">How to handle Class Imbalance</p>
            </div>
          </div>



          {/* Support Badge */}
          <div className="relative group mx-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-200 text-xs font-medium hover:bg-pink-500/20 transition-all">
              <Heart className="w-3 h-3 text-pink-400" fill="currentColor" />
              <span>Support the Lab</span>
              <ChevronDown className="w-3 h-3 text-pink-500/50 group-hover:rotate-180 transition-transform" />
            </button>

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 py-1 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
              <div className="px-3 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-900">
                Donate via
              </div>
              <a href="https://www.paypal.com/donate/?hosted_button_id=WFXL2T42BBCRN" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-xs text-zinc-300 hover:text-blue-400 hover:bg-zinc-900/50 transition-colors">
                PayPal
              </a>
              <a href="https://ko-fi.com/Q5Q11I49GI" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-xs text-zinc-300 hover:text-pink-400 hover:bg-zinc-900/50 transition-colors">
                Ko-fi
              </a>
              <a href="https://liberapay.com/mr-september/donate" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-xs text-zinc-300 hover:text-yellow-400 hover:bg-zinc-900/50 transition-colors">
                Liberapay
              </a>
              <a href="https://nowpayments.io/donation?api_key=5b5fabd5-2c33-4525-99a3-bf27f587780c" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-xs text-zinc-300 hover:text-emerald-400 hover:bg-zinc-900/50 transition-colors">
                Crypto
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Legend */}
            <div className="hidden md:flex items-center gap-6">
              {Object.entries(COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }}></div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{key}</span>
                </div>
              ))}
            </div>

            {/* Citation */}
            <CitationButton />

            {/* GitHub Link */}
            <a
              href="https://github.com/mr-september/Resample-Lab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-indigo-400 transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header >

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Controls params={params} onChange={handleUpdate} />

            <div className="hidden lg:block p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Layers className="w-3 h-3" />
                Navigation Matrix
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <div className="w-16 text-right font-mono text-zinc-600">Top Left</div>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
                  <span className="text-zinc-300">Features vs. Minority</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <div className="w-16 text-right font-mono text-zinc-600">Top Right</div>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
                  <span className="text-zinc-300">Features vs. Total</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <div className="w-16 text-right font-mono text-zinc-600">Bot Left</div>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
                  <span className="text-zinc-300">Total vs. Minority</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <div className="w-16 text-right font-mono text-zinc-600">Bot Right</div>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
                  <span className="text-zinc-300">Folds vs. Minority</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visuals & Strategy */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            <MissionBrief />

            <div className="grid grid-cols-[1fr_1fr] gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 shadow-2xl relative group">
              <PhaseChart
                height={240}
                xConfig={CFG_MINORITY}
                yConfig={CFG_FEATURES}
                valX={params.minority}
                valY={params.features}
                onUpdate={handleUpdate}
                getColor={getColorMinorityFeatures}
                isValid={(x, _) => x <= params.total}
                renderOverlay={(props) => <FeaturesVsMinorityOverlay {...props} total={params.total} />}
                className="rounded-tl-lg border-none"
              />

              <PhaseChart
                height={240}
                xConfig={CFG_TOTAL}
                yConfig={CFG_FEATURES}
                valX={params.total}
                valY={params.features}
                onUpdate={handleUpdate}
                getColor={getColorTotalFeatures}
                isValid={(x, _) => x >= params.minority}
                renderOverlay={(props) => <FeaturesVsTotalOverlay {...props} minority={params.minority} />}
                className="rounded-tr-lg border-none border-l border-zinc-800"
                titleAlignment="right"
              />

              <PhaseChart
                height={240}
                xConfig={CFG_MINORITY}
                yConfig={CFG_TOTAL}
                valX={params.minority}
                valY={params.total}
                onUpdate={handleUpdate}
                getColor={getColorMinorityTotal}
                isValid={(x, y) => y >= x}
                renderOverlay={(props) => <TotalVsMinorityOverlay {...props} />}
                className="rounded-bl-lg border-none border-t border-zinc-800"
              />

              <PhaseChart
                height={240}
                xConfig={CFG_MINORITY}
                yConfig={CFG_FOLDS}
                valX={params.minority}
                valY={params.folds}
                onUpdate={handleUpdate}
                getColor={getColorFolds}
                isValid={(x, y) => y <= x}
                renderOverlay={(props) => <FoldsVsMinorityOverlay {...props} />}
                className="rounded-br-lg border-none border-t border-l border-zinc-800"
                titleAlignment="right"
              />
            </div>

            <StrategyCard recommendation={recommendation} />
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800/60 bg-black/20 backdrop-blur-md py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-zinc-500 text-xs font-medium">
            MIT License • Open Source
          </div>

          <div className="flex items-center gap-2 text-zinc-600 text-xs text-center md:text-right">
            <span>Advanced Resampling Heuristics</span>
          </div>
        </div>
      </footer>
    </div >
  );
}

export default App;