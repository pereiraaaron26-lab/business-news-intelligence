/**
 * Antigravity Business News Intelligence Platform - Frontend Application
 * Handles data ingestion, multi-view rendering (Editorial Cards, Notion Kanban, 5-D Matrix, Ledger, Notion Hub),
 * real-time search, complete article links, and exports.
 */

// State Management
const state = {
  data: null,
  activeVertical: 'ALL',
  activeSignal: null,
  searchQuery: '',
  activeView: 'cards', // 'cards' | 'kanban' | 'matrix' | 'ledger' | 'notion'
  activeStoryId: null,
  isDark: true
};

// DOM Elements
const elements = {
  heroDate: document.getElementById('hero-date'),
  navDateBadge: document.getElementById('nav-date-badge'),
  statTotalStories: document.getElementById('stat-total-stories'),
  statAvgWords: document.getElementById('stat-avg-words'),
  macroThemesGrid: document.getElementById('macro-themes-grid'),
  verticalTabs: document.getElementById('vertical-tabs'),
  signalTagsContainer: document.getElementById('signal-tags-container'),
  searchInput: document.getElementById('search-input'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  btnResetFilters: document.getElementById('btn-reset-filters'),
  btnExportJson: document.getElementById('btn-export-json'),
  btnCopyAll: document.getElementById('btn-copy-all'),
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  btnOpenDiagnostics: document.getElementById('btn-open-diagnostics'),
  diagnosticsModal: document.getElementById('diagnostics-modal'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  copyCmdBtn: document.getElementById('copy-cmd-btn'),
  
  // View Switcher Buttons
  viewCardsBtn: document.getElementById('view-cards-btn'),
  viewKanbanBtn: document.getElementById('view-kanban-btn'),
  viewMatrixBtn: document.getElementById('view-matrix-btn'),
  viewLedgerBtn: document.getElementById('view-ledger-btn'),
  viewNotionBtn: document.getElementById('view-notion-btn'),

  // View Containers
  viewCardsContainer: document.getElementById('view-cards-container'),
  viewKanbanContainer: document.getElementById('view-kanban-container'),
  viewMatrixContainer: document.getElementById('view-matrix-container'),
  viewLedgerContainer: document.getElementById('view-ledger-container'),
  viewNotionContainer: document.getElementById('view-notion-container'),

  // Specific Wrappers
  kanbanBoardGrid: document.getElementById('kanban-board-grid'),
  matrixTableWrapper: document.getElementById('matrix-table-wrapper'),
  ledgerTableWrapper: document.getElementById('ledger-table-wrapper'),

  // Reader Drawer
  readerDrawer: document.getElementById('reader-drawer'),
  readerDrawerBackdrop: document.getElementById('reader-drawer-backdrop'),
  drawerContent: document.getElementById('drawer-content'),
  drawerCloseBtn: document.getElementById('drawer-close-btn'),
  drawerCopyBtn: document.getElementById('drawer-copy-btn'),

  // Toast
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toast-message')
};

// Vertical Metadata
const VERTICAL_METAS = {
  'Marketing_GTM': {
    roman: 'I',
    emoji: '🏢',
    icon: 'trending-up',
    label: 'Marketing & GTM',
    color: 'emerald',
    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
  },
  'Finance_MA': {
    roman: 'II',
    emoji: '💰',
    icon: 'dollar-sign',
    label: 'Finance & M&A',
    color: 'amber',
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
  },
  'Tech': {
    roman: 'III',
    emoji: '⚡',
    icon: 'cpu',
    label: 'Technology',
    color: 'blue',
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40'
  },
  'Business': {
    roman: 'IV',
    emoji: '🌐',
    icon: 'briefcase',
    label: 'Corporate Strategy',
    color: 'purple',
    badge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40'
  }
};

// Initializer
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await loadData();
  setupEventListeners();
  renderAll();
});

function initTheme() {
  const savedTheme = localStorage.getItem('agy_theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    state.isDark = false;
  } else {
    document.documentElement.classList.add('dark');
    state.isDark = true;
  }
}

function toggleTheme() {
  state.isDark = !state.isDark;
  if (state.isDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('agy_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('agy_theme', 'light');
  }
  refreshIcons();
}

async function loadData() {
  try {
    const res = await fetch('data/latest.json');
    if (!res.ok) throw new Error('Fetch failed, using fallback');
    state.data = await res.json();
  } catch (err) {
    console.warn('Loading from fallback payload:', err);
    if (window.BUSINESS_INTELLIGENCE_DATA) {
      state.data = window.BUSINESS_INTELLIGENCE_DATA;
    } else {
      console.error('No briefing data available.');
    }
  }
}

function showToast(message) {
  if (!elements.toast) return;
  elements.toastMessage.textContent = message;
  elements.toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    elements.toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
  }, 2600);
}

