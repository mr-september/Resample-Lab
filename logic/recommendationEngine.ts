import { DatasetParams, Recommendation, StrategyType, FoldAnalysis, RGB } from '../types';

// --- Configuration & Constants ---

export const COLORS: Record<StrategyType, string> = {
  [StrategyType.OVERSAMPLE]: '#ef4444', // Red
  [StrategyType.UNDERSAMPLE]: '#3b82f6', // Blue
  [StrategyType.HYBRID]: '#a855f7',     // Purple
  [StrategyType.BASELINE]: '#10b981',   // Emerald
};

const THRESHOLDS = {
  DIM_LOW: 20,
  DIM_HIGH: 100,
  MIN_SAMPLES_BASE: 200,
  EFFICIENCY_RATIO: 60,  // 1:60 imbalance
  EFFICIENCY_TOTAL: 150000, // 150k samples
  SPARSITY_CRITICAL: 0.6,
  SPARSITY_SKEWED: 0.3
};

const FOLD_STATUS_CONFIG = {
  LOO: {
    color: "text-pink-400",
    bg: "bg-pink-500/20 border-pink-500/30",
    label: "Leave-One-Out Cross-Validation"
  },
  IMPOSSIBLE: {
    color: "text-zinc-500",
    bg: "bg-zinc-800 border-zinc-700",
    label: "Statistically Invalid"
  },
  LOPO: {
    color: "text-purple-400",
    bg: "bg-purple-500/20 border-purple-500/30",
    label: "Leave-One-Positive-Out (Stratified)"
  },
  VARIANCE: {
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/30",
    label: "High Variance Region"
  },
  STABLE: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/20 border-emerald-500/30",
    label: "Stable Evaluation"
  }
};

// --- Math Helpers ---

const hexToRgb = (hex: string): RGB => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16)
});

// Precompute RGBs to avoid hex parsing every frame
const STRATEGY_RGB: Record<StrategyType, RGB> = {
  [StrategyType.OVERSAMPLE]: hexToRgb(COLORS[StrategyType.OVERSAMPLE]),
  [StrategyType.UNDERSAMPLE]: hexToRgb(COLORS[StrategyType.UNDERSAMPLE]),
  [StrategyType.HYBRID]: hexToRgb(COLORS[StrategyType.HYBRID]),
  [StrategyType.BASELINE]: hexToRgb(COLORS[StrategyType.BASELINE]),
};

// Sigmoid for smooth transitions (Base 10)
const sigmoid = (val: number, threshold: number, k: number = 12) => {
  const x = Math.log10(Math.max(val, 1)); // Protect against log(0)
  const t = Math.log10(Math.max(threshold, 1));
  return 1 / (1 + Math.exp(-k * (x - t)));
};

// --- Domain Logic Helpers ---

const getMinorityThreshold = (p: number): number => {
  if (p <= THRESHOLDS.DIM_LOW) return THRESHOLDS.MIN_SAMPLES_BASE;
  if (p <= THRESHOLDS.DIM_HIGH) return THRESHOLDS.MIN_SAMPLES_BASE + (p - THRESHOLDS.DIM_LOW) * 2.5; 
  return 400 + 200 * Math.log10(p / 100); 
};

const getDistanceStability = (sparsity: number, homogeneity: number): number => {
  if (sparsity < 0.3) return 1.0;
  const baseInstability = Math.pow(sparsity, 2.5);
  const distributionImpact = 0.2 + (0.8 * homogeneity); 
  const risk = baseInstability * distributionImpact;
  return Math.max(0, 1 - risk);
};

// --- Core Calculation Engine ---

interface WeightResult {
  wOversample: number;
  wUndersample: number;
  wHybrid: number;
  wBaseline: number;
  stability: number;
  dominantOriginal: StrategyType | null; 
}

const calculateWeights = (
  p: number, 
  nMin: number, 
  nTotal: number, 
  sparsity: number, 
  homogeneity: number
): WeightResult => {
  const threshold = getMinorityThreshold(p);
  
  // 1. Dimensionality Factors
  const isLowDim = 1 - sigmoid(p, THRESHOLDS.DIM_LOW, 12); 
  const isHighDim = sigmoid(p, THRESHOLDS.DIM_HIGH, 12); 
  const isMedDim = 1 - isLowDim - isHighDim;

  // 2. Count & Ratio Factors
  const isTinyMin = 1 - sigmoid(nMin, threshold, 10);
  
  // Efficiency Pressure: Driven by total size (cost) OR extreme imbalance
  const ratio = nTotal / Math.max(1, nMin);
  const isHighRatio = sigmoid(ratio, THRESHOLDS.EFFICIENCY_RATIO, 8);
  const isLargeTotal = sigmoid(nTotal, THRESHOLDS.EFFICIENCY_TOTAL, 8);
  const efficiencyPressure = Math.max(isHighRatio, isLargeTotal);

  let wOversample = 0;
  let wUndersample = 0;
  let wHybrid = 0;
  let wBaseline = 0;

  // 3. Logic Distribution
  
  // Low Dim Regime
  if (isLowDim > 0.01) {
     wOversample += isLowDim * isTinyMin;
     const safeScore = isLowDim * (1 - isTinyMin);
     wUndersample += safeScore * efficiencyPressure;
     wBaseline    += safeScore * (1 - efficiencyPressure);
  }

  // Med Dim Regime
  if (isMedDim > 0.01) {
    wHybrid += isMedDim * isTinyMin;
    const safeScore = isMedDim * (1 - isTinyMin);
    wUndersample += safeScore * efficiencyPressure;
    wBaseline    += safeScore * (1 - efficiencyPressure);
  }

  // High Dim Regime
  if (isHighDim > 0.01) {
    wHybrid += isHighDim * isTinyMin;
    wUndersample += isHighDim * (1 - isTinyMin);
  }

  // Fallback to Baseline if no strategy strongly activated
  const totalW = wOversample + wUndersample + wHybrid + wBaseline;
  if (totalW < 0.001) wBaseline = 1;

  // Determine dominant strategy BEFORE sparsity penalties
  let dominantOriginal: StrategyType | null = null;
  const maxOrig = Math.max(wOversample, wUndersample, wHybrid, wBaseline);
  
  if (maxOrig === wOversample) dominantOriginal = StrategyType.OVERSAMPLE;
  else if (maxOrig === wHybrid) dominantOriginal = StrategyType.HYBRID;
  else if (maxOrig === wUndersample) dominantOriginal = StrategyType.UNDERSAMPLE;
  else dominantOriginal = StrategyType.BASELINE;

  // 4. Apply Sparsity Penalties
  const stability = getDistanceStability(sparsity, homogeneity);
  const penalty = 1 - stability;

  if (penalty > 0) {
    wOversample -= wOversample * penalty;
    wBaseline += wOversample * penalty; 

    wHybrid -= wHybrid * penalty;
    wBaseline += wHybrid * penalty;
  }

  return { wOversample, wUndersample, wHybrid, wBaseline, stability, dominantOriginal };
};

// --- Visual Generators ---

export const getSmoothStrategyRGB = (
  p: number, 
  nMin: number, 
  nTotal: number,
  sparsity: number,
  homogeneity: number
): RGB => {
  const { wOversample, wUndersample, wHybrid, wBaseline } = calculateWeights(p, nMin, nTotal, sparsity, homogeneity);
  const totalWeight = wOversample + wUndersample + wHybrid + wBaseline || 1;

  let r = 0, g = 0, b = 0;
  
  // Helper to accumulate weighted colors
  const accumulate = (weight: number, type: StrategyType) => {
    if (weight > 0) {
      const normW = weight / totalWeight;
      const c = STRATEGY_RGB[type];
      r += c.r * normW; 
      g += c.g * normW; 
      b += c.b * normW;
    }
  };

  accumulate(wOversample, StrategyType.OVERSAMPLE);
  accumulate(wUndersample, StrategyType.UNDERSAMPLE);
  accumulate(wHybrid, StrategyType.HYBRID);
  accumulate(wBaseline, StrategyType.BASELINE);

  return { r, g, b };
};

export const getFoldStabilityRGB = (minority: number, folds: number): RGB => {
  const minPerFold = minority / Math.max(1, folds);
  
  if (minPerFold < 1) return { r: 20, g: 10, b: 10 }; // Void (Invalid)

  let r, g, b;
  if (minPerFold < 5) {
     // Deep Red to Bright Red
     r = 220; g = 40; b = 40;
  } else if (minPerFold < 30) {
     // Interpolate Red -> Yellow -> Green
     const t = (minPerFold - 5) / 25; 
     r = 239 + (16 - 239) * t; 
     g = 68 + (185 - 68) * t;
     b = 68 + (129 - 68) * t;
  } else {
     // Stable Green
     r = 16; g = 185; b = 129; 
  }
  
  return { r, g, b };
};

