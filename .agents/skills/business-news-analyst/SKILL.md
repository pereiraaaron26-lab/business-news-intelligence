---
name: business-news-analyst
description: Synthesizes daily verified business intelligence briefings across Marketing (including Channel Economics & GTM), Finance (Macro/Micro, M&A & Capital Allocation), Technology Playbook, and Corporate Strategy using a 5-dimensional analytical lens.
---

# Business News Analyst

Synthesize verified daily developments across Marketing (including Pricing, Channel Economics, and Go-To-Market strategy), Finance (Macro, Micro, M&A, Corporate Capital Trends), Technology, and Corporate Strategy.

## Steps

### Step 1: Load Iteration Memory and Preferences
Read the last 5 entries in `workspace/iteration_log.md` before gathering news and apply all logged calibration rules (industry weights, depth adjustments, specific metric focuses).

### Step 2: Gather Vetted News from Credible Sources Only
Run `scripts/fetch_business_news.ps1` or use grounded web search across Tier-1 sources:
- **Marketing, Pricing, Channel Economics & GTM**: Harvard Business Review, Marketing Week, AdAge, Adweek, WARC, ET Retail, ET Brand Equity, Modern Retail.
- **Finance, M&A, Capital Markets & Policy**: RBI, Federal Reserve, PIB/Ministry of Finance, SEBI, SEC filings, Mint, Financial Times, Bloomberg, Moneycontrol / Moneycontrol Pro, CNBC, WSJ.
- **Tech & Implementation**: MIT Technology Review, IEEE Spectrum, Ars Technica, TechCrunch, Gartner, InfoQ, official engineering blogs.
- **Overall Business**: Reuters, Bloomberg, FT, Economic Times, Nikkei Asia, S&P Global.

### Step 3: Analyze Each Story (Comprehensive Summary + 5-Dimensional Lens)
Target **10 curated articles per daily briefing** (allocated as 3 Marketing & GTM, 3 Finance & M&A, 2 Technology, and 2 Corporate Strategy). For every selected story, provide:

#### Phase A: Comprehensive News Context & Narrative (~400 words)
A thorough, rigorous journalistic narrative detailing:
- **Background & Industry Context**: The macro environment, historical context, and market conditions preceding the event.
- **Key Entities & What Happened**: Specific company actions, executives named, exact dollar figures, deal sizes, volume numbers, and dates.
- **Commercial & Competitive Nuances**: Incumbent vs. challenger dynamics, supply chain considerations, and channel reactions.

#### Phase B: The 5-Dimensional Strategic Analytical Lens
1. **What Changed (The Delta)**: Baseline before vs. current state with concrete metrics, deal multiples, dates, and named entities.
2. **How It Changed (The Mechanism)**: The underlying regulatory, algorithmic, pricing, channel/supply-chain, or psychological driver behind the shift.
3. **Strategic Impact**: First-order and second-order effects on margins, industry consolidation, distributor/partner ROIC, competitive moats, or sector value chains.
4. **Core Lesson (What We Can Learn)**: The transferable strategic principle or mental model.
5. **Cross-Industry Application (Lateral Transfer)**: 2 specific, non-obvious operational ways a business in completely different fields can adopt this mechanic.

---

### Step 4: Cover All Four Required Business Segments

#### 1. Marketing, Branding, Pricing, and Channel Economics / GTM Deep Dive
- **1A. Campaigns, Branding & Consumer Research**: High-impact campaigns, positioning pivots, and empirical cohort spending shifts.
- **1B. Pricing Architecture Deep Dive**: Dynamic pricing, price-pack architecture (PPA), bundling/unbundling, tiering, and margin defense.
- **1C. Channel Economics & Go-To-Market (GTM) Plumbing**:
  - *Distribution Velocity*: Primary (factory-to-distributor billing), secondary (distributor-to-dealer/retailer), and tertiary (retail-to-consumer offtake).
  - *Trade & Unit Economics*: Gross-to-net margin waterfalls, distributor ROIC (`Net Margin % x Inventory Turns`), dealer credit days, and working capital cycle.
  - *Omnichannel Mix & Conflict*: Friction and SKU segmentation across General Trade (kirana/independent dealers), Modern Trade, Quick Commerce, and D2C.

#### 2. Finance, M&A, Capital Trends, and Macro/Micro Policy Implications
- **2A. Mergers, Acquisitions (M&A) & Industry Consolidation**:
  - *Deal Structure & Valuation*: Purchase price, EV/EBITDA or EV/Revenue multiples, cash vs. equity vs. earn-outs, and debt/bank financing.
  - *Strategic Rationale & Synergies*: Horizontal consolidation (pricing power), vertical integration (supply chain or channel control), carve-outs, or capability tuck-ins.
  - *Value-Chain & Antitrust Impact*: How the transaction reshapes bargaining power with suppliers/customers and regulatory remedies.
- **2B. Macro & Micro Policy Mechanics**: Central bank rate/liquidity actions (RBI/Fed), fiscal/tax/tariff moves, and micro-regulations mapped to sector-by-sector cost of capital and demand elasticity.
- **2C. Emerging Financial & Capital Allocation Trends (Operator Lens)**:
  - *Private Capital & Deal Flow*: Private equity roll-ups, VC valuation resets, secondary buyouts, and institutional rotation into Private Credit.
  - *Corporate Capital Allocation & Treasury*: Shifts between growth Capex, R&D, debt deleveraging, share buybacks; working-capital optimization (Cash Conversion Cycle).

#### 3. Technology Developments and Implementation Playbook
- New enterprise AI, automation, and infrastructure releases paired with an implementation blueprint (architecture, build vs. buy, FinOps/token budgets, governance, and security).

#### 4. Overall Business and Corporate Strategy
- Major corporate turnarounds, cross-border supply-chain realignments, governance shifts, and an Executive Synthesis connecting all four verticals into overarching themes.

---

### Step 5: Quality Verification and Iteration Check
1. Verify every story carries `[Source Name | Date | URL]`.
2. Confirm Channel Economics/GTM is explicitly analyzed in Section 1 and M&A/Capital Trends in Section 2.
3. Include an Executive Synthesis connecting the macro themes across all 4 verticals.
4. Conclude with a **Calibration & Iteration Check** asking for a 1–5 signal rating and adjustments to log into `workspace/iteration_log.md`.
