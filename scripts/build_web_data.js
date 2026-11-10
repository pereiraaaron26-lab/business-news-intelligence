const fs = require('fs');
const path = require('path');

function parseMarkdownBriefing(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Date
  let date = 'November 8, 2026';
  const dateMatch = content.match(/\*\*Date\*\*:\s*([^\r\n]+)/i);
  if (dateMatch) date = dateMatch[1].trim();

  // Framework & Calibration
  let framework = '';
  const fwMatch = content.match(/\*\*Analytical Framework\*\*:\s*([^\r\n]+)/i);
  if (fwMatch) framework = fwMatch[1].trim();

  let calibration = '';
  const calMatch = content.match(/\*\*Calibration Rules Applied\*\*:\s*([^\r\n]+)/i);
  if (calMatch) calibration = calMatch[1].trim();

  // Executive Synthesis
  let executiveSynthesis = '';
  let macroThemes = [];
  const execSectionMatch = content.match(/## Executive Synthesis:[^\r\n]*\r?\n([\s\S]*?)(?=\r?\n##\s+\d|\r?\n---)/i);
  if (execSectionMatch) {
    executiveSynthesis = execSectionMatch[1].trim();
    // Parse numbered points
    const themeMatches = executiveSynthesis.match(/\d+\.\s+\*\*([^*]+)\*\*:\s*([^\r\n]+(?:\r?\n(?!\d+\.|\r?\n)[^\r\n]+)*)/g);
    if (themeMatches) {
      macroThemes = themeMatches.map((t, idx) => {
        const m = t.match(/\d+\.\s+\*\*([^*]+)\*\*:\s*([\s\S]+)/);
        return m ? {
          index: idx + 1,
          title: m[1].trim(),
          summary: m[2].trim(),
          tag: idx === 0 ? 'FMCG & CHANNEL' : idx === 1 ? 'CAPITAL ALLOCATION' : 'RETAIL MEDIA & AD-TECH'
        } : { index: idx + 1, title: `Macro Theme ${idx + 1}`, summary: t.trim(), tag: 'MACRO' };
      });
    }
  }

  // Split into vertical sections
  const sectionChunks = content.split(/\r?\n(?=##\s+\d+\.)/);
  const stories = [];

  const verticalMeta = {
    '1': {
      key: 'Marketing_GTM',
      label: 'Marketing & GTM',
      fullName: 'Marketing, Branding, Pricing & Channel Economics / GTM',
      color: 'emerald',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderLight: 'border-emerald-200 dark:border-emerald-800/50',
      textLight: 'text-emerald-700 dark:text-emerald-400',
      icon: 'trending-up'
    },
    '2': {
      key: 'Finance_MA',
      label: 'Finance & M&A',
      fullName: 'Finance, M&A, Capital Allocation & Macro Policy',
      color: 'amber',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderLight: 'border-amber-200 dark:border-amber-800/50',
      textLight: 'text-amber-700 dark:text-amber-400',
      icon: 'dollar-sign'
    },
    '3': {
      key: 'Tech',
      label: 'Technology',
      fullName: 'Technology Developments & Implementation Playbook',
      color: 'blue',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      borderLight: 'border-blue-200 dark:border-blue-800/50',
      textLight: 'text-blue-700 dark:text-blue-400',
      icon: 'cpu'
    },
    '4': {
      key: 'Business',
      label: 'Corporate Strategy',
      fullName: 'Corporate Strategy & Global Market Dynamics',
      color: 'purple',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      borderLight: 'border-purple-200 dark:border-purple-800/50',
      textLight: 'text-purple-700 dark:text-purple-400',
      icon: 'briefcase'
    }
  };

  for (const chunk of sectionChunks) {
    const secHeadMatch = chunk.match(/^##\s+(\d+)\.\s+([^\r\n]+)/);
    if (!secHeadMatch) continue;

    const secNum = secHeadMatch[1];
    if (secNum === '5') continue; // Calibration section

    const vInfo = verticalMeta[secNum] || {
      key: 'Business',
      label: 'Corporate Strategy',
      fullName: secHeadMatch[2].trim(),
      color: 'purple',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      borderLight: 'border-purple-200 dark:border-purple-800/50',
      textLight: 'text-purple-700 dark:text-purple-400',
      icon: 'briefcase'
    };

    // Split stories inside this section
    const storyChunks = chunk.split(/\r?\n(?=###\s+Story\s+\d+:)/);
    for (const sChunk of storyChunks) {
      const sHeadMatch = sChunk.match(/^###\s+Story\s+\d+:\s+([^\r\n]+)/);
      if (!sHeadMatch) continue;

      const headline = sHeadMatch[1].trim();

      // Source, Date, URL
      let source = 'Tier-1 Media';
      let storyDate = date;
      let url = '#';
      const sourceLineMatch = sChunk.match(/\*\s+\*\*\[Source\s*\|\s*Date\s*\|\s*URL\]\*\*:\s*([^\r\n]+)/i);
      if (sourceLineMatch) {
        const line = sourceLineMatch[1];
        const parts = line.split('|').map(s => s.trim());
        if (parts[0]) source = parts[0];
        if (parts[1]) storyDate = parts[1];
        const urlMatch = line.match(/\[([^\]]*)\]\(([^)]+)\)/);
        if (urlMatch) {
          url = urlMatch[2];
        }
      }

      // Comprehensive Context Narrative (~400 words)
      let narrative = '';
      const narrMatch = sChunk.match(/####\s+Comprehensive News Context & Narrative[^\r\n]*\r?\n([\s\S]*?)(?=\r?\n####\s+The 5-Dimensional|\r?\n---|\r?\n###|$)/i);
      if (narrMatch) {
        narrative = narrMatch[1].trim();
      }

      // 5-Dimensional Lens
      let delta = '';
      let mechanism = '';
      let strategicImpact = '';
      let coreLesson = '';
      let lateralTransfer = '';

      const deltaMatch = sChunk.match(/1\.\s+\*\*What Changed\s*\((?:The\s+)?Delta\)\*\*:\s*([\s\S]*?)(?=\r?\n\d\.\s+\*\*|\r?\n---|\r?\n###|$)/i);
      if (deltaMatch) delta = deltaMatch[1].trim();

      const mechMatch = sChunk.match(/2\.\s+\*\*How It Changed\s*\((?:The\s+)?Mechanism\)\*\*:\s*([\s\S]*?)(?=\r?\n\d\.\s+\*\*|\r?\n---|\r?\n###|$)/i);
      if (mechMatch) mechanism = mechMatch[1].trim();

      const impactMatch = sChunk.match(/3\.\s+\*\*Strategic Impact\*\*:\s*([\s\S]*?)(?=\r?\n\d\.\s+\*\*|\r?\n---|\r?\n###|$)/i);
      if (impactMatch) strategicImpact = impactMatch[1].trim();

      const lessonMatch = sChunk.match(/4\.\s+\*\*Core Lesson[^\*]*\*\*:\s*([\s\S]*?)(?=\r?\n\d\.\s+\*\*|\r?\n---|\r?\n###|$)/i);
      if (lessonMatch) coreLesson = lessonMatch[1].trim();

      const lateralMatch = sChunk.match(/5\.\s+\*\*Cross-Industry[^\*]*\*\*:\s*([\s\S]*?)(?=\r?\n---|\r?\n###|\r?\n##|$)/i);
      if (lateralMatch) lateralTransfer = lateralMatch[1].trim();

      // Signals / Tags
      const signals = [];
      if (vInfo.key === 'Marketing_GTM') {
        if (/price|pricing|ppa|margin|shrinkflation/i.test(headline + ' ' + delta + ' ' + mechanism)) signals.push('PRICING ARCHITECTURE');
        if (/distribution|kirana|retail|gtm|channel|store/i.test(headline + ' ' + delta + ' ' + mechanism)) signals.push('GTM / CHANNEL');
        if (/d2c|fmcg|mamaearth|derma/i.test(headline + ' ' + delta + ' ' + mechanism)) signals.push('D2C MIGRATION');
        if (/distributor roic|working capital|margin waterfall/i.test(mechanism + ' ' + strategicImpact)) signals.push('DISTRIBUTOR ROIC');
      } else if (vInfo.key === 'Finance_MA') {
        if (/cash|treasury|liquidity|hoard/i.test(headline + ' ' + delta)) signals.push('CAPITAL ALLOCATION');
        if (/buyback|repurchase/i.test(headline + ' ' + delta)) signals.push('BUYBACK FREEZE');
        if (/hurdle|yield|rate/i.test(mechanism + ' ' + strategicImpact)) signals.push('TREASURY YIELD DYNAMICS');
      } else if (vInfo.key === 'Tech') {
        if (/ai|llm|rag|agent/i.test(headline + ' ' + delta + ' ' + mechanism)) signals.push('ENTERPRISE AI');
        if (/board|governance|audit|liability/i.test(headline + ' ' + delta + ' ' + strategicImpact)) signals.push('GOVERNANCE & LIABILITY');
        if (/finops|token|enclave/i.test(narrative + ' ' + strategicImpact)) signals.push('FINOPS & SECURITY');
      } else if (vInfo.key === 'Business') {
        if (/rotation|rebalancing|fund|fii/i.test(headline + ' ' + delta + ' ' + mechanism)) signals.push('MACRO REBALANCING');
        if (/capex|datacenter/i.test(headline + ' ' + mechanism)) signals.push('AI CAPEX DISCIPLINE');
        if (/asian|india|domestic/i.test(headline + ' ' + delta)) signals.push('EMERGING DOMESTIC MARKET');
      }

      stories.push({
        id: `story-${stories.length + 1}`,
        vertical: vInfo.key,
        verticalLabel: vInfo.label,
        verticalFullName: vInfo.fullName,
        verticalColor: vInfo.color,
        verticalStyle: {
          bg: vInfo.bgLight,
          border: vInfo.borderLight,
          text: vInfo.textLight
        },
        headline,
        source,
        date: storyDate,
        url,
        signals,
        narrative,
        narrativeWordCount: narrative ? narrative.split(/\s+/).filter(Boolean).length : 0,
        lens: {
          delta,
          mechanism,
          strategicImpact,
          coreLesson,
          lateralTransfer
        }
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    briefingDate: date,
    framework,
    calibration,
    executiveSynthesis,
    macroThemes,
    totalStories: stories.length,
    sourcesCount: Array.from(new Set(stories.map(s => s.source))).length,
    stats: {
      totalStories: stories.length,
      averageWordCount: Math.round(stories.reduce((acc, s) => acc + s.narrativeWordCount, 0) / (stories.length || 1)),
      verticalsRepresented: Array.from(new Set(stories.map(s => s.vertical))).length,
      totalSignals: stories.reduce((acc, s) => acc + s.signals.length, 0)
    },
    integrations: {
      googleSheets: {
        tab: 'Feed_Ledger',
        status: 'Connected',
        webhook: 'https://script.google.com/macros/s/AKfycbxRhaLJx5LmnMADbuv3yMycpu4IOVw-ydsFAqRqkzOctHs60O0MwKI0kl6-O4HdA3d0QA/exec'
      },
      notion: {
        databaseId: '412c9631-ecc0-809c-968f-d9e6ebcaac04',
        pageTitle: 'Daily Business Intelligence',
        url: 'https://app.notion.com/p/Daily-Business-Intelligence-412c9631ecc080d7966ecaeb72d3285f',
        status: 'Connected'
      }
    },
    stories
  };
}

// Write to multiple standard directories so site works regardless of hosting setup
const baseDir = path.resolve(__dirname, '..');
const dirs = [
  path.join(baseDir, 'data'),
  path.join(baseDir, 'docs', 'data'),
  path.join(baseDir, 'web', 'data')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const briefingFile = path.join(baseDir, 'workspace', 'briefings', 'briefing_2026-11-08.md');
const parsed = parseMarkdownBriefing(briefingFile);

// Save latest.json to all targets
const jsonString = JSON.stringify(parsed, null, 2);
dirs.forEach(d => {
  fs.writeFileSync(path.join(d, 'latest.json'), jsonString, 'utf-8');
});

// Also create an inline JS payload data/briefing_data.js for instant local file:// protocol access without CORS restrictions!
const jsPayload = `// Auto-generated by scripts/build_web_data.js
window.BUSINESS_INTELLIGENCE_DATA = ${jsonString};
`;
dirs.forEach(d => {
  fs.writeFileSync(path.join(d, 'briefing_data.js'), jsPayload, 'utf-8');
});

console.log('✅ Web data successfully built and synced:');
console.log(`- Briefing Date: ${parsed.briefingDate}`);
console.log(`- Stories: ${parsed.stories.length}`);
console.log(`- Average narrative word count: ${parsed.stats.averageWordCount}`);
dirs.forEach(d => console.log(`- Target: ${d}`));
