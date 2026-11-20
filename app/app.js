// Leonida Platinum — GTA VI trophy guide & tracker.
// Offline static app: loads app/data/trophies.json, saves progress in
// localStorage, exports/imports it as JSON. No network use at all.
const KEY = 'gta6-trophy-guide-v1';
const SETTINGS_KEY = 'gta6-trophy-guide-settings-v1';

const state = {
  trophies: [],
  earned: new Set(),
  hideSpoilers: true,
  view: 'checklist',
  detailId: null,
};

function loadSaved() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state.earned = new Set(JSON.parse(raw).filter((n) => typeof n === 'number'));
  } catch { state.earned = new Set(); }
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    if (typeof s.hideSpoilers === 'boolean') state.hideSpoilers = s.hideSpoilers;
  } catch { /* defaults */ }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify([...state.earned].sort((a, b) => a - b)));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ hideSpoilers: state.hideSpoilers }));
}

const $ = (id) => document.getElementById(id);
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  story: 'Story', stranger: 'Strangers', collectible: 'Collectibles', activity: 'Activities',
  combat: 'Combat & crime', exploration: 'Exploration', economy: 'Money & property',
  misc: 'Moments & choices', completion: '100% completion', platinum: 'Platinum',
};
const hidden = (t) => t.spoiler && state.hideSpoilers && !state.earned.has(t.id);

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function renderProgress() {
  const total = state.trophies.length;
  const n = state.earned.size;
  $('earnedCount').textContent = n;
  $('barFill').style.width = total ? `${Math.round((n / total) * 100)}%` : '0%';
  $('progressText').textContent = total
    ? `${Math.round((n / total) * 100)}% to the platinum — ${total - n} to go`
    : '';
  const counts = {};
  for (const t of state.trophies) {
    counts[t.grade] = counts[t.grade] ?? [0, 0];
    counts[t.grade][1] += 1;
    if (state.earned.has(t.id)) counts[t.grade][0] += 1;
  }
  $('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${counts[g][0]}/${counts[g][1]} ${GRADE_LABEL[g].toLowerCase()}`)
    .join(' · ');
  const miss = state.trophies.filter((t) => t.missable).length;
  $('missCount').textContent = `${miss} flagged`;
}

function card(t, { showGuide = true } = {}) {
  const earned = state.earned.has(t.id);
  const isHidden = hidden(t);
  const c = el('article', 'card' + (earned ? ' earned' : '') + (t.missable ? ' missable' : ''));
  const head = el('div', 'card-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${isHidden ? 'hidden story trophy' : t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(t.id);
    else state.earned.delete(t.id);
    save();
    renderAll();
  });
  head.append(box);
  const dot = el('span', `medal ${t.grade}`, GRADE_LABEL[t.grade]);
  head.append(dot);
  const title = el('h3', null, isHidden ? 'Hidden story trophy' : t.name);
  head.append(title);
  if (t.missable) head.append(el('span', 'badge miss', 'Missable'));
  c.append(head);
  c.append(el('p', 'desc', isHidden ? 'Story trophy — its name and description stay hidden until you earn it.' : t.description));
  const tags = el('p', 'tags');
  tags.append(el('span', 'tag', KIND_LABEL[t.kind] ?? t.kind));
  if (t.chapter) tags.append(el('span', 'tag', t.chapter));
  c.append(tags);
  if (showGuide && !isHidden) {
    c.append(el('p', 'guide', t.guide));
    const more = el('button', 'linklike', 'Full guide, steps & sources →');
    more.type = 'button';
    more.addEventListener('click', () => showDetail(t.id));
    c.append(more);
  } else if (showGuide && isHidden) {
    c.append(el('p', 'guide muted', 'Earn it to reveal the guide — or turn spoilers off above.'));
  }
  return c;
}

