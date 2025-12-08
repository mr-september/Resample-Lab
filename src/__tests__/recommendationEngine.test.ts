import { describe, it, expect } from 'vitest';
import { analyzeDataset } from '../logic/recommendationEngine';
import { StrategyType } from '../types';

describe('recommendationEngine', () => {
    describe('analyzeDataset', () => {
        it('should return a valid Recommendation object', () => {
            const result = analyzeDataset({
                features: 50,
                minority: 150,
                total: 2000,
                folds: 5,
                sparsity: 0.0,
                sparsityHomogeneity: 0.5,
                requiresCalibratedProbabilities: false,
            });

            expect(result).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(Object.values(StrategyType)).toContain(result.strategy);
            expect(result.title).toBeDefined();
            expect(typeof result.title).toBe('string');
            expect(result.foldAnalysis).toBeDefined();
            expect(result.citations).toBeInstanceOf(Array);
        });

        it('should recommend undersampling for large-scale datasets', () => {
            const result = analyzeDataset({
                features: 50,
                minority: 5000,
                total: 100000,
                folds: 5,
                sparsity: 0.0,
                sparsityHomogeneity: 0.5,
                requiresCalibratedProbabilities: false,
            });

            // Large-scale datasets should lean towards undersampling for efficiency
            expect([StrategyType.UNDERSAMPLE, StrategyType.HYBRID]).toContain(result.strategy);
        });

        it('should detect high-dimensional regime', () => {
            const result = analyzeDataset({
                features: 500, // High-dimensional
                minority: 100,
                total: 1000,
                folds: 5,
                sparsity: 0.0,
                sparsityHomogeneity: 0.5,
                requiresCalibratedProbabilities: false,
            });

            // Should have a high-dimensional warning
            const hasHighDimWarning = result.regimeWarnings.some(
                (w) => w.type === 'high-dimensional'
            );
            expect(hasHighDimWarning).toBe(true);
        });

        it('should detect tiny minority regime', () => {
            const result = analyzeDataset({
                features: 50,
                minority: 30, // Very small minority
                total: 1000,
                folds: 5,
                sparsity: 0.0,
                sparsityHomogeneity: 0.5,
                requiresCalibratedProbabilities: false,
            });

            // Should have a tiny-minority warning
            const hasTinyMinorityWarning = result.regimeWarnings.some(
                (w) => w.type === 'tiny-minority'
            );
            expect(hasTinyMinorityWarning).toBe(true);
        });

        it('should include calibration note when requiresCalibratedProbabilities is true', () => {
            const result = analyzeDataset({
                features: 50,
                minority: 150,
                total: 2000,
                folds: 5,
                sparsity: 0.0,
                sparsityHomogeneity: 0.5,
                requiresCalibratedProbabilities: true,
            });

            expect(result.calibrationNote).toBeDefined();
            expect(typeof result.calibrationNote).toBe('string');
        });
    });
});