const analyzeFolds = (minority: number, folds: number, total: number): FoldAnalysis => {
  const effectiveFolds = Math.min(folds, total);
  const minPerFold = minority / effectiveFolds;
  const minInTraining = Math.floor(minority * ((effectiveFolds - 1) / effectiveFolds));
  
  const viabilityScore = Math.min(100, (minPerFold / 30) * 100); 
  const isLOOCV = effectiveFolds >= total || effectiveFolds >= 5000;
  const isStratificationImpossible = effectiveFolds > minority;

  let statusKey: keyof typeof FOLD_STATUS_CONFIG = 'STABLE';
  let validationRisk = '';
  let trainingImpact = '';

  if (isLOOCV) {
    statusKey = 'LOO';
    validationRisk = "Validation reduces to binary (0/1) loss. Probability calibration is impossible.";
    trainingImpact = `Maximizes training data (N=${total-1}), but computationally expensive.`;
  } else if (isStratificationImpossible) {
    statusKey = 'IMPOSSIBLE';
    validationRisk = `Folds (k=${effectiveFolds}) > Minority Samples (${minority}). Stratification is impossible.`;
    trainingImpact = "N/A";
  } else if (minPerFold < 1.5) {
    statusKey = 'LOPO';
    validationRisk = "Single positive sample per fold prevents variance estimation.";
    trainingImpact = `Maximized Training (~${minority-1} positives per round).`;
  } else if (minPerFold < 15) {
    statusKey = 'VARIANCE';
    validationRisk = `Low density (${minPerFold.toFixed(1)} samples/fold) results in noisy performance metrics.`;
    trainingImpact = `High training data retention, but reduced validation reliability.`;
  } else {
    statusKey = 'STABLE';
    validationRisk = "Sufficient density for stable metric estimation (e.g., AUC-ROC, F1).";
    trainingImpact = `Standard Stratified K-Fold Split.`;
  }
  
  const config = FOLD_STATUS_CONFIG[statusKey];
  const displayMinPerFold = minPerFold < 1 ? minPerFold.toFixed(2) : Math.floor(minPerFold);

  return { 
    minPerFold: Number(displayMinPerFold), 
    minInTraining, 
    label: config.label, 
    statusColor: config.color, 
    statusBg: config.bg, 
    viabilityScore: (isStratificationImpossible && !isLOOCV) ? 0 : viabilityScore, 
    validationRisk, 
    trainingImpact 
  };
};

// --- Main Recommendation Export ---

