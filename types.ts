export enum StrategyType {
  OVERSAMPLE = 'Oversample',
  UNDERSAMPLE = 'Undersample',
  HYBRID = 'Hybrid',
  BASELINE = 'No Resampling / Class Weights',
}

export interface DatasetParams {
  features: number;
  minority: number;
  total: number;
  folds: number;
  sparsity: number; // 0.0 to 0.99
  sparsityHomogeneity: number; // 0.0 (Skewed/Columns) to 1.0 (Uniform/Text)
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface FoldAnalysis {
  minPerFold: number; // Minority samples in Validation
  minInTraining: number; // Minority samples in Training
  label: string;
  statusColor: string;
  statusBg: string;
  viabilityScore: number; // 0-100 scale for progress bar
  validationRisk: string; // Text explaining variance risk
  trainingImpact: string; // Text explaining data availability
}

export interface Recommendation {
  strategy: StrategyType;
  title: string;
  description: string;
  rationale: string;
  foldTarget: string;
  samplingMix: string;
  color: string;
  foldAnalysis: FoldAnalysis;
  sparsityWarning?: string;
}

export interface AxisConfig {
  key: keyof DatasetParams;
  min: number;
  max: number;
  label: string;
  scale?: 'log' | 'linear';
}