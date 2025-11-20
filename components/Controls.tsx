import React from 'react';
import { DatasetParams } from '../types';
import { RefreshCw, Layers, Users, Hash, Info, Grid, BoxSelect, AlertTriangle } from 'lucide-react';

interface ControlsProps {
  params: DatasetParams;
  onChange: (newParams: DatasetParams) => void;
}

// --- Reusable UI Shell for Sliders ---
interface SliderShellProps {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  displayValue: number | string;
  minValue?: number | string;
  maxValue?: number | string;
  onTextChange?: (val: number) => void;
  children: React.ReactNode; 
  customHeaderRight?: React.ReactNode;
  className?: string;
}

const SliderShell: React.FC<SliderShellProps> = ({ 
  label, subLabel, icon, displayValue, minValue, maxValue, 
  onTextChange, children, customHeaderRight, className 
}) => {
  return (
    <div className={`group ${className ?? 'mb-4'}`}>
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-gray-200 font-medium text-sm">
            {icon}
            <span>{label}</span>
          </div>
          {subLabel && (
            <span className="text-[10px] text-zinc-500 ml-6 leading-tight">{subLabel}</span>
          )}
        </div>
        {customHeaderRight ? customHeaderRight : (
          onTextChange && (
            <input
              type="number"
              value={displayValue === '∞' ? 99999 : displayValue}
              onChange={(e) => onTextChange(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-right w-20 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-200 font-mono"
            />
          )
        )}
      </div>
      {children}
      {(minValue !== undefined && maxValue !== undefined) && (
        <div className="flex justify-between text-[9px] text-zinc-600 mt-1 font-mono uppercase tracking-wider">
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      )}
    </div>
  );
};

// --- Specific Slider Implementations ---

const LogSlider: React.FC<{
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  maxLabel?: string;
  onChange: (val: number) => void;
  className?: string;
}> = ({ label, subLabel, icon, value, min, max, maxLabel, onChange, className }) => {
  // Using Math.log10 to match the PhaseChart axis logic and ensure perfect alignment
  const minLog = Math.log10(min);
  const maxLog = Math.log10(max);
  const scale = (maxLog - minLog) / 1000;

  const toSlider = (val: number) => (Math.log10(Math.max(val, min)) - minLog) / scale;
  const fromSlider = (sliderVal: number) => Math.round(Math.pow(10, minLog + sliderVal * scale));

  return (
    <SliderShell
      label={label}
      subLabel={subLabel}
      icon={icon}
      displayValue={value >= max ? (maxLabel || '∞') : value}
      minValue={min.toLocaleString()}
      maxValue={maxLabel || (max >= 1000000 ? '∞' : max.toLocaleString())}
      onTextChange={(v) => onChange(Math.max(min, v))}
      className={className}
    >
      <input
        type="range"
        min="0"
        max="1000"
        value={toSlider(Math.min(value, max))}
        onChange={(e) => onChange(fromSlider(Number(e.target.value)))}
        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
      />
    </SliderShell>
  );
};

const PctSlider: React.FC<{
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
}> = ({ label, subLabel, icon, value, onChange }) => {
  return (
    <SliderShell
      label={label}
      subLabel={subLabel}
      icon={icon}
      displayValue={(value * 100).toFixed(0) + "%"}
      minValue="0%"
      maxValue="99%"
      customHeaderRight={
        <div className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 w-12 text-center text-xs font-mono text-zinc-200">
          {(value * 100).toFixed(0)}%
        </div>
      }
    >
      <input
        type="range"
        min="0"
        max="99"
        value={value * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
      />
    </SliderShell>
  );
};

// Helper for Distribution Slider colors
const getDistributionColor = (inactiveFactor: number) => {
  const r = 45 + (113 - 45) * inactiveFactor;
  const g = 212 + (113 - 212) * inactiveFactor;
  const b = 191 + (122 - 191) * inactiveFactor;
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

const DistributionSlider: React.FC<{
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
}> = ({ label, subLabel, icon, value, onChange }) => {
  const leftColor = getDistributionColor(value);
  const rightColor = getDistributionColor(1 - value);

  return (
    <SliderShell
      label={label}
      subLabel={subLabel}
      icon={icon}
      displayValue="" 
      customHeaderRight={<div />}
    >
      <input
        type="range"
        min="0"
        max="100"
        value={value * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
      />
      <div className="flex justify-between text-[9px] mt-1 font-bold tracking-tight">
        <span style={{ color: leftColor }} className="transition-colors duration-75">Concentrated</span>
        <span style={{ color: rightColor }} className="transition-colors duration-75">Uniform</span>
      </div>
    </SliderShell>
  );
};

export const Controls: React.FC<ControlsProps> = ({ params, onChange }) => {
  const update = (key: keyof DatasetParams, val: number) => {
    onChange({ ...params, [key]: val });
  };

  const isStratificationImpossible = params.folds > params.minority;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm shadow-xl flex flex-col">
      <h2 className="text-base font-bold text-white mb-3 border-b border-zinc-800 pb-2 flex items-center gap-2">
        <RefreshCw className="w-4 h-4" /> Dataset Config
      </h2>

      <LogSlider
        label="Feature Count (p)"
        subLabel="Number of input variables"
        icon={<Hash className="w-3.5 h-3.5 text-blue-400" />}
        value={params.features}
        min={1}
        max={10000}
        maxLabel="∞"
        onChange={(v) => update('features', v)}
      />

      <LogSlider
        label="True Minority Samples"
        subLabel="Raw count (before resampling)"
        icon={<Users className="w-3.5 h-3.5 text-red-400" />}
        value={params.minority}
        min={10}
        max={1000000}
        onChange={(v) => update('minority', v)}
      />

      <LogSlider
        label="Total Samples (N)"
        subLabel="Minority + Majority classes"
        icon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
        value={params.total}
        min={100}
        max={10000000}
        onChange={(v) => update('total', v)}
      />

      <div className="pt-3 mt-1 border-t border-zinc-800">
        <h3 className="text-[10px] font-bold uppercase text-zinc-500 mb-3 tracking-wider">Sparsity Characteristics</h3>
        
        <PctSlider
          label="Global Sparsity Rate"
          subLabel="% of dataset that is Zero/Null"
          icon={<Grid className="w-3.5 h-3.5 text-teal-400" />}
          value={params.sparsity}
          onChange={(v) => update('sparsity', v)}
        />

        <DistributionSlider
          label="Sparsity Distribution"
          subLabel="Where are the zeros located?"
          icon={<BoxSelect className="w-3.5 h-3.5 text-teal-400" />}
          value={params.sparsityHomogeneity}
          onChange={(v) => update('sparsityHomogeneity', v)}
        />
      </div>

      <div className="mt-1 pt-3 border-t border-zinc-800">
         <div className="relative">
            <LogSlider
              label="CV Folds (k)"
              subLabel="Validation Strategy"
              icon={<RefreshCw className="w-3.5 h-3.5 text-green-400" />}
              value={params.folds}
              min={2}
              max={10000} 
              maxLabel="∞"
              onChange={(v) => update('folds', v)}
              className="mb-1"
            />
            {isStratificationImpossible && (
               <div className="mb-3 mx-1 p-2 bg-red-500/10 border border-red-500/30 rounded-md flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-red-300 leading-tight">Stratification Infeasible</span>
                    <span className="text-[9px] text-red-200/70 leading-tight">Fold count exceeds minority samples, resulting in empty validation folds.</span>
                  </div>
               </div>
            )}
         </div>
      </div>
      
      <div className="mt-0 flex gap-2 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] leading-normal text-blue-200">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          <strong>Tip:</strong> Setting <em>k</em> to <strong>∞</strong> or the dataset size effectively enables <strong>Leave-One-Out Cross-Validation</strong> (LOOCV).
        </p>
      </div>
    </div>
  );
};