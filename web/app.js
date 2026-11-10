/**
 * Business News Archive - Clean Wabi-Sabi Client Application
 * Modeled on the clean editorial news archive style.
 */

const state = {
  data: null,
  activeCat: 'all',
  searchQuery: '',
  isDark: false
};

const dom = {
  chipsContainer: document.getElementById('chips-container'),
  searchInput: document.getElementById('search-input'),
  cardsContainer: document.getElementById('cards-container'),
  themetoggle: document.getElementById('themetoggle'),
  heroMeta: document.getElementById('hero-meta'),
  chipCountAll: document.getElementById('chip-count-all'),
  chipCountMarketing: document.getElementById('chip-count-marketing'),
  chipCountFinance: document.getElementById('chip-count-finance'),
  chipCountTech: document.getElementById('chip-count-tech'),
  chipCountBusiness: document.getElementById('chip-count-business')
};

const CATEGORY_MAP = {
  'Marketing_GTM': {
    name: 'Marketing & GTM',
    accent: 'var(--indigo)',
    tint: 'var(--wash-indigo)'
  },
  'Finance_MA': {
    name: 'Finance & M&A',
    accent: 'var(--moss)',
    tint: 'var(--wash-moss)'
  },
  'Tech': {
    name: 'Technology',
    accent: 'var(--mizu)',
    tint: 'var(--wash-mizu)'
  },
  'Business': {
    name: 'Strategy',
    accent: 'var(--ochre)',
    tint: 'var(--wash-ochre)'
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await loadData();
  setupEvents();
  render();
});

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.isDark = saved ? saved === 'dark' : prefersDark;
  applyTheme();
}

function applyTheme() {
  if (state.isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
  }

  const moon = dom.themetoggle?.querySelector('.i-moon');
  const sun = dom.themetoggle?.querySelector('.i-sun');
  if (moon && sun) {
    moon.style.display = state.isDark ? 'none' : 'block';
    sun.style.display = state.isDark ? 'block' : 'none';
  }
}

function toggleTheme() {
  state.isDark = !state.isDark;
  localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
  applyTheme();
}

async function loadData() {
  try {
    const res = await fetch('data/latest.json');
    if (!res.ok) throw new Error('Fetch failed');
    state.data = await res.json();
  } catch (e) {
    if (window.BUSINESS_INTELLIGENCE_DATA) {
      state.data = window.BUSINESS_INTELLIGENCE_DATA;
    }
  }
}

function setupEvents() {
  if (dom.themetoggle) {
    dom.themetoggle.addEventListener('click', toggleTheme);
  }

  if (dom.chipsContainer) {
    dom.chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      dom.chipsContainer.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('is-on');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-on');
      chip.setAttribute('aria-pressed', 'true');
      state.activeCat = chip.dataset.cat;
      renderCards();
    });
  }

  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderCards();
    });
  }
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      return `${day} ${month}`;
    }
  } catch (e) {}
  return dateStr;
}

function extractDomain(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'source';
  }
}

function render() {
  if (!state.data) return;

  const stories = state.data.stories || [];

  // Update counts
  if (dom.chipCountAll) dom.chipCountAll.textContent = stories.length;
  if (dom.chipCountMarketing) dom.chipCountMarketing.textContent = stories.filter(s => s.vertical === 'Marketing_GTM').length;
  if (dom.chipCountFinance) dom.chipCountFinance.textContent = stories.filter(s => s.vertical === 'Finance_MA').length;
  if (dom.chipCountTech) dom.chipCountTech.textContent = stories.filter(s => s.vertical === 'Tech').length;
  if (dom.chipCountBusiness) dom.chipCountBusiness.textContent = stories.filter(s => s.vertical === 'Business').length;

  if (dom.heroMeta) {
    dom.heroMeta.textContent = `${stories.length} stories · ${state.data.briefingDate}`;
  }

  renderCards();
}

function renderCards() {
  if (!dom.cardsContainer || !state.data) return;

  const stories = state.data.stories || [];
  const q = state.searchQuery;

  const filtered = stories.filter(story => {
    if (state.activeCat !== 'all' && story.vertical !== state.activeCat) {
      return false;
    }

    if (q) {
      const inHeadline = story.headline.toLowerCase().includes(q);
      const inSummary = (story.narrative || '').toLowerCase().includes(q);
      const inDelta = (story.lens?.delta || '').toLowerCase().includes(q);
      const inMech = (story.lens?.mechanism || '').toLowerCase().includes(q);
      const inImpact = (story.lens?.strategicImpact || '').toLowerCase().includes(q);
      const inLesson = (story.lens?.coreLesson || '').toLowerCase().includes(q);
      const inLateral = (story.lens?.lateralTransfer || '').toLowerCase().includes(q);
      if (!inHeadline && !inSummary && !inDelta && !inMech && !inImpact && !inLesson && !inLateral) {
        return false;
      }
    }

    return true;
  });

  if (filtered.length === 0) {
    dom.cardsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; color: var(--ink-faint);">
        <p style="font-size: 1rem; margin: 0 0 0.5rem 0; color: var(--ink);">No stories found</p>
        <p style="font-size: 0.8125rem; margin: 0;">Try adjusting your search query or switching categories.</p>
      </div>
    `;
    return;
  }

  dom.cardsContainer.innerHTML = filtered.map(story => {
    const cat = CATEGORY_MAP[story.vertical] || {
      name: story.vertical,
      accent: 'var(--ochre)',
      tint: 'var(--wash-ochre)'
    };

    const shortDate = formatShortDate(story.date);
    const domain = extractDomain(story.url);

    // Clean first paragraph of narrative for card summary
    let summaryText = story.narrative || '';
    if (summaryText.includes('\n\n')) {
      summaryText = summaryText.split('\n\n')[0];
    }
    if (summaryText.length > 320) {
      summaryText = summaryText.substring(0, 310) + '…';
    }

    return `
      <article class="card" style="--accent:${cat.accent}; --tint:${cat.tint}">
        
        <div class="card__top">
          <span class="card__tag">
            <span class="card__tag-dot" aria-hidden="true"></span>
            ${escapeHtml(cat.name)}
          </span>
          <time class="card__date">${escapeHtml(shortDate)}</time>
        </div>

        <h3 class="card__h">${escapeHtml(story.headline)}</h3>

        <p class="card__sum">${escapeHtml(summaryText)}</p>

        <div class="card__angle">
          <span class="card__angle-k">Strategic Breakdown (5-D Lens)</span>
          <ul>
            ${story.lens?.delta ? `<li><strong>Delta:</strong> ${escapeHtml(story.lens.delta)}</li>` : ''}
            ${story.lens?.mechanism ? `<li><strong>Mechanism:</strong> ${escapeHtml(story.lens.mechanism)}</li>` : ''}
            ${story.lens?.strategicImpact ? `<li><strong>Strategic Impact:</strong> ${escapeHtml(story.lens.strategicImpact)}</li>` : ''}
            ${story.lens?.coreLesson ? `<li><strong>Core Lesson:</strong> ${escapeHtml(story.lens.coreLesson)}</li>` : ''}
            ${story.lens?.lateralTransfer ? `<li><strong>Lateral Application:</strong> ${escapeHtml(story.lens.lateralTransfer)}</li>` : ''}
          </ul>
        </div>

        <a class="card__src" href="${escapeHtml(story.url)}" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(domain)}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17L17 7M17 7H8M17 7v9"></path>
          </svg>
        </a>

      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