function renderChecklist() {
  const q = ($('search').value ?? '').trim().toLowerCase();
  const kind = $('kindFilter').value;
  const grade = $('gradeFilter').value;
  const status = $('statusFilter').value;
  const list = state.trophies.filter((t) => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !state.earned.has(t.id)) return false;
    if (status === 'remaining' && state.earned.has(t.id)) return false;
    if (status === 'missable' && !t.missable) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABEL[t.kind] ?? ''} ${t.chapter ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const wrap = $('cards');
  wrap.replaceChildren();
  for (const t of list) wrap.append(card(t));
  $('emptyMsg').hidden = list.length > 0;
  $('resultCount').textContent = `${list.length} of ${state.trophies.length} shown · ${state.earned.size} earned`;
}

const ROADMAP = [
  {
    phase: 'Phase 1 — Story first', when: 'Chapters 1–4 & the finale',
    tip: 'Play the main missions in order and let the story trophies come to you. Start the long grinds now (stunts, vehicles, areas) so they finish on their own later.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    phase: 'Phase 2 — Strangers & moments (before the finale)', when: 'While the story is still running',
    tip: 'Stranger strands and partner moments may not reopen after the story ends. Clear every stranger mission as it appears, and do the partner trophies (Hot Together, Retail Therapy) before the final mission.',
    ids: [22, 23, 24, 25, 26, 27, 29, 33, 34, 45, 46, 47, 48, 49, 50, 51],
  },
  {
    phase: 'Phase 3 — Activities & the counted grinds', when: 'Mid-game onward, anytime',
    tip: 'None of these can be missed. Work the shooting range to gold, win races and drone races, fish with Cal, and let the challenge counter climb to 50.',
    ids: [15, 16, 17, 18, 19, 20, 21, 32, 36, 37, 38, 39, 40, 41, 43, 44],
  },
  {
    phase: 'Phase 4 — Collectibles, money & clean-up', when: 'Late game & after the story',
    tip: 'Sweep the map region by region: 52 areas, 18 meditation spots, 100 WAiNK check-ins, card sets, 100 vehicles. Launder marked bills, spend $100,000, buy all 8 garages, register 10 vehicles — then 100% completion and the platinum.',
    ids: [28, 30, 31, 35, 42, 52, 53, 54, 55, 14, 1],
  },
];

function renderRoadmap() {
  const wrap = $('roadmap');
  wrap.replaceChildren();
  const byId = new Map(state.trophies.map((t) => [t.id, t]));
  for (const ph of ROADMAP) {
    const sec = el('section', 'phase');
    sec.append(el('h3', null, ph.phase));
    sec.append(el('p', 'muted', ph.when));
    sec.append(el('p', null, ph.tip));
    const ul = el('ul', 'phase-list');
    for (const id of ph.ids) {
      const t = byId.get(id);
      if (!t) continue;
      const li = el('li');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = state.earned.has(id);
      cb.setAttribute('aria-label', `Mark ${t.name} as earned`);
      cb.addEventListener('change', () => {
        if (cb.checked) state.earned.add(id);
        else state.earned.delete(id);
        save();
        renderAll();
      });
      li.append(cb);
      li.append(el('span', `medal ${t.grade} small`, GRADE_LABEL[t.grade]));
      const name = el('button', 'linklike phase-name', hidden(t) ? 'Hidden story trophy' : t.name);
      name.type = 'button';
      name.addEventListener('click', () => showDetail(id));
      li.append(name);
      if (t.missable) li.append(el('span', 'badge miss', 'Missable'));
      ul.append(li);
    }
    sec.append(ul);
    wrap.append(sec);
  }
}

function renderMissables() {
  const wrap = $('missables');
  wrap.replaceChildren();
  for (const t of state.trophies.filter((t) => t.missable)) wrap.append(card(t));
}

