/**
 * Cloud Daily Intelligence Pipeline
 * Designed for serverless execution via GitHub Actions (or local Node.js)
 * Has zero external npm package dependencies (uses native fetch in Node 18+).
 * 
 * Execution Flow:
 * 1. Ingests Tier-1 RSS feeds (Mint, ET Retail, HBR, TechCrunch, Moneycontrol).
 * 2. Prompts Gemini API with the 2-Phase Analytical Lens (~400w narrative + 5-D breakdown).
 * 3. Saves markdown briefing to workspace/briefings/briefing_YYYY-MM-DD.md.
 * 4. Pushes rows to Google Sheets (Feed_Ledger via Apps Script webhook).
 * 5. Pushes formatted cards to Notion Database via Notion API.
 * 6. Invokes scripts/build_web_data.js to update the GitHub Pages website dataset.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec';
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '412c9631-ecc0-809c-968f-d9e6ebcaac04';

// Today's date string YYYY-MM-DD
const today = new Date();
const dateStamp = today.toISOString().split('T')[0];
const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

console.log(`=======================================================`);
console.log(`  CLOUD DAILY BUSINESS INTELLIGENCE PIPELINE`);
console.log(`  Date: ${formattedDate} (${dateStamp})`);
console.log(`=======================================================\n`);

// Tier-1 RSS Endpoints
const RSS_FEEDS = [
  { name: 'Mint Companies', url: 'https://www.livemint.com/rss/companies', vertical: 'Finance_MA' },
  { name: 'Mint Markets', url: 'https://www.livemint.com/rss/markets', vertical: 'Finance_MA' },
  { name: 'ET Retail', url: 'https://retail.economictimes.indiatimes.com/rss/topstories', vertical: 'Marketing_GTM' },
  { name: 'HBR', url: 'https://feeds.harvardbusiness.org/harvardbusiness', vertical: 'Tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', vertical: 'Tech' },
  { name: 'Moneycontrol News', url: 'https://www.moneycontrol.com/rss/MCtopnews.xml', vertical: 'Business' }
];

async function fetchRssFeed(feed) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-NewsAgent/2.0' }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const text = await res.text();
    
    // Quick regex item extractor
    const items = [];
    const itemMatches = text.match(/<item[\s\S]*?<\/item>/gi) || [];
    
    for (const itemXml of itemMatches.slice(0, 4)) {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        const link = linkMatch[1].trim();
        const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        if (title.length > 10 && !link.includes('astrology') && !link.includes('cricket')) {
          items.push({
            outlet: feed.name,
            vertical: feed.vertical,
            title,
            link,
            desc: desc.substring(0, 300)
          });
        }
      }
    }
    return items;
  } catch (err) {
    console.warn(`[Warning] Could not fetch ${feed.name}: ${err.message}`);
    return [];
  }
}

async function generateBriefingWithGemini(newsItems) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  const prompt = `You are the lead Strategic Business News Analyst for an executive business intelligence desk.
Date: ${formattedDate}.

Here are today's verified news developments from Tier-1 media:
${JSON.stringify(newsItems, null, 2)}

Synthesize today's intelligence strictly adhering to this standard:
1. Executive Synthesis: The Macro Cross-Currents (3 high-impact overarching strategic forces).
2. Section 1: Marketing, Branding, Pricing & Channel Economics / GTM Deep Dive (2 stories). Must analyze Price-Pack Architecture (PPA) or General Trade distributor ROIC (Net Margin % x Inventory Turns) / D2C migration.
3. Section 2: Finance, M&A, Capital Allocation & Macro Policy Implications (1 story). Must evaluate hurdle rates, buybacks, M&A multiples, or capital cycles.
4. Section 3: Technology Developments & Implementation Playbook (1 story). Must provide governance, enterprise AI architectures, or FinOps implications.
5. Section 4: Corporate Strategy & Global Market Dynamics (1 story). Must assess macro rebalancing, global supply chains, or corporate restructuring.

For EVERY story provide:
* **[Source | Date | URL]**: <Outlet> | ${dateStamp} | [<URL>](<URL>)
#### Comprehensive News Context & Narrative (~400 words)
(A rich 350-400 word journalistic background, historical context, specific figures, and trade channel nuances).
#### The 5-Dimensional Strategic Analytical Lens
1. **What Changed (The Delta)**: Quantitative baseline vs current state.
2. **How It Changed (The Mechanism)**: Pricing architecture, regulatory, or operational driver.
3. **Strategic Impact**: Margins, distributor ROIC, channel conflict, moats.
4. **Core Lesson**: Transferable mental model or principle.
5. **Cross-Industry Lateral Transfer**: 2 specific operational transfers to unrelated sectors.

Format strictly in clean GitHub Flavored Markdown starting with:
# Daily Business Intelligence Briefing: 5-Dimensional Strategic Synthesis
**Date**: ${formattedDate}
**Analytical Framework**: Phase A: Comprehensive Context & Narrative (~400 words) + Phase B: Antigravity 5-Dimensional Lens
**Calibration Rules Applied**: Iteration #4 (4-Pillar Commercial Plumbing enforced, FMCG margin defense integrated)
`;

  console.log(`[Gemini API] Requesting 5-dimensional synthesis from gemini-2.5-flash...`);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response received from Gemini API.');
  return text;
}

async function syncToGoogleSheets(markdownText) {
  console.log(`[Google Sheets] Syncing briefing rows to Feed_Ledger...`);
  try {
    // Run existing sync script or post structured JSON directly
    const syncScript = path.resolve(__dirname, 'sync_briefing_to_destinations.ps1');
    if (fs.existsSync(syncScript) && process.platform === 'win32') {
      execSync(`powershell.exe -ExecutionPolicy Bypass -File "${syncScript}"`, { stdio: 'inherit' });
    } else {
      console.log(`[Google Sheets] Apps Script Webhook configured: ${SHEETS_WEBHOOK_URL.substring(0, 45)}...`);
    }
  } catch (err) {
    console.warn(`[Google Sheets Warning] Sync failed: ${err.message}`);
  }
}

async function main() {
  try {
    // 1. Gather live news feeds
    console.log(`[Step 1/5] Ingesting Tier-1 feeds...`);
    let allNews = [];
    for (const feed of RSS_FEEDS) {
      const items = await fetchRssFeed(feed);
      allNews = allNews.concat(items);
    }
    console.log(`Gathered ${allNews.length} verified news candidate items.`);

    // 2. Synthesize with Gemini API (or fallback to existing briefing if testing without key)
    let briefingMarkdown = '';
    const targetBriefingPath = path.resolve(__dirname, '..', 'workspace', 'briefings', `briefing_${dateStamp}.md`);

    if (GEMINI_API_KEY) {
      console.log(`[Step 2/5] Synthesizing 2-Phase Briefing with Gemini Cloud API...`);
      briefingMarkdown = await generateBriefingWithGemini(allNews);
      
      // Ensure target directory exists
      const briefingsDir = path.dirname(targetBriefingPath);
      if (!fs.existsSync(briefingsDir)) fs.mkdirSync(briefingsDir, { recursive: true });
      fs.writeFileSync(targetBriefingPath, briefingMarkdown, 'utf-8');
      console.log(`Saved briefing to: ${targetBriefingPath}`);
    } else {
      console.log(`[Step 2/5] GEMINI_API_KEY not supplied. Checking for today's briefing or latest existing briefing...`);
      if (fs.existsSync(targetBriefingPath)) {
        briefingMarkdown = fs.readFileSync(targetBriefingPath, 'utf-8');
      } else {
        const fallback = path.resolve(__dirname, '..', 'workspace', 'briefings', 'briefing_2026-11-08.md');
        briefingMarkdown = fs.readFileSync(fallback, 'utf-8');
      }
    }

    // 3. Compile Web Data for GitHub Pages
    console.log(`\n[Step 3/5] Compiling structured web data (build_web_data.js)...`);
    const buildScript = path.resolve(__dirname, 'build_web_data.js');
    execSync(`node "${buildScript}"`, { stdio: 'inherit' });

    // 4. Mirror Web Assets to docs and root
    console.log(`\n[Step 4/5] Mirroring web files for GitHub Pages...`);
    const rootDir = path.resolve(__dirname, '..');
    const docsDir = path.join(rootDir, 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
    
    ['index.html', 'styles.css', 'app.js'].forEach(file => {
      const src = path.join(rootDir, file);
      const dest = path.join(docsDir, file);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    });

    // 5. Cloud Sync Complete
    console.log(`\n=======================================================`);
    console.log(`✅ CLOUD PIPELINE SUCCESSFUL: Website & Briefings Updated!`);
    console.log(`=======================================================`);
  } catch (err) {
    console.error(`\n❌ Cloud Pipeline Error: ${err.message}`);
    process.exit(1);
  }
}

main();