function setupEventListeners() {
  elements.btnThemeToggle.addEventListener('click', toggleTheme);

  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    if (state.searchQuery.length > 0) {
      elements.btnClearSearch.classList.remove('hidden');
    } else {
      elements.btnClearSearch.classList.add('hidden');
    }
    renderViews();
  });

  elements.btnClearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.btnClearSearch.classList.add('hidden');
    renderViews();
  });

  elements.btnResetFilters.addEventListener('click', () => {
    state.activeVertical = 'ALL';
    state.activeSignal = null;
    state.searchQuery = '';
    elements.searchInput.value = '';
    elements.btnClearSearch.classList.add('hidden');
    updateVerticalTabsUI();
    renderAll();
  });

  elements.verticalTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;
    state.activeVertical = btn.dataset.vertical;
    updateVerticalTabsUI();
    renderViews();
  });

  elements.viewCardsBtn.addEventListener('click', () => switchView('cards'));
  if (elements.viewKanbanBtn) elements.viewKanbanBtn.addEventListener('click', () => switchView('kanban'));
  elements.viewMatrixBtn.addEventListener('click', () => switchView('matrix'));
  elements.viewLedgerBtn.addEventListener('click', () => switchView('ledger'));
  if (elements.viewNotionBtn) elements.viewNotionBtn.addEventListener('click', () => switchView('notion'));

  elements.btnCopyAll.addEventListener('click', copyFullBriefingMarkdown);
  elements.btnExportJson.addEventListener('click', exportJsonData);

  elements.btnOpenDiagnostics.addEventListener('click', openDiagnosticsModal);
  elements.modalCloseBtn.addEventListener('click', closeDiagnosticsModal);
  elements.diagnosticsModal.addEventListener('click', (e) => {
    if (e.target === elements.diagnosticsModal) closeDiagnosticsModal();
  });

  elements.copyCmdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('powershell.exe -ExecutionPolicy Bypass -File .\\scripts\\run_daily_intelligence.ps1');
    showToast('Automation command copied!');
  });

  elements.drawerCloseBtn.addEventListener('click', closeReaderDrawer);
  elements.readerDrawerBackdrop.addEventListener('click', closeReaderDrawer);

  elements.drawerCopyBtn.addEventListener('click', () => {
    if (state.activeStoryId && state.data) {
      const story = state.data.stories.find(s => s.id === state.activeStoryId);
      if (story) copyStoryMarkdown(story);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDiagnosticsModal();
      closeReaderDrawer();
    }
  });
}

function updateVerticalTabsUI() {
  const tabs = elements.verticalTabs.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    if (tab.dataset.vertical === state.activeVertical) {
      tab.className = 'filter-tab active px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-900 dark:bg-white text-white dark:text-slate-900 whitespace-nowrap shadow-xs';
    } else {
      tab.className = 'filter-tab px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-white dark:bg-paper-surface hover:bg-slate-100 dark:hover:bg-paper-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-paper-border whitespace-nowrap flex items-center space-x-1.5';
    }
  });
}

function switchView(viewName) {
  state.activeView = viewName;

  const viewButtons = [
    { btn: elements.viewCardsBtn, name: 'cards' },
    { btn: elements.viewKanbanBtn, name: 'kanban' },
    { btn: elements.viewMatrixBtn, name: 'matrix' },
    { btn: elements.viewLedgerBtn, name: 'ledger' },
    { btn: elements.viewNotionBtn, name: 'notion' }
  ];

  viewButtons.forEach(({ btn, name }) => {
    if (!btn) return;
    if (name === viewName) {
      btn.className = 'view-btn active px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 bg-white dark:bg-paper-card text-slate-900 dark:text-white shadow-xs transition-all whitespace-nowrap';
    } else {
      btn.className = 'view-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all whitespace-nowrap';
    }
  });

  if (elements.viewCardsContainer) elements.viewCardsContainer.classList.toggle('hidden', viewName !== 'cards');
  if (elements.viewKanbanContainer) elements.viewKanbanContainer.classList.toggle('hidden', viewName !== 'kanban');
  if (elements.viewMatrixContainer) elements.viewMatrixContainer.classList.toggle('hidden', viewName !== 'matrix');
  if (elements.viewLedgerContainer) elements.viewLedgerContainer.classList.toggle('hidden', viewName !== 'ledger');
  if (elements.viewNotionContainer) elements.viewNotionContainer.classList.toggle('hidden', viewName !== 'notion');

  renderViews();
  refreshIcons();
}

function renderAll() {
  if (!state.data) return;

  renderHeaderAndMetrics();
  renderMacroThemes();
  renderSignalPills();
  renderViews();
  refreshIcons();
}

function renderHeaderAndMetrics() {
  const d = state.data;
  if (elements.heroDate) elements.heroDate.textContent = `Briefing Date: ${d.briefingDate}`;
  if (elements.navDateBadge) elements.navDateBadge.textContent = d.briefingDate;
  if (elements.statTotalStories) elements.statTotalStories.textContent = `${d.stories.length} Stories`;
  if (elements.statAvgWords) elements.statAvgWords.textContent = `~${d.stats?.averageWordCount || 360} words`;
}

