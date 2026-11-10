# Antigravity Business News Analyst: Project & Chat Handoff Document

**Generated**: November 8, 2026  
**Active Project Workspace**: `A:\News Agent Skill - AGY`  
**Backup / Desktop Workspace**: `C:\Users\Aaron\OneDrive\Desktop\agyyy`  
**Target Next Phase**: Building the GitHub Website / Public Web Interface  

---

## 1. Executive Summary & Project Goal
The **Business News Analyst** is an automated intelligence pipeline built on Antigravity. It ingests verified daily business news from Tier-1 Indian and global sources, synthesizes the developments through an in-depth 2-phase framework (a ~400-word comprehensive context narrative followed by the 5-Dimensional Strategic Analytical Lens), and publishes the structured output into a unified multi-platform stack:
1. **Google Sheets**: Central tabular database / ledger for records, metrics, and API ingestion.
2. **Notion Database**: Clean, magazine-style executive reading environment with formatted cards.
3. **GitHub Website (Next Step)**: A public/portfolio web app hosted on GitHub Pages or modern static host.

---

## 2. Integrated Architecture

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
         ┌─────────────────────┴─────────────────────┐
         ▼                                           ▼
[ Google Sheets Database ]                  [ Notion Database UI ]
Tab: Feed_Ledger                            Database: Daily Business Intelligence
Webhook: Apps Script doPost                 Cards: Narrative + 5-D Breakdown Blocks
         │                                           │
         └─────────────────────┬─────────────────────┘
                               ▼
                    [ Future GitHub Website ]
                 (Astro / Next.js / GitHub Pages)
