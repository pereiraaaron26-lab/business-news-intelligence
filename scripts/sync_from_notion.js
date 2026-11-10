/**
 * Ingests live intelligence briefings directly from the Notion Database
 * Notion Database ID: 412c9631-ecc0-809c-968f-d9e6ebcaac04
 * Token: Configured via process.env.NOTION_TOKEN
 * 
 * Extracts:
 * - Page properties (Headline, Vertical, Source, Canonical URL, Date, Signals)
 * - Block content (Phase A Narrative + Phase B 5-Dimensional Breakdown)
 * - Exports unified structured JSON to data/latest.json and docs/data/latest.json
 */

const fs = require('fs');
const path = require('path');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '412c9631-ecc0-809c-968f-d9e6ebcaac04';
const NOTION_API_VERSION = '2022-06-28';

console.log('=======================================================');
console.log('  NOTION DATABASE INGESTION ENGINE');
console.log(`  Database ID: ${NOTION_DATABASE_ID}`);
console.log('=======================================================\n');

async function queryNotionDatabase() {
  console.log(`[Notion API] Querying database ${NOTION_DATABASE_ID}...`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      page_size: 50,
      sorts: [{ property: 'Date', direction: 'descending' }]
    })
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Notion Database Query failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.results || [];
}

async function fetchPageBlocks(pageId) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_API_VERSION
      }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn(`[Warning] Could not fetch blocks for page ${pageId}: ${err.message}`);
    return [];
  }
}

function parseBlocksToNarrativeAndLens(blocks) {
  let narrativeParagraphs = [];
  let inNarrative = false;
  let inLens = false;
  let currentDimension = '';

  const lens = {
    delta: '',
    mechanism: '',
    strategicImpact: '',
    coreLesson: '',
    lateralTransfer: ''
  };

  for (const block of blocks) {
    const type = block.type;
    let text = '';
    if (block[type] && block[type].rich_text) {
      text = block[type].rich_text.map(t => t.plain_text).join('').trim();
    }

    if (type === 'heading_1') {
      if (/Comprehensive News Context/i.test(text)) {
        inNarrative = true;
        inLens = false;
        continue;
      } else if (/5-Dimensional/i.test(text)) {
        inNarrative = false;
        inLens = true;
        continue;
      }
    }

    if (inNarrative && type === 'paragraph' && text.length > 0) {
      narrativeParagraphs.push(text);
    }

    if (inLens) {
      if (type === 'heading_3' || type === 'heading_2') {
        if (/Delta|What Changed/i.test(text)) currentDimension = 'delta';
        else if (/Mechanism|How It Changed/i.test(text)) currentDimension = 'mechanism';
        else if (/Strategic Impact/i.test(text)) currentDimension = 'strategicImpact';
        else if (/Core Lesson/i.test(text)) currentDimension = 'coreLesson';
        else if (/Lateral Transfer|Cross-Industry/i.test(text)) currentDimension = 'lateralTransfer';
      } else if (type === 'paragraph' && currentDimension && text.length > 0) {
        lens[currentDimension] = (lens[currentDimension] ? lens[currentDimension] + ' ' : '') + text;
      }
    }
  }

  const narrative = narrativeParagraphs.join('\n\n');
  return { narrative, lens };
}