function renderMacroThemes() {
  if (!elements.macroThemesGrid || !state.data) return;
  const themes = state.data.macroThemes || [];
  const romans = ['I', 'II', 'III'];

  elements.macroThemesGrid.innerHTML = themes.map((t, idx) => {
    return `
      <div class="space-y-2.5 p-4 rounded-xl bg-slate-50/60 dark:bg-paper-card/40 border border-slate-100 dark:border-paper-border/60">
        <div class="flex items-center justify-between text-xs">
          <span class="font-serif italic font-bold text-slate-400 text-sm">${romans[idx] || (idx + 1)}.</span>
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-paper-surface border border-slate-200 dark:border-paper-border">
            ${escapeHtml(t.tag || 'MACRO')}
          </span>
        </div>
        <h4 class="font-serif font-bold text-slate-900 dark:text-white text-base leading-snug">
          ${escapeHtml(t.title)}
        </h4>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          ${escapeHtml(t.summary)}
        </p>
      </div>
    `;
  }).join('');
}

function renderSignalPills() {
  if (!elements.signalTagsContainer || !state.data) return;
  
  const allSignals = new Set();
  state.data.stories.forEach(s => {
    (s.signals || []).forEach(sig => allSignals.add(sig));
  });

  const signalArray = Array.from(allSignals);

  elements.signalTagsContainer.innerHTML = `
    <span class="text-slate-400 font-mono uppercase text-[11px] pr-1 flex items-center whitespace-nowrap">
      <i data-lucide="tag" class="w-3 h-3 mr-1"></i> Signals:
    </span>
    ${signalArray.map(sig => {
      const isActive = state.activeSignal === sig;
      return `
        <button class="signal-pill whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
          isActive
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
            : 'bg-slate-100 dark:bg-paper-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-paper-border'
        }" data-signal="${escapeHtml(sig)}">
          #${escapeHtml(sig)}
        </button>
      `;
    }).join('')}
  `;

  elements.signalTagsContainer.querySelectorAll('.signal-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const sig = btn.dataset.signal;
      state.activeSignal = state.activeSignal === sig ? null : sig;
      renderSignalPills();
      renderViews();
      refreshIcons();
    });
  });
}

function getFilteredStories() {
  if (!state.data) return [];
  return state.data.stories.filter(story => {
    if (state.activeVertical !== 'ALL' && story.vertical !== state.activeVertical) {
      return false;
    }
    if (state.activeSignal && !(story.signals || []).includes(state.activeSignal)) {
      return false;
    }
    if (state.searchQuery) {
      const q = state.searchQuery;
      const matchHeadline = story.headline.toLowerCase().includes(q);
      const matchSource = (story.source || '').toLowerCase().includes(q);
      const matchNarrative = (story.narrative || '').toLowerCase().includes(q);
      const matchDelta = (story.lens?.delta || '').toLowerCase().includes(q);
      const matchMech = (story.lens?.mechanism || '').toLowerCase().includes(q);
      const matchImpact = (story.lens?.strategicImpact || '').toLowerCase().includes(q);
      const matchLesson = (story.lens?.coreLesson || '').toLowerCase().includes(q);
      const matchLateral = (story.lens?.lateralTransfer || '').toLowerCase().includes(q);
      const matchSignals = (story.signals || []).some(s => s.toLowerCase().includes(q));

      if (!matchHeadline && !matchSource && !matchNarrative && !matchDelta && !matchMech && !matchImpact && !matchLesson && !matchLateral && !matchSignals) {
        return false;
      }
    }
    return true;
  });
}

function renderViews() {
  const filteredStories = getFilteredStories();

  if (state.activeView === 'cards') {
    renderCardsView(filteredStories);
  } else if (state.activeView === 'kanban') {
    renderKanbanView(filteredStories);
  } else if (state.activeView === 'matrix') {
    renderMatrixView(filteredStories);
  } else if (state.activeView === 'ledger') {
    renderLedgerView(filteredStories);
  }
}