function showDetail(id) {
  const t = state.trophies.find((x) => x.id === id);
  if (!t) return;
  state.view = 'detail';
  state.detailId = id;
  const d = $('detail');
  d.replaceChildren();
  const earned = state.earned.has(id);
  const isHidden = hidden(t);
  d.append(el('h2', null, isHidden ? 'Hidden story trophy' : t.name));
  const meta = el('p', 'tags');
  meta.append(el('span', `medal ${t.grade}`, GRADE_LABEL[t.grade]));
  meta.append(el('span', 'tag', KIND_LABEL[t.kind] ?? t.kind));
  if (t.chapter) meta.append(el('span', 'tag', t.chapter));
  if (t.missable) meta.append(el('span', 'badge miss', 'Missable — do before the finale'));
  d.append(meta);
  d.append(el('p', 'desc big', isHidden ? 'Story trophy — its name and description stay hidden until you earn it.' : t.description));
  const toggle = el('button', 'primary', earned ? '✓ Earned — click to unmark' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => {
    if (state.earned.has(id)) state.earned.delete(id);
    else state.earned.add(id);
    save();
    renderAll();
    showDetail(id);
  });
  d.append(toggle);
  if (!isHidden) {
    d.append(el('h3', null, 'Guide'));
    d.append(el('p', 'guide', t.guide));
    if (t.steps?.length) {
      d.append(el('h3', null, 'Steps'));
      const ol = el('ol', 'steps');
      for (const s of t.steps) ol.append(el('li', null, s));
      d.append(ol);
    }
    d.append(el('h3', null, 'Sources'));
    const ul = el('ul', 'sources');
    for (const s of t.sources ?? []) ul.append(el('li', null, s));
    d.append(ul);
  } else {
    d.append(el('p', 'guide muted', 'Earn it to reveal the guide — or turn spoilers off on the Checklist tab.'));
  }
  switchView('detail');
}

function switchView(view) {
  state.view = view;
  for (const v of ['checklist', 'roadmap', 'missables', 'detail', 'about']) {
    $(`view-${v}`).hidden = v !== view;
  }
  document.querySelectorAll('.tabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === view || (view === 'detail' && b.dataset.view === 'checklist'));
  });
  window.scrollTo(0, 0);
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderRoadmap();
  renderMissables();
}

async function init() {
  loadSaved();
  const doc = await (await fetch('data/trophies.json')).json();
  state.trophies = doc.trophies;

  $('spoilerToggle').checked = state.hideSpoilers;
  $('spoilerToggle').addEventListener('change', (e) => {
    state.hideSpoilers = e.target.checked;
    save();
    renderAll();
    if (state.view === 'detail' && state.detailId) showDetail(state.detailId);
  });
  for (const id of ['search', 'kindFilter', 'gradeFilter', 'statusFilter']) {
    $(id).addEventListener('input', renderChecklist);
    $(id).addEventListener('change', renderChecklist);
  }
  document.querySelectorAll('.tabs button').forEach((b) => {
    b.addEventListener('click', () => switchView(b.dataset.view));
  });
  $('backBtn').addEventListener('click', () => switchView('checklist'));
  $('exportBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({
      game: 'Grand Theft Auto VI', exported_at: new Date().toISOString(),
      earned: [...state.earned].sort((x, y) => x - y),
    }, null, 2)], { type: 'application/json' }));
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ids = Array.isArray(data) ? data : data.earned;
      const valid = new Set(state.trophies.map((t) => t.id));
      state.earned = new Set(ids.filter((n) => valid.has(n)));
      save();
      renderAll();
    } catch {
      alert('That file is not a valid progress export.');
    }
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone (export first if you want a backup).')) {
      state.earned = new Set();
      save();
      renderAll();
    }
  });

  // Deep links: #/roadmap, #/missables, #/about, #/trophy/<id>
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    if (h.startsWith('trophy/')) showDetail(Number(h.slice(7)));
    else if (['roadmap', 'missables', 'about', 'checklist'].includes(h)) switchView(h);
    else switchView('checklist');
  }
  window.addEventListener('hashchange', route);

  renderAll();
  route();
}

init();
