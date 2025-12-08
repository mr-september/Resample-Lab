<div align="center">

# 🧪 Resample Lab

Resample Lab provides general guidelines on how to treat imbalanced datasets through a simple interactive interface. Get research-backed recommendations for resampling strategies based on your dataset characteristics.

[![GitHub release](https://img.shields.io/github/release/mr-september/Resample-Lab.svg)](https://github.com/mr-september/Resample-Lab/releases)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen.svg)](https://mr-september.github.io/Resample-Lab/)

🔬 Research-Backed | 📊 Interactive | 🎯 Actionable Recommendations

### [**🌐 Try it Live**](https://mr-september.github.io/Resample-Lab/)

</div>

---

## 💖 Support FOSS Projects

**My work developing, contributing to, and maintaining open-source software is made possible solely by your donations. Your support is vital to the ongoing development of FOSS solutions.**

<p align="center">
<a href="https://www.paypal.com/donate/?hosted_button_id=WFXL2T42BBCRN">
  <img src="https://raw.githubusercontent.com/mr-september/central_automation_hub/refs/heads/main/bluePayPalbutton.svg" alt="PayPal" height="36">
</a>
<a href="https://ko-fi.com/Q5Q11I49GI">
  <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Ko-fi" height="36">
</a>
<a href="https://liberapay.com/mr-september/donate">
  <img src="https://liberapay.com/assets/widgets/donate.svg" alt="Liberapay" height="36">
</a>
<a href="https://nowpayments.io/donation?api_key=5b5fabd5-2c33-4525-99a3-bf27f587780c" target="_blank" rel="noreferrer noopener">
  <img src="https://nowpayments.io/images/embeds/donation-button-black.svg" alt="Crypto donation button by NOWPayments" height="36">
</a>
</p>

### 🌟 Other Ways to Help

⭐ **Star the repository** to show your support  
🐦 **Share** to help others discover Resample Lab  
📝 **Write reviews** and share your experience  
🎥 **Create content** - tutorials, guides, or showcase videos

</div>

---

## 📖 Table of Contents

- [🎯 Features](#-features)
- [📚 Citation Sources](#-citation-sources)
- [⚠️ Critical Regime Thresholds](#️-critical-regime-thresholds)
- [🛠️ Getting Started](#️-getting-started)
- [📄 License](#-license)

---

## 🎯 Features

- **📊 Interactive Interface** - Simple, intuitive web-based tool for dataset analysis
- **🔬 Research-Backed Recommendations** - All suggestions grounded in peer-reviewed literature
- **⚠️ Regime Detection** - Automatic identification of critical dataset characteristics
- **📈 Strategy Comparison** - Visual comparison of different resampling approaches
- **🎓 Educational** - Learn the reasoning behind each recommendation

---

## 📚 Citation Sources

The recommendations in Resample Lab are based on peer-reviewed research. Below is a summary of the key sources informing the heuristics.

| Citation | Year | Title | Venue | Key Contribution |
|----------|------|-------|-------|------------------|
| Chawla et al. | 2002 | SMOTE: Synthetic Minority Over-sampling Technique | JAIR, 16, 321–357 | Foundational SMOTE algorithm |
| Drummond & Holte | 2003 | C4.5, Class Imbalance and Cost Sensitivity: Why Under-Sampling beats Over-Sampling | ICML 2003 | Undersampling efficiency for large datasets |
| Batista et al. | 2004 | A study of the behavior of several methods for balancing machine learning training data | ACM SIGKDD Explorations, 6(1), 20–29 | SMOTE-Tomek and SMOTE-ENN hybrid methods |
| Van Hulse et al. | 2007 | Experimental perspectives on learning from imbalanced data | ICML 2007, 935–942 | Large-scale resampling benchmarks |
| He & Garcia | 2009 | Learning from Imbalanced Data | IEEE TKDE, 21(9), 1263–1284 | Comprehensive imbalanced learning survey |
| Blagus & Lusa | 2013 | SMOTE for high-dimensional class-imbalanced data | BMC Bioinformatics, 14(1), 106 | SMOTE degradation in high dimensions |
| Barua et al. | 2014 | MWMOTE—Majority Weighted Minority Oversampling | IEEE TKDE, 26(2), 405–425 | Weighted oversampling for hard-to-learn instances |
| Elhassan & Aljurf | 2016 | Class imbalance problem: A review of recent techniques | J. Applied Sciences, 16(8), 314–328 | Comprehensive resampling technique review |
| García et al. | 2020 | Understanding the apparent superiority of over-sampling | Expert Systems with Applications, 158, 113026 | Oversampling increases safe minority samples |
| Hasanin et al. | 2020 | Over- and Under-sampling Approach for EISM Data | Frontiers in Public Health, 8, 178 | HUSDOS-Boost; stratified bagging for EISM |
| Yang et al. | 2024 | A review on over-sampling techniques for multi-class imbalanced datasets | Frontiers in Digital Health, 6, 1430245 | Multi-class oversampling review |
| Zhao et al. | 2025 | A Survey on Small Sample Imbalance Problem | arXiv:2504.14800 | EISM definitions; hybrid ensemble recommendations |

---

## ⚠️ Critical Regime Thresholds

Based on the literature, Resample Lab identifies three critical regimes:

| Regime | Trigger Condition | Rationale | Primary Sources |
|--------|-------------------|-----------|-----------------|
| **🔴 Tiny Minority / EISM** | Minority < 50 samples OR EPV < 10 | Synthetic methods may generate unreliable samples; overfitting risk high | Zhao et al. 2025, Hasanin et al. 2020 |
| **🟠 High-Dimensional** | Features > 100 | SMOTE fails in high-dimensional spaces due to sparse neighborhoods | Blagus & Lusa 2013 |
| **🟡 Large-Scale** | Total samples > 50,000 | Undersampling preferred for computational efficiency | Drummond & Holte 2003, Van Hulse et al. 2007 |

---

## 🛠️ Getting Started

### Quick Start

Visit the [**Live Demo**](https://mr-september.github.io/Resample-Lab/) to start using Resample Lab immediately.

### Local Development

```bash
# Clone the repository
git clone https://github.com/mr-september/Resample-Lab.git
cd Resample-Lab

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Star History

<div align="center">
  <a href="https://www.star-history.com/#mr-september/Resample-Lab&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mr-september/Resample-Lab&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=mr-september/Resample-Lab&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=mr-september/Resample-Lab&type=Date" />
  </picture>
  </a>
</div>