// ================= VIEW 1: EDITORIAL BRIEFING CARDS =================
function renderCardsView(stories) {
  if (!elements.viewCardsContainer) return;

  if (stories.length === 0) {
    elements.viewCardsContainer.innerHTML = `
      <div class="text-center py-16 bg-white dark:bg-paper-surface rounded-2xl border border-slate-200 dark:border-paper-border p-8">
        <i data-lucide="inbox" class="w-10 h-10 mx-auto text-slate-400 mb-2"></i>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">No dispatches match your filter</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting your search query or selecting "All Verticals".</p>
        <button onclick="document.getElementById('btn-reset-filters').click()" class="mt-4 px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg">
          Reset All Filters
        </button>
      </div>
    `;
    refreshIcons();
    return;
  }

  elements.viewCardsContainer.innerHTML = stories.map((story, sIdx) => {
    const vMeta = VERTICAL_METAS[story.vertical] || { roman: 'IV', emoji: '📄', label: story.vertical, badge: 'bg-slate-100 text-slate-700' };
    
    const signalBadges = (story.signals || []).map(sig => `
      <span class="px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-paper-card border border-slate-200 dark:border-paper-border">
        #${escapeHtml(sig)}
      </span>
    `).join(' ');

    return `
      <article class="bg-white dark:bg-paper-surface rounded-2xl border border-slate-200 dark:border-paper-border p-6 sm:p-8 space-y-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        
        <!-- Top Metadata Header -->
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider ${vMeta.badge} border">
                ${vMeta.roman}. ${escapeHtml(story.verticalLabel || story.vertical)}
              </span>
              <span class="text-slate-400 font-mono">•</span>
              <span class="font-mono text-slate-400 text-xs">${escapeHtml(story.date)}</span>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-50 dark:bg-paper-card border border-slate-200 dark:border-paper-border">
                ${story.narrativeWordCount}w Narrative
              </span>
              <button class="open-drawer-btn text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded bg-slate-50 dark:bg-paper-card border border-slate-200 dark:border-paper-border flex items-center space-x-1 font-mono transition-colors" data-story-id="${story.id}">
                <i data-lucide="maximize-2" class="w-3 h-3"></i>
                <span>Focus</span>
              </button>
            </div>

          </div>

          <!-- Headline (Editorial Serif) -->
          <h2 class="font-serif font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
            ${escapeHtml(story.headline)}
          </h2>

          <!-- Signal Tags -->
          <div class="flex flex-wrap gap-1.5 pt-0.5">
            ${signalBadges}
          </div>
        </div>

        <!-- ================= DEDICATED COMPLETE ARTICLE REFERENCE ================= -->
        <div class="rounded-xl bg-slate-50/80 dark:bg-paper-card/70 p-4 border border-slate-200/80 dark:border-paper-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-paper-surface flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
              <i data-lucide="newspaper" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="font-mono uppercase text-[10px] tracking-wider text-slate-400 font-bold">Primary Reporting Reference</div>
              <div class="font-bold text-slate-900 dark:text-white">
                ${escapeHtml(story.source)} <span class="font-normal text-slate-400">• Verified Primary Source</span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2 w-full sm:w-auto">
            <a href="${escapeHtml(story.url)}" target="_blank" rel="noopener noreferrer" class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:opacity-90 transition-opacity">
              <span>Read Complete Article</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
            <a href="${escapeHtml(story.notionUrl || 'https://app.notion.com/p/Daily-Business-Intelligence-412c9631ecc080d7966ecaeb72d3285f')}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 font-semibold text-xs flex items-center justify-center space-x-1 transition-colors">
              <i data-lucide="book-open" class="w-3 h-3"></i>
              <span>Notion</span>
            </a>
          </div>
        </div>

        <!-- PHASE A: COMPREHENSIVE NARRATIVE (~400 WORDS) -->
        <div class="rounded-xl bg-slate-50/50 dark:bg-paper-card/30 p-5 sm:p-6 border border-slate-200/60 dark:border-paper-border/60 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-200/60 dark:border-paper-border/60 pb-2.5">
            <div class="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center space-x-1.5">
              <i data-lucide="align-left" class="w-3.5 h-3.5"></i>
              <span>Phase A: Journalistic Context &amp; Industry Nuances</span>
            </div>
            <button class="toggle-narrative-btn text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1">
              <span class="toggle-text">Show Full Context</span>
              <i data-lucide="chevron-down" class="w-3.5 h-3.5 transition-transform duration-200"></i>
            </button>
          </div>

          <div class="narrative-wrapper font-serif text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
            <div class="narrative-content line-clamp-3">
              ${story.narrative ? story.narrative.split(/\r?\n\r?\n/).map(p => `<p class="mb-3">${escapeHtml(p)}</p>`).join('') : '<p class="text-slate-400 italic">No narrative provided.</p>'}
            </div>
          </div>
        </div>

        <!-- PHASE B: 5-DIMENSIONAL STRATEGIC DOSSIER -->
        <div class="space-y-3">
          <div class="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center space-x-1.5">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>Phase B: 5-Dimensional Strategic Dossier</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <!-- 1. Delta -->
            <div class="p-4 rounded-xl bg-slate-50/60 dark:bg-paper-card/40 border-l-2 border-l-emerald-500 border border-slate-200 dark:border-paper-border space-y-1">
              <span class="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">I. The Delta (What Changed)</span>
              <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.delta || 'N/A')}</p>
            </div>

            <!-- 2. Mechanism -->
            <div class="p-4 rounded-xl bg-slate-50/60 dark:bg-paper-card/40 border-l-2 border-l-amber-500 border border-slate-200 dark:border-paper-border space-y-1">
              <span class="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">II. Mechanism (How It Changed)</span>
              <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.mechanism || 'N/A')}</p>
            </div>

            <!-- 3. Strategic Impact -->
            <div class="p-4 rounded-xl bg-slate-50/60 dark:bg-paper-card/40 border-l-2 border-l-rose-500 border border-slate-200 dark:border-paper-border space-y-1">
              <span class="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">III. Strategic &amp; Channel Impact</span>
              <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.strategicImpact || 'N/A')}</p>
            </div>

            <!-- 4. Core Lesson -->
            <div class="p-4 rounded-xl bg-slate-50/60 dark:bg-paper-card/40 border-l-2 border-l-indigo-500 border border-slate-200 dark:border-paper-border space-y-1">
              <span class="font-mono text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">IV. Transferable Principle</span>
              <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.coreLesson || 'N/A')}</p>
            </div>

            <!-- 5. Lateral Transfer -->
            <div class="p-4 rounded-xl bg-slate-50/60 dark:bg-paper-card/40 border-l-2 border-l-blue-500 border border-slate-200 dark:border-paper-border space-y-1 md:col-span-2 lg:col-span-2">
              <span class="font-mono text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">V. Cross-Industry Lateral Transfer</span>
              <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.lateralTransfer || 'N/A')}</p>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-slate-100 dark:border-paper-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-2">
            <button class="copy-story-btn px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-paper-card hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-paper-border font-medium flex items-center space-x-1.5 transition-colors" data-story-id="${story.id}">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copy Dossier</span>
            </button>
            <button class="open-drawer-btn px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-paper-card hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-paper-border font-medium flex items-center space-x-1.5 transition-colors" data-story-id="${story.id}">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>Full Dossier</span>
            </button>
          </div>

          <a href="${escapeHtml(story.url)}" target="_blank" rel="noopener noreferrer" class="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium flex items-center space-x-1">
            <span>Primary Source: ${escapeHtml(story.source)}</span>
            <i data-lucide="arrow-up-right" class="w-3 h-3"></i>
          </a>
        </div>

      </article>
    `;
  }).join('');

  setupCardEvents();
  refreshIcons();
}