async function syncNotionToWeb() {
  try {
    const pages = await queryNotionDatabase();
    console.log(`Retrieved ${pages.length} records from Notion database.`);

    const verticalMeta = {
      'Marketing_GTM': {
        key: 'Marketing_GTM',
        label: 'Marketing & GTM',
        fullName: 'Marketing, Branding, Pricing & Channel Economics / GTM',
        color: 'emerald',
        icon: 'trending-up',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        text: 'text-emerald-700 dark:text-emerald-400'
      },
      'Finance_MA': {
        key: 'Finance_MA',
        label: 'Finance & M&A',
        fullName: 'Finance, M&A, Capital Allocation & Macro Policy',
        color: 'amber',
        icon: 'dollar-sign',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800/50',
        text: 'text-amber-700 dark:text-amber-400'
      },
      'Tech': {
        key: 'Tech',
        label: 'Technology',
        fullName: 'Technology Developments & Implementation Playbook',
        color: 'blue',
        icon: 'cpu',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        border: 'border-blue-200 dark:border-blue-800/50',
        text: 'text-blue-700 dark:text-blue-400'
      },
      'Business': {
        key: 'Business',
        label: 'Corporate Strategy',
        fullName: 'Corporate Strategy & Global Market Dynamics',
        color: 'purple',
        icon: 'briefcase',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        border: 'border-purple-200 dark:border-purple-800/50',
        text: 'text-purple-700 dark:text-purple-400'
      }
    };

    const parsedStories = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const props = page.properties;

      // Extract properties safely
      const headline = props.Headline?.title?.map(t => t.plain_text).join('') || 'Untitled Dispatch';
      const verticalKey = props.Vertical?.select?.name || 'Business';
      const source = props.Source?.rich_text?.map(t => t.plain_text).join('') || 'Tier-1 Media';
      const canonicalUrl = props.URL?.url || '#';
      const date = props.Date?.date?.start || new Date().toISOString().split('T')[0];
      const signals = props.Signals?.multi_select?.map(s => s.name) || [];
      const notionPageUrl = page.url || `https://notion.so/${page.id.replace(/-/g, '')}`;

      console.log(`[${i + 1}/${pages.length}] Processing "${headline.substring(0, 45)}..."`);

      // Fetch blocks for narrative and 5-D breakdown
      const blocks = await fetchPageBlocks(page.id);
      const { narrative, lens } = parseBlocksToNarrativeAndLens(blocks);

      const vInfo = verticalMeta[verticalKey] || verticalMeta['Business'];

      parsedStories.push({
        id: `notion-${page.id}`,
        notionPageId: page.id,
        notionUrl: notionPageUrl,
        vertical: vInfo.key,
        verticalLabel: vInfo.label,
        verticalFullName: vInfo.fullName,
        verticalColor: vInfo.color,
        verticalStyle: {
          bg: vInfo.bg,
          border: vInfo.border,
          text: vInfo.text
        },
        headline,
        source,
        date,
        url: canonicalUrl, // Original article canonical link
        signals,
        narrative,
        narrativeWordCount: narrative ? narrative.split(/\s+/).filter(Boolean).length : 0,
        lens
      });
    }

    if (parsedStories.length > 0) {
      // Build structured bundle
      const outputData = {
        generatedAt: new Date().toISOString(),
        sourceMode: 'NOTION_API_DIRECT',
        briefingDate: parsedStories[0].date,
        totalStories: parsedStories.length,
        stats: {
          totalStories: parsedStories.length,
          averageWordCount: Math.round(parsedStories.reduce((acc, s) => acc + s.narrativeWordCount, 0) / parsedStories.length),
          verticalsRepresented: Array.from(new Set(parsedStories.map(s => s.vertical))).length,
          totalSignals: parsedStories.reduce((acc, s) => acc + s.signals.length, 0)
        },
        integrations: {
          notion: {
            databaseId: NOTION_DATABASE_ID,
            status: 'Live Synced',
            pageUrl: 'https://app.notion.com/p/Daily-Business-Intelligence-412c9631ecc080d7966ecaeb72d3285f'
          }
        },
        macroThemes: [
          { index: 1, title: 'FMCG Unit-Economics Battleground (PPA & Plumbing)', summary: 'Reliance Rs 5 entry forcing Britannia and Tata into pack-weight engineering.', tag: 'FMCG & CHANNEL' },
          { index: 2, title: 'Capital Allocation Prudence & Hyperscaler Skepticism', summary: 'Berkshire record $325.2B cash hoard & buyback freeze; capital rotating to Asian equities.', tag: 'CAPITAL ALLOCATION' },
          { index: 3, title: 'Retail Media & Discovery Disruption', summary: 'Quick-commerce platforms evolving into high-margin ad networks.', tag: 'AD-TECH & DISCOVERY' }
        ],
        stories: parsedStories
      };

      const baseDir = path.resolve(__dirname, '..');
      const targets = [
        path.join(baseDir, 'data', 'latest.json'),
        path.join(baseDir, 'docs', 'data', 'latest.json'),
        path.join(baseDir, 'web', 'data', 'latest.json')
      ];

      targets.forEach(t => {
        fs.mkdirSync(path.dirname(t), { recursive: true });
        fs.writeFileSync(t, JSON.stringify(outputData, null, 2), 'utf-8');
      });

      console.log(`\n✅ Successfully synced ${parsedStories.length} stories directly from Notion to Web targets!`);
    }

  } catch (err) {
    console.warn(`\n[Notion Ingestion Notice]: ${err.message}`);
    console.log('Falling back to local markdown briefing sync (build_web_data.js)...');
    const buildScript = path.resolve(__dirname, 'build_web_data.js');
    require(buildScript);
  }
}

syncNotionToWeb();