```

---

## 3. Data Schema & Core Credentials

### A. Google Sheets Database
* **Spreadsheet Tab Name**: `Feed_Ledger`
* **Apps Script Webhook URL**:  
  `https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec`
* **Column Mapping**:
  * **Col A**: `Date` (YYYY-MM-DD)
  * **Col B**: `Vertical` (`Marketing_GTM`, `Finance_MA`, `Tech`, `Business`)
  * **Col C**: `Headline`
  * **Col D**: `Source` (Outlet name)
  * **Col E**: `URL` (Direct link)
  * **Col F**: `Signals` (e.g. `[GTM / CHANNEL]`, `[M&A / DEAL]`, `[CAPITAL ALLOCATION]`)
  * **Col G**: `Delta` (What Changed)
  * **Col H**: `Mechanism` (How It Changed)
  * **Col I**: `Strategic_Impact` (Margins, ROIC, Channel conflict)
  * **Col J**: `Core_Lesson` (Transferable mental model)
  * **Col K**: `Lateral_Transfer` (Cross-industry applications)
  * **Col L**: `Status` (`Pushed_to_Notion` / `New`)

### B. Notion Database
* **Notion Page URL**: [Daily Business Intelligence](https://app.notion.com/p/Daily-Business-Intelligence-412c9631ecc080d7966ecaeb72d3285f)
* **Notion Database ID**: `412c9631-ecc0-809c-968f-d9e6ebcaac04`
* **Notion Internal API Token**: `[REDACTED - Set in environment as NOTION_TOKEN]`
* **Database Properties**:
  * `Headline` (*Title* property)
  * `Vertical` (*Select*: `Marketing_GTM`, `Finance_MA`, `Tech`, `Business`)
  * `Source` (*Rich text*)
  * `URL` (*URL*)
  * `Date` (*Date*)
  * `Signals` (*Multi-select*)
* **Page Body Layout**:
  * Heading 1: `Comprehensive News Context & Narrative (~400 words)`
  * Paragraphs of contextual background
  * Divider
  * Heading 1: `5-Dimensional Strategic Breakdown`
  * Headings 3 & paragraphs for Delta, Mechanism, Impact, Core Lesson, and Lateral Transfer.

---

## 4. The 2-Phase Analytical Framework

Every story analyzed by the agent adheres to this standard:

### Phase A: Comprehensive News Context (~400 words)
1. **Background & Industry Context**: Historical precedent, market backdrop, competitive climate.
2. **Key Entities & What Happened**: Specific company actions, executives, exact financials, volumes, dates.
3. **Commercial & Competitive Nuances**: Incumbent vs. challenger tactics, supply-chain bottlenecks, trade channel reactions.

### Phase B: The 5-Dimensional Strategic Lens
1. **The Delta (What Changed)**: Quantitative metrics, baseline vs. current state, deal multiples.
2. **The Mechanism (How It Changed)**: Underlying regulatory, algorithmic, pricing architecture, or psychological driver.
3. **Strategic Impact**: Margins, industry consolidation, distributor ROIC (`Net Margin % x Inventory Turns`), competitive moats.
4. **Core Lesson**: Transferable strategic principle or mental model.
5. **Lateral Transfer**: 2 specific, non-obvious operational applications in completely unrelated industries.

---

## 5. File Inventory & Script Tools

| File Path | Description |
| :--- | :--- |
| [`.agents/skills/business-news-analyst/SKILL.md`](file:///A:/News%20Agent%20Skill%20-%20AGY/.agents/skills/business-news-analyst/SKILL.md) | Official Antigravity skill specification and guidelines. |
| [`scripts/fetch_business_news.ps1`](file:///A:/News%20Agent%20Skill%20-%20AGY/scripts/fetch_business_news.ps1) | Fetches 180+ daily feeds from 17 Tier-1 outlets and Moneycontrol sitemap. |
| [`scripts/sync_to_sheets.ps1`](file:///A:/News%20Agent%20Skill%20-%20AGY/scripts/sync_to_sheets.ps1) | Fast utility to push batches of feed items to Google Sheets. |
| [`scripts/sync_to_notion.ps1`](file:///A:/News%20Agent%20Skill%20-%20AGY/scripts/sync_to_notion.ps1) | Pushes feed cards directly to Notion via Notion API. |
| [`scripts/sync_briefing_to_destinations.ps1`](file:///A:/News%20Agent%20Skill%20-%20AGY/scripts/sync_briefing_to_destinations.ps1) | Pushes the full 400-word narrative + 5-D analysis to both Sheets and Notion. |
| [`scripts/run_daily_intelligence.ps1`](file:///A:/News%20Agent%20Skill%20-%20AGY/scripts/run_daily_intelligence.ps1) | 1-Click Master orchestrator running fetch $\rightarrow$ Sheets $\rightarrow$ Notion $\rightarrow$ Web App. |
| [`scripts/build_web_data.js`](file:///A:/News%20Agent%20Skill%20-%20AGY/scripts/build_web_data.js) | Compiles local markdown briefings into structured JSON & JS payloads for GitHub Pages. |
| [`index.html`](file:///A:/News%20Agent%20Skill%20-%20AGY/index.html) | Root executive web portal (Briefing Cards, 5-D Matrix & Ledger views). |
| [`app.js`](file:///A:/News%20Agent%20Skill%20-%20AGY/app.js) | Reactive front-end application with search, filters, modal reader, and exports. |
| [`styles.css`](file:///A:/News%20Agent%20Skill%20-%20AGY/styles.css) | Custom styling, glassmorphism, typography, and dark/light mode rules. |
| [`.github/workflows/deploy.yml`](file:///A:/News%20Agent%20Skill%20-%20AGY/.github/workflows/deploy.yml) | GitHub Actions workflow for zero-touch GitHub Pages automated deployment. |
| [`workspace/briefings/briefing_2026-11-08.md`](file:///A:/News%20Agent%20Skill%20-%20AGY/workspace/briefings/briefing_2026-11-08.md) | Today's complete executive briefing with 400-word context and 5-D analysis. |
| [`workspace/iteration_log.md`](file:///A:/News%20Agent%20Skill%20-%20AGY/workspace/iteration_log.md) | Persistent memory log storing calibration rules and ratings. |

---

## 6. GitHub Pages Web Application (Completed)

The web application for the Business News Intelligence platform is fully built and deployed in the workspace:

### Architecture & Capabilities:
- **Zero-Baggage GitHub Pages Compatibility**: Ready for immediate hosting via GitHub Pages from `/` (root) or `/docs/`, or via GitHub Actions.
- **Offline / Local File Protocol Support**: Uses `data/latest.json` with fallback to `data/briefing_data.js`, so the webpage works seamlessly whether opened directly via `file:///...` or through a local HTTP web server.
- **Multi-View Modes**:
  1. **Briefing Feed View**: Executive cards featuring collapsible Phase A narratives (~400 words) and distinct Phase B 5-D dimension cards.
  2. **5-Dimensional Strategic Matrix**: Cross-story comparison grid mapping Delta, Mechanism, Impact, Lesson, and Lateral Transfer.
  3. **Feed Ledger Table**: Tabular view matching the Google Sheets `Feed_Ledger` schema.
- **Dynamic Search & Filtering**:
  - Filter by Vertical (`Marketing_GTM`, `Finance_MA`, `Tech`, `Business`).
  - Filter by Signal tag (`#PRICING ARCHITECTURE`, `#DISTRIBUTOR ROIC`, `#CAPITAL ALLOCATION`, etc.).
  - Instant real-time fuzzy search across headlines, mechanisms, takeaways, and narratives.
- **Executive Focus Reader Mode**: Slide-out drawer with high-density editorial typography and single-click Markdown export.
- **Automated Pipeline Integration**: Integrated into Step 4 of `scripts/run_daily_intelligence.ps1` via `scripts/build_web_data.js`.