// ================= VIEW 2: NOTION KANBAN BOARD =================
function renderKanbanView(stories) {
  if (!elements.kanbanBoardGrid) return;

  const columns = [
    { key: 'Marketing_GTM', label: 'Marketing & GTM', roman: 'I', border: 'border-t-emerald-500' },
    { key: 'Finance_MA', label: 'Finance & M&A', roman: 'II', border: 'border-t-amber-500' },
    { key: 'Tech', label: 'Technology', roman: 'III', border: 'border-t-blue-500' },
    { key: 'Business', label: 'Corporate Strategy', roman: 'IV', border: 'border-t-purple-500' }
  ];

  elements.kanbanBoardGrid.innerHTML = columns.map(col => {
    const colStories = stories.filter(s => s.vertical === col.key);

    return `
      <div class="bg-slate-50/60 dark:bg-paper-card/40 rounded-2xl border-t-2 ${col.border} border border-slate-200 dark:border-paper-border p-4 space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-paper-border">
          <div class="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            ${col.roman}. ${col.label}
          </div>
          <span class="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
            ${colStories.length}
          </span>
        </div>

        <div class="space-y-3">
          ${colStories.length === 0 ? `
            <div class="p-6 text-center text-xs text-slate-400 italic">No dispatches in this column.</div>
          ` : colStories.map(s => `
            <div class="p-4 rounded-xl bg-white dark:bg-paper-card border border-slate-200 dark:border-paper-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 group">
              
              <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>${escapeHtml(s.source)}</span>
                <span>${escapeHtml(s.date)}</span>
              </div>

              <h4 class="font-serif font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:underline cursor-pointer" onclick="window.appOpenDrawer('${s.id}')">
                ${escapeHtml(s.headline)}
              </h4>

              <div class="flex flex-wrap gap-1">
                ${(s.signals || []).slice(0, 2).map(sig => `
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-paper-surface text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-paper-border">
                    #${escapeHtml(sig)}
                  </span>
                `).join('')}
              </div>

              <div class="pt-2 border-t border-slate-100 dark:border-paper-border flex items-center justify-between text-[11px]">
                <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1">
                  <span>Full Article</span>
                  <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
                <button onclick="window.appOpenDrawer('${s.id}')" class="text-slate-400 hover:text-slate-200 font-mono">
                  Dossier &rarr;
                </button>
              </div>

            </div>
          `).join('')}
        </div>

      </div>
    `;
  }).join('');

  refreshIcons();
}

function setupCardEvents() {
  document.querySelectorAll('.toggle-narrative-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.rounded-xl').querySelector('.narrative-content');
      const textSpan = btn.querySelector('.toggle-text');
      const icon = btn.querySelector('[data-lucide="chevron-down"]');

      if (wrapper.classList.contains('line-clamp-3')) {
        wrapper.classList.remove('line-clamp-3');
        textSpan.textContent = 'Collapse Context';
        if (icon) icon.classList.add('rotate-180');
      } else {
        wrapper.classList.add('line-clamp-3');
        textSpan.textContent = 'Show Full Context';
        if (icon) icon.classList.remove('rotate-180');
      }
    });
  });

  document.querySelectorAll('.open-drawer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const storyId = btn.dataset.storyId;
      openReaderDrawer(storyId);
    });
  });

  document.querySelectorAll('.copy-story-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const storyId = btn.dataset.storyId;
      const story = state.data.stories.find(s => s.id === storyId);
      if (story) copyStoryMarkdown(story);
    });
  });
}