export const analyzeDataset = (params: DatasetParams): Recommendation => {
  const { features, minority, total, folds, sparsity, sparsityHomogeneity } = params;
  
  const weights = calculateWeights(features, minority, total, sparsity, sparsityHomogeneity);
  const { wOversample, wUndersample, wHybrid, wBaseline, stability, dominantOriginal } = weights;

  // Determine winner
  let strategy = StrategyType.BASELINE;
  let maxVal = wBaseline;
  if (wOversample > maxVal) { maxVal = wOversample; strategy = StrategyType.OVERSAMPLE; }
  if (wHybrid > maxVal) { maxVal = wHybrid; strategy = StrategyType.HYBRID; }
  if (wUndersample > maxVal) { maxVal = wUndersample; strategy = StrategyType.UNDERSAMPLE; }

  const foldAnalysis = analyzeFolds(minority, folds, total);
  const threshold = getMinorityThreshold(features);
  const ratio = total / Math.max(1, minority);
  
  // Generate Text Content
  let result: Recommendation = {
    strategy,
    title: strategy,
    description: '',
    rationale: '',
    foldTarget: '',
    samplingMix: '',
    color: COLORS[strategy],
    foldAnalysis
  };

  const transitionNote = (minority > threshold * 0.8 && minority < threshold * 1.2) 
    ? " You are in a complex transition zone. " 
    : "";

  const wasForcedToBaseline = strategy === StrategyType.BASELINE && (dominantOriginal === StrategyType.OVERSAMPLE || dominantOriginal === StrategyType.HYBRID);
  const useUndersampling = strategy === StrategyType.UNDERSAMPLE;

  if (wasForcedToBaseline) {
     // Heuristic: If sparsity is high but concentrated (skewed), features can be handled specifically.
     // If sparsity is high and uniform, the distance metrics are just noise.
     if (sparsity > 0.5 && sparsityHomogeneity < 0.3) {
        result.title = `Specialized ${dominantOriginal}`;
        result.description = "Structured Sparsity Detected.";
        result.rationale = `High sparsity (${Math.round(sparsity*100)}%) but concentrated. Standard interpolation (SMOTE) is unreliable. Strategy: Process features separately—interpolate dense columns, impute sparse ones.`;
        result.sparsityWarning = "Recommendation: Utilize SMOTE-NC or feature-specific handling.";
        result.color = COLORS[dominantOriginal || StrategyType.HYBRID]; 
     } else {
        result.title = "No Resampling / Class Weights";
        result.description = "Uniform Sparsity Risks Interpolation.";
        result.rationale = `Normally ${dominantOriginal} is best, but ${Math.round(sparsity*100)}% uniform sparsity (Stability: ${stability.toFixed(2)}) renders synthetic neighborhood generation unreliable. Use Class Weights.`;
        result.sparsityWarning = "Critical Sparsity: Euclidean distance metrics are unstable.";
     }
  } 
  else if (features <= THRESHOLDS.DIM_LOW) {
    if (minority < threshold) {
      result.title = "Oversampling or Hybrid";
      result.description = "Small Dataset, Low Dimensionality.";
      result.rationale = `High scarcity relative to feature space (p=${features}).${transitionNote} Avoid data reduction. Augment minority class via synthetic generation (e.g., SMOTE).`;
    } else {
      result.title = useUndersampling ? "Undersampling (Efficiency Priority)" : "No Resampling / Class Weights";
      result.description = useUndersampling ? (ratio > THRESHOLDS.EFFICIENCY_RATIO ? "Extreme Class Imbalance." : "Large Scale Dataset.") : "Sufficient Signal Strength.";
      result.rationale = useUndersampling
        ? `Efficiency required. ${ratio > THRESHOLDS.EFFICIENCY_RATIO ? `Class imbalance (1:${ratio.toFixed(0)}) is extreme.` : `Dataset magnitude justifies downsampling for computational feasibility.`}`
        : `Signal-to-noise ratio likely sufficient.${transitionNote} Utilize Class Weights or Cost-Sensitive Learning.`;
    }
  } else if (features <= THRESHOLDS.DIM_HIGH) {
    if (minority < threshold) {
      result.title = "Hybrid Strategy (Over + Under)";
      result.description = "High Dimensionality Relative to Minority Count.";
      result.rationale = `Need ~${Math.round(threshold)} samples to trust distribution.${transitionNote} Pure oversampling may amplify noise. Recommended: Hybrid approach (e.g., SMOTE + Edited Nearest Neighbors).`;
    } else {
      result.title = useUndersampling ? "Undersampling (Efficiency Priority)" : "No Resampling / Hybrid";
      result.description = useUndersampling ? "Moderate Sample Regime, High Efficiency." : "Moderate Sample Regime.";
      result.rationale = useUndersampling
        ? `Undersampling optimal for speed and 1:${ratio.toFixed(0)} ratio.`
        : `Prioritize Class Weights. If Recall is insufficient, introduce mild oversampling.`;
    }
  } else {
    // High Dimension
    if (minority < threshold) {
      result.title = "Hybrid or Algorithmic Approaches";
      result.description = "High-Dimensional, Sparse Regime.";
      result.rationale = `High dimensionality (p=${features}) induces sparsity (Curse of Dimensionality).${transitionNote} Combine generation with aggressive cleaning (Hybrid) or utilize Anomaly Detection models.`;
    } else {
      result.title = "Undersampling Strategy";
      result.description = "High-Dimensional, Large Scale Data.";
      result.rationale = `Undersampling reduces computational load and noise without disrupting the manifold structure in high dimensions.`;
    }
  }
  
  if (!result.sparsityWarning && sparsity > THRESHOLDS.SPARSITY_CRITICAL) {
     result.sparsityWarning = sparsityHomogeneity < 0.4 
       ? "Structured Sparsity: Use Nominal/Continuous variants (e.g., SMOTE-NC)."
       : "Caution: High sparsity reduces distance metric reliability.";
  }

  if (foldAnalysis.label.includes("Leave-One-Out")) {
      result.foldTarget = "Leave-One-Out (LOOCV)";
      result.samplingMix = "N/A (All data utilized).";
  } else if (folds > minority) {
    result.foldTarget = "INVALID CONFIGURATION";
    result.samplingMix = `Cannot stratify ${folds} folds with ${minority} samples.`;
  } else {
    if (minority < 200) {
      result.foldTarget = `Target >15 samples per fold (Current: ${foldAnalysis.minPerFold}).`;
      result.samplingMix = "Primary: Oversampling. Maintain synthetic ratio ≤ 3:1.";
    } else if (minority < 500) {
      result.foldTarget = `Target >30 samples per fold (Current: ${foldAnalysis.minPerFold}).`;
      result.samplingMix = "Baseline: None. If unstable, introduce moderate oversampling.";
    } else {
      result.foldTarget = "Sufficient Minority Samples.";
      result.samplingMix = "Undersampling or Ensemble Methods.";
    }
  }

  return result;
};