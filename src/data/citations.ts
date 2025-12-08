import { Citation } from '../types';

export const CITATIONS: Record<string, Citation> = {
    blagus2013: {
        id: 'blagus2013',
        authors: 'Blagus, R., & Lusa, L.',
        year: 2013,
        title: 'SMOTE for high-dimensional class-imbalanced data',
        journal: 'BMC Bioinformatics, 14(1), 106',
        relevance: 'SMOTE failure in high-dimensional spaces'
    },
    chawla2002: {
        id: 'chawla2002',
        authors: 'Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P.',
        year: 2002,
        title: 'SMOTE: Synthetic Minority Over-sampling Technique',
        journal: 'Journal of Artificial Intelligence Research, 16, 321–357',
        relevance: 'Foundational SMOTE paper'
    },
    drummond2003: {
        id: 'drummond2003',
        authors: 'Drummond, C., & Holte, R. C.',
        year: 2003,
        title: 'C4.5, Class Imbalance and Cost Sensitivity: Why Under-Sampling beats Over-Sampling',
        journal: 'Proceedings of the 20th International Conference on Machine Learning (ICML)',
        relevance: 'Undersampling efficiency for large datasets'
    },
    dalpozzolo2015: {
        id: 'dalpozzolo2015',
        authors: 'Dal Pozzolo, A., Caelen, O., Johnson, R. A., & Bontempi, G.',
        year: 2015,
        title: 'Calibrating Probability with Undersampling for Unbalanced Classification',
        journal: 'IEEE Symposium Series on Computational Intelligence, 159-166',
        relevance: 'Resampling distorts probability estimates; calibration required'
    },
    vanhulse2007: {
        id: 'vanhulse2007',
        authors: 'Van Hulse, J., Khoshgoftaar, T. M., & Napolitano, A.',
        year: 2007,
        title: 'Experimental perspectives on learning from imbalanced data',
        journal: 'Proceedings of the 24th International Conference on Machine Learning, 935–942',
        relevance: 'Benchmark for large-scale data resampling'
    },
    zhao2025: {
        id: 'zhao2025',
        authors: 'Zhao, S., et al.',
        year: 2025,
        title: 'A Survey on Small Sample Imbalance Problem: Metrics, Feature Analysis, and Solutions',
        journal: 'arXiv preprint arXiv:2504.14800',
        relevance: 'EISM/Small Sample definitions and hybrid ensemble recommendations'
    },
    yang2024: {
        id: 'yang2024',
        authors: 'Yang, Y., Khorshidi, H. A., & Aickelin, U.',
        year: 2024,
        title: 'A review on over-sampling techniques in classification of multi-class imbalanced datasets: insights for medical problems',
        journal: 'Frontiers in Digital Health, 6, 1430245',
        relevance: 'Comprehensive review of multi-class oversampling methods'
    },
    fujiwara2020: {
        id: 'fujiwara2020',
        authors: 'Fujiwara, K., Huang, Y., Hori, K., Nishioji, K., & Kobayashi, M.',
        year: 2020,
        title: 'Over- and Under-sampling Approach for Extremely Imbalanced and Small Minority Data Problem in Health Record Analysis',
        journal: 'Frontiers in Public Health, 8, 178',
        relevance: 'HUSDOS-Boost algorithm for EISM data; stratified bagging recommendation'
    },
    batista2004: {
        id: 'batista2004',
        authors: 'Batista, G. E., Prati, R. C., & Monard, M. C.',
        year: 2004,
        title: 'A study of the behavior of several methods for balancing machine learning training data',
        journal: 'ACM SIGKDD Explorations Newsletter, 6(1), 20–29',
        relevance: 'Foundational study on SMOTE-Tomek and SMOTE-ENN hybrid methods'
    },
    barua2014: {
        id: 'barua2014',
        authors: 'Barua, S., Islam, M. M., Yao, X., & Murase, K.',
        year: 2014,
        title: 'MWMOTE—Majority Weighted Minority Oversampling Technique for Imbalanced Data Set Learning',
        journal: 'IEEE Transactions on Knowledge and Data Engineering, 26(2), 405–425',
        relevance: 'Weighted oversampling addressing hard-to-learn minority instances'
    },
    he2009: {
        id: 'he2009',
        authors: 'He, H., & Garcia, E. A.',
        year: 2009,
        title: 'Learning from Imbalanced Data',
        journal: 'IEEE Transactions on Knowledge and Data Engineering, 21(9), 1263–1284',
        relevance: 'Comprehensive survey on imbalanced learning foundations'
    },
    garcia2020: {
        id: 'garcia2020',
        authors: 'García, V., Sánchez, J. S., Marqués, A. I., Florencia, R., & Rivera, G.',
        year: 2020,
        title: 'Understanding the apparent superiority of over-sampling through an analysis of local information for class-imbalanced data',
        journal: 'Expert Systems with Applications, 158, 113026',
        relevance: 'Evidence that oversampling increases safe minority samples more than undersampling'
    },
    resampleLab2025: {
        id: 'resampleLab2025',
        authors: 'mr-september',
        year: 2025,
        title: 'Resample Lab: Advanced Data Resampling Heuristics',
        journal: 'GitHub repository (https://github.com/mr-september/Resample-Lab)',
        relevance: 'The Resample Lab tool itself.'
    }
};