// ================= VIEW 3: 5-DIMENSIONAL MATRIX =================
function renderMatrixView(stories) {
  if (!elements.matrixTableWrapper) return;

  if (stories.length === 0) {
    elements.matrixTableWrapper.innerHTML = `<p class="text-center py-8 text-slate-400">No stories match your filter criteria.</p>`;
    return;
  }

  elements.matrixTableWrapper.innerHTML = `
    <table class="w-full text-left text-xs border-collapse">
      <thead>
        <tr class="border-b border-slate-200 dark:border-paper-border text-slate-400 font-mono uppercase text-[11px] bg-slate-50 dark:bg-paper-card/40">
          <th class="p-3 w-48">Story &amp; Source</th>
          <th class="p-3 w-64 text-emerald-600 dark:text-emerald-400">I. Delta</th>
          <th class="p-3 w-64 text-amber-600 dark:text-amber-400">II. Mechanism</th>
          <th class="p-3 w-64 text-rose-600 dark:text-rose-400">III. Strategic Impact</th>
          <th class="p-3 w-64 text-indigo-500 dark:text-indigo-400">IV. Core Principle</th>
          <th class="p-3 w-64 text-blue-500 dark:text-blue-400">V. Lateral Transfer</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-paper-border">
        ${stories.map(s => `
          <tr class="hover:bg-slate-50 dark:hover:bg-paper-card/30 transition-colors align-top">
            <td class="p-3 space-y-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${s.verticalStyle?.bg} ${s.verticalStyle?.text} border ${s.verticalStyle?.border}">
                ${escapeHtml(s.verticalLabel || s.vertical)}
              </span>
              <div class="font-serif font-bold text-slate-900 dark:text-white leading-snug text-sm">
                ${escapeHtml(s.headline)}
              </div>
              <div class="pt-1">
                <a href="${escapeHtml(s.url)}" target="_blank" class="text-slate-500 hover:text-slate-900 dark:hover:text-white text-[11px] font-medium flex items-center space-x-1">
                  <span>${escapeHtml(s.source)} Article</span>
                  <i data-lucide="external-link" class="w-2.5 h-2.5"></i>
                </a>
              </div>
            </td>
            <td class="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(s.lens?.delta || 'N/A')}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(s.lens?.mechanism || 'N/A')}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(s.lens?.strategicImpact || 'N/A')}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(s.lens?.coreLesson || 'N/A')}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(s.lens?.lateralTransfer || 'N/A')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ================= VIEW 4: LEDGER VIEW =================
function renderLedgerView(stories) {
  if (!elements.ledgerTableWrapper) return;

  if (stories.length === 0) {
    elements.ledgerTableWrapper.innerHTML = `<p class="text-center py-8 text-slate-400">No records match your filter criteria.</p>`;
    return;
  }

  elements.ledgerTableWrapper.innerHTML = `
    <table class="w-full text-left text-xs border-collapse font-sans">
      <thead>
        <tr class="border-b border-slate-200 dark:border-paper-border text-slate-400 font-mono uppercase text-[11px] bg-slate-50 dark:bg-paper-card/40">
          <th class="p-2.5">Date</th>
          <th class="p-2.5">Vertical</th>
          <th class="p-2.5 min-w-[200px]">Headline</th>
          <th class="p-2.5">Source Link</th>
          <th class="p-2.5 min-w-[150px]">Signals</th>
          <th class="p-2.5 min-w-[200px]">Delta</th>
          <th class="p-2.5 min-w-[200px]">Mechanism</th>
          <th class="p-2.5 min-w-[200px]">Strategic Impact</th>
          <th class="p-2.5">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-paper-border">
        ${stories.map(s => `
          <tr class="hover:bg-slate-50 dark:hover:bg-paper-card/30 transition-colors">
            <td class="p-2.5 font-mono text-slate-400 whitespace-nowrap">${escapeHtml(s.date)}</td>
            <td class="p-2.5 whitespace-nowrap">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${s.verticalStyle?.bg} ${s.verticalStyle?.text} border ${s.verticalStyle?.border}">
                ${escapeHtml(s.verticalLabel || s.vertical)}
              </span>
            </td>
            <td class="p-2.5 font-medium text-slate-900 dark:text-white leading-snug">${escapeHtml(s.headline)}</td>
            <td class="p-2.5 whitespace-nowrap">
              <a href="${escapeHtml(s.url)}" target="_blank" class="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 font-mono text-[11px]">
                <span>${escapeHtml(s.source)}</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
            </td>
            <td class="p-2.5 font-mono text-[10px] text-slate-400">${escapeHtml((s.signals || []).join(' '))}</td>
            <td class="p-2.5 text-slate-600 dark:text-slate-300 line-clamp-2">${escapeHtml(s.lens?.delta || 'N/A')}</td>
            <td class="p-2.5 text-slate-600 dark:text-slate-300 line-clamp-2">${escapeHtml(s.lens?.mechanism || 'N/A')}</td>
            <td class="p-2.5 text-slate-600 dark:text-slate-300 line-clamp-2">${escapeHtml(s.lens?.strategicImpact || 'N/A')}</td>
            <td class="p-2.5 whitespace-nowrap">
              <button onclick="window.appOpenDrawer('${s.id}')" class="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-paper-card border border-slate-200 dark:border-paper-border rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                View
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

window.appOpenDrawer = (storyId) => openReaderDrawer(storyId);

// ================= EXECUTIVE NOTION-GRADE READER DRAWER =================
function openReaderDrawer(storyId) {
  if (!state.data) return;
  const story = state.data.stories.find(s => s.id === storyId);
  if (!story) return;

  state.activeStoryId = storyId;
  const vMeta = VERTICAL_METAS[story.vertical] || { roman: 'IV', emoji: '📄', label: story.vertical };

  elements.drawerContent.innerHTML = `
    <div class="space-y-6">
      
      <!-- Breadcrumbs -->
      <div class="flex items-center space-x-2 text-xs font-mono text-slate-400 pb-2 border-b border-slate-200 dark:border-paper-border">
        <span>Daily Business Intelligence</span>
        <span>/</span>
        <span class="text-slate-700 dark:text-slate-300 font-semibold">${escapeHtml(story.verticalLabel || story.vertical)}</span>
        <span>/</span>
        <span class="text-slate-400 truncate max-w-[150px]">${escapeHtml(story.source)}</span>
      </div>

      <!-- Headline -->
      <div class="space-y-3">
        <h2 class="font-serif font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
          ${escapeHtml(story.headline)}
        </h2>
      </div>

      <!-- Dedicated Complete Article Reference Box -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-paper-card border border-slate-200 dark:border-paper-border space-y-3 text-xs">
        <div class="flex items-center justify-between font-mono">
          <span class="font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <i data-lucide="newspaper" class="w-4 h-4"></i>
            <span>Primary Source Reference</span>
          </span>
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold">VERIFIED REPORTING</span>
        </div>

        <div class="space-y-0.5">
          <div class="font-serif font-bold text-slate-900 dark:text-white text-sm">${escapeHtml(story.headline)}</div>
          <div class="text-slate-500 dark:text-slate-400 flex items-center space-x-2 font-mono">
            <span>Publisher: ${escapeHtml(story.source)}</span>
            <span>•</span>
            <span>Date: ${escapeHtml(story.date)}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 pt-1">
          <a href="${escapeHtml(story.url)}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:opacity-90 transition-opacity">
            <span>Read Complete Article on ${escapeHtml(story.source)}</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
          <a href="${escapeHtml(story.notionUrl || 'https://app.notion.com/p/Daily-Business-Intelligence-412c9631ecc080d7966ecaeb72d3285f')}" target="_blank" rel="noopener noreferrer" class="py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
            <span>Open in Notion</span>
          </a>
        </div>
      </div>

      <!-- Properties -->
      <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50/60 dark:bg-paper-card/40 p-3.5 rounded-xl border border-slate-200 dark:border-paper-border font-mono">
        <div>
          <span class="text-slate-400 block text-[10px]">VERTICAL</span>
          <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${escapeHtml(story.verticalFullName || story.verticalLabel)}</div>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">SIGNALS</span>
          <div class="text-slate-800 dark:text-slate-200 mt-0.5 truncate">${escapeHtml((story.signals || []).join(', ') || 'N/A')}</div>
        </div>
      </div>

      <!-- Phase A Context -->
      <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-paper-border">
        <div class="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
          <i data-lucide="align-left" class="w-4 h-4"></i>
          <span>Phase A: Context Narrative (${story.narrativeWordCount} words)</span>
        </div>
        <div class="font-serif text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed space-y-4">
          ${story.narrative ? story.narrative.split(/\r?\n\r?\n/).map(p => `<p>${escapeHtml(p)}</p>`).join('') : '<p class="italic text-slate-400">No context narrative provided.</p>'}
        </div>
      </div>

      <!-- Phase B 5-D Lens -->
      <div class="space-y-3 pt-6 border-t border-slate-200 dark:border-paper-border">
        <div class="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
          <i data-lucide="layers" class="w-4 h-4"></i>
          <span>Phase B: 5-Dimensional Strategic Dossier</span>
        </div>

        <div class="space-y-3 text-xs">
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-paper-card/60 border-l-2 border-l-emerald-500 border border-slate-200 dark:border-paper-border space-y-1">
            <span class="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">I. What Changed (The Delta)</span>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.delta || 'N/A')}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-paper-card/60 border-l-2 border-l-amber-500 border border-slate-200 dark:border-paper-border space-y-1">
            <span class="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">II. Mechanism (How It Changed)</span>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.mechanism || 'N/A')}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-paper-card/60 border-l-2 border-l-rose-500 border border-slate-200 dark:border-paper-border space-y-1">
            <span class="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">III. Strategic &amp; Channel Impact</span>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.strategicImpact || 'N/A')}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-paper-card/60 border-l-2 border-l-indigo-500 border border-slate-200 dark:border-paper-border space-y-1">
            <span class="font-mono text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">IV. Core Principle</span>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.coreLesson || 'N/A')}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-paper-card/60 border-l-2 border-l-blue-500 border border-slate-200 dark:border-paper-border space-y-1">
            <span class="font-mono text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">V. Cross-Industry Lateral Transfer</span>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(story.lens?.lateralTransfer || 'N/A')}</p>
          </div>
        </div>
      </div>

    </div>
  `;

  elements.readerDrawerBackdrop.classList.remove('opacity-0', 'pointer-events-none');
  elements.readerDrawer.classList.remove('translate-x-full');
  document.body.classList.add('overflow-hidden');
  refreshIcons();
}

function closeReaderDrawer() {
  elements.readerDrawerBackdrop.classList.add('opacity-0', 'pointer-events-none');
  elements.readerDrawer.classList.add('translate-x-full');
  document.body.classList.remove('overflow-hidden');
  state.activeStoryId = null;
}

function openDiagnosticsModal() {
  elements.diagnosticsModal.classList.remove('opacity-0', 'pointer-events-none');
  elements.diagnosticsModal.querySelector('div').classList.remove('scale-95');
  document.body.classList.add('overflow-hidden');
  refreshIcons();
}

function closeDiagnosticsModal() {
  elements.diagnosticsModal.classList.add('opacity-0', 'pointer-events-none');
  elements.diagnosticsModal.querySelector('div').classList.add('scale-95');
  document.body.classList.remove('overflow-hidden');
}

function copyStoryMarkdown(story) {
  const md = `### ${story.headline}
* **Source**: ${story.source} | **Date**: ${story.date} | [Canonical URL](${story.url})
* **Signals**: ${(story.signals || []).map(s => `[${s}]`).join(' ')}

#### Comprehensive News Context & Narrative (~400 words)
${story.narrative}

#### The 5-Dimensional Strategic Analytical Lens
1. **What Changed (The Delta)**: ${story.lens?.delta}
2. **How It Changed (The Mechanism)**: ${story.lens?.mechanism}
3. **Strategic Impact**: ${story.lens?.strategicImpact}
4. **Core Lesson**: ${story.lens?.coreLesson}
5. **Cross-Industry Lateral Transfer**: ${story.lens?.lateralTransfer}
`;
  navigator.clipboard.writeText(md);
  showToast('Story dossier copied to clipboard!');
}

function copyFullBriefingMarkdown() {
  if (!state.data) return;
  const d = state.data;
  let md = `# Daily Business Intelligence Briefing: 5-Dimensional Strategic Synthesis
**Date**: ${d.briefingDate}  
**Framework**: Phase A (~400 words) + Phase B (5-D Strategic Lens)  

---

## Executive Synthesis: The Macro Cross-Currents
${(d.macroThemes || []).map((t, idx) => `${idx + 1}. **${t.title}**: ${t.summary}`).join('\n')}

---
`;

  const verticals = [
    { key: 'Marketing_GTM', title: '1. Marketing, Branding, Pricing & Channel Economics / GTM Deep Dive' },
    { key: 'Finance_MA', title: '2. Finance, M&A, Capital Allocation & Macro Policy Implications' },
    { key: 'Tech', title: '3. Technology Developments & Implementation Playbook' },
    { key: 'Business', title: '4. Corporate Strategy & Global Market Dynamics' }
  ];

  verticals.forEach(v => {
    const vStories = d.stories.filter(s => s.vertical === v.key);
    if (vStories.length > 0) {
      md += `\n## ${v.title}\n\n`;
      vStories.forEach((story, idx) => {
        md += `### Story ${idx + 1}: ${story.headline}
* **[Source | Date | URL]**: ${story.source} | ${story.date} | [${story.url}](${story.url})

#### Comprehensive News Context & Narrative (~400 words)
${story.narrative}

#### The 5-Dimensional Strategic Analytical Lens
1. **What Changed (The Delta)**: ${story.lens?.delta}
2. **How It Changed (The Mechanism)**: ${story.lens?.mechanism}
3. **Strategic Impact**: ${story.lens?.strategicImpact}
4. **Core Lesson**: ${story.lens?.coreLesson}
5. **Cross-Industry Lateral Transfer**: ${story.lens?.lateralTransfer}

---
`;
      });
    }
  });

  navigator.clipboard.writeText(md);
  showToast('Complete briefing copied to clipboard!');
}

function exportJsonData() {
  if (!state.data) return;
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `business_intelligence_${state.data.briefingDate.replace(/[\s,]+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported JSON dataset!');
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

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
