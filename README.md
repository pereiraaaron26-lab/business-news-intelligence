# Antigravity Business News Intelligence Platform

> **Automated 5-Dimensional Business & Macro Strategic Intelligence Engine**  
> Ingests verified business news from Tier-1 Indian and global sources, synthesizes developments through a dual-phase analytical framework (~400-word narrative + 5-D strategic lens), and deploys structured intelligence to Google Sheets, Notion, and a public GitHub Pages web portal.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Portal-0ea5e9?style=flat&logo=github)](https://github.com)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Database%20Ledger-10b981?style=flat&logo=googlesheets)](https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec)
[![Notion](https://img.shields.io/badge/Notion-Executive%20Cards-6366f1?style=flat&logo=notion)](https://app.notion.com/p/Daily-Business-Intelligence-412c9631ecc080d7966ecaeb72d3285f)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=flat)](LICENSE)

---

## 🏛️ System Architecture

```
[ Tier-1 Sources: Mint, ET, HBR, Moneycontrol Pro, TechCrunch ]
                               │
                               ▼
        [ scripts/fetch_business_news.ps1 ]
              (RSS + XML Sitemap Parser)
                               │
                               ▼
        [ 2-Phase Analytical Synthesis ]
    Phase A: Comprehensive News Context (~400 words)
    Phase B: 5-Dimensional Strategic Lens (Delta, Mechanism, Impact, Lesson, Lateral)
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
[ Google Sheets ]      [ Notion Database ]   [ GitHub Pages Web Portal ]
Tab: Feed_Ledger       Executive Cards       Responsive Web Application
Apps Script Webhook    Formatted 5-D Blocks  (Cards, 5-D Matrix & Ledger)
```

---

## 🔍 The 2-Phase Analytical Framework

Every story ingested and published by the platform adheres to this rigorous standard:

### Phase A: Comprehensive News Context (~400 words)
* **Background & Industry Context**: Historical precedent, market backdrop, competitive climate.
* **Key Entities & Financials**: Specific company actions, named executives, exact financials, volumes, and dates.
* **Commercial Nuances**: Incumbent vs. challenger tactics, supply-chain bottlenecks, trade channel reactions.

### Phase B: The 5-Dimensional Strategic Analytical Lens
1. **The Delta (What Changed)**: Quantitative shift, baseline vs. current state, deal multiples.
2. **The Mechanism (How It Changed)**: Underlying regulatory, algorithmic, pricing architecture, or psychological driver.
3. **Strategic Impact**: Margins, industry consolidation, distributor ROIC (`Net Margin % x Inventory Turns`), competitive moats.
4. **Core Lesson**: Transferable strategic principle or mental model.
5. **Cross-Industry Lateral Transfer**: 2 specific, non-obvious operational applications in unrelated industries.

---

## 🌐 Web Application Features

The GitHub Pages web portal provides an executive terminal interface:

* **Executive Synthesis Hero**: Highlights the top 3 macro cross-currents shaping the briefing cycle.
* **Multi-View Modes**:
  * 📰 **Briefing Cards**: Executive view with dedicated **Complete Article Reference** sections, expandable Phase A narratives, and distinct 5-D dimension cards.
  * 📋 **Notion Board (Kanban)**: Columns grouped by strategic vertical (Marketing, Finance, Tech, Strategy) with quick source links and 5-D snippets.
  * 📐 **5-Dimensional Matrix**: Side-by-side comparative table analyzing Delta, Mechanism, Impact, Lesson, and Lateral Transfer across stories.
  * 📑 **Feed Ledger (Google Sheets Schema)**: High-density database grid matching the tabular ledger.
  * 🌐 **Notion Workspace Hub**: Live integration overview and interactive link to Notion Database `412c9631-ecc0-809c-968f-d9e6ebcaac04`.
* **Complete Article Reference**: Every story card and reader view includes a dedicated section featuring verified publisher metadata, publication date, direct "Read Complete Article ↗" button, and "Open in Notion ↗" link.
* **Interactive Filtering & Search**:
  * Multi-vertical selector (`Marketing & GTM`, `Finance & M&A`, `Technology`, `Corporate Strategy`).
  * Instant signal pills (`#PRICING ARCHITECTURE`, `#GTM / CHANNEL`, `#CAPITAL ALLOCATION`, etc.).
  * Real-time fuzzy search across headlines, mechanisms, and body text.
* **Focus Mode (Executive Drawer)**: Distraction-free slide-out reader with single-click Markdown export.
* **Live Integration Diagnostics**: Real-time visibility into connected Google Sheets, Notion DB, and local markdown files.
* **Dark / Light Mode**: Clean slate terminal dark mode and Financial Times-style crisp light mode.

---

## 🚀 Deployment to GitHub Pages

The repository is pre-configured for zero-friction GitHub Pages deployment:

### Method 1: Deploy Directly from Branch (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete business intelligence platform and web application"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   * Go to **Settings** &rarr; **Pages**.
   * Under **Build and deployment** &rarr; **Source**, select **Deploy from a branch**.
   * Branch: `main` / Folder: `/ (root)` or `/docs`.
   * Click **Save**. Your website will be live in ~60 seconds!

### Method 2: Automated CI/CD (GitHub Actions)
The repository includes `.github/workflows/deploy.yml`. When **Source** in GitHub Pages is set to **GitHub Actions**, every commit to `main` automatically builds and publishes the site.

---

## ⚙️ Running the Daily Automation

Run the 1-click master orchestrator to fetch live news, generate briefings, push to Google Sheets and Notion, and compile web data:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\scripts\run_daily_intelligence.ps1
```

### Automation Steps Executed:
1. `scripts/fetch_business_news.ps1`: Ingests 180+ daily feeds from 17 Tier-1 sources.
2. `scripts/sync_to_sheets.ps1`: Syncs structured ledger records to Google Sheets `Feed_Ledger`.
3. `scripts/sync_to_notion.ps1`: Publishes executive cards to Notion Database `412c9631-ecc0-809c-968f-d9e6ebcaac04`.
4. `scripts/build_web_data.js`: Parses local markdown briefings into `data/latest.json` and syncs web files.

---

## 📊 Live Integrations & Endpoints

| Platform | Target ID / URL | Role |
| :--- | :--- | :--- |
| **Google Sheets** | Tab: `Feed_Ledger`<br>Webhook: `https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec` | Central database ledger for raw metrics and 5-D analytical columns. |
| **Notion Database** | Database ID: `412c9631-ecc0-809c-968f-d9e6ebcaac04`<br>Page: [Daily Business Intelligence](https://app.notion.com/p/Daily-Business-Intelligence-412c9631ecc080d7966ecaeb72d3285f) | Executive reading dashboard with formatted cards and blocks. |
| **Local Markdown** | `workspace/briefings/briefing_YYYY-MM-DD.md` | Primary source-of-truth markdown briefings. |
| **Web Portal** | Root (`index.html`) & `docs/` | High-performance static web application for GitHub Pages. |

---

## 📂 Repository File Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions Pages deployment
├── data/
│   ├── latest.json                 # Structured daily briefing dataset
│   ├── briefing_data.js            # Offline-first fallback data bundle
│   └── archive.json                # Archive index
├── docs/                           # Mirrored web assets for /docs Pages hosting
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── data/
├── scripts/
│   ├── fetch_business_news.ps1     # 180+ feed extractor
│   ├── run_daily_intelligence.ps1  # Master 1-click orchestrator
│   ├── sync_to_sheets.ps1          # Google Sheets pusher
│   ├── sync_to_notion.ps1          # Notion API pusher
│   ├── sync_briefing_to_destinations.ps1 # Full narrative + 5-D sync
│   └── build_web_data.js           # Markdown-to-JSON briefing compiler
├── workspace/
│   ├── briefings/
│   │   └── briefing_2026-11-08.md  # Today's executive briefing
│   ├── daily_inputs/               # Vetted feed cache
│   └── iteration_log.md            # Calibration and signal weights
├── index.html                      # Root web application entry point
├── app.js                          # Reactive web client logic
├── styles.css                      # Custom typography & glassmorphism
└── chat_handoff_context.md         # Full project context & credentials
```
