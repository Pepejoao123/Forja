// FORJA – App Main
'use strict';

// ===== STATE =====
let settings = DB.getSettings();
let currentPage = 'home';
let workoutDraft = { name: '', muscles: [], exercises: [], note: '' };
let timerPageOpen = false;
let filterMuscle = 'Todos';
let progressPeriod = 'mes';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  setupNav();
  setupFAB();
  setupTimer();
  setupProfile();
  renderHome();
  renderWorkouts();
  renderProgress();
  renderProfile();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});

// ===== THEME =====
function applyTheme() {
  document.documentElement.setAttribute('data-theme', settings.theme);
  const toggle = document.getElementById('themeToggleCheck');
  if (toggle) toggle.checked = settings.theme === 'light';
  // update icon
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = settings.theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  DB.saveSettings(settings);
  applyTheme();
  setTimeout(() => { renderProgress(); }, 100); // redraw charts
}

// ===== NAVIGATION =====
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page)?.classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  const fab = document.getElementById('mainFab');
  if (fab) fab.style.display = page === 'treinos' || page === 'home' ? 'flex' : 'none';

  if (page === 'home') renderHome();
  if (page === 'treinos') renderWorkouts();
  if (page === 'progresso') renderProgress();
  if (page === 'perfil') renderProfile();
}

// ===== HOME =====
function renderHome() {
  const stats = DB.getStats();
  const s = settings;

  document.getElementById('greeting-name').textContent = s.name;
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-week').textContent = stats.thisWeek;
  document.getElementById('stat-streak').textContent = stats.streak;
  document.getElementById('stat-vol').textContent = stats.totalVolume >= 1000
    ? (stats.totalVolume / 1000).toFixed(1) + 't' : stats.totalVolume.toFixed(0) + 'kg';

  // streak banner
  const streakEl = document.getElementById('streak-banner');
  if (streakEl) {
    streakEl.style.display = stats.streak > 0 ? 'flex' : 'none';
    document.getElementById('streak-num').textContent = stats.streak + ' dia' + (stats.streak !== 1 ? 's' : '');
  }

  // recent workouts
  const list = DB.getWorkouts().slice(0, 5);
  const container = document.getElementById('recent-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🏋️</div>
      <div class="empty-title">Sem treinos ainda</div>
      <div class="empty-sub">Toque no + para registrar seu primeiro treino</div>
    </div>`;
    return;
  }
  container.innerHTML = list.map(w => {
    const exCount = (w.exercises||[]).length;
    const date = new Date(w.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
    return `<div class="recent-workout-card" onclick="openWorkoutDetail('${w.id}')">
      <div class="workout-icon">${muscleEmoji(w.muscles)}</div>
      <div class="workout-info">
        <div class="workout-name">${escHtml(w.name)}</div>
        <div class="workout-meta">${date} · ${exCount} exercício${exCount !== 1 ? 's' : ''} · ${(w.muscles||[]).join(', ') || 'Geral'}</div>
      </div>
      <div class="workout-badge">›</div>
    </div>`;
  }).join('');
}

// ===== WORKOUTS LIST =====
const MUSCLE_GROUPS = ['Todos','Peito','Costas','Ombros','Bíceps','Tríceps','Pernas','Abdômen','Glúteos','Cardio'];

function renderWorkouts() {
  renderFilters();
  renderWorkoutList();
}

function renderFilters() {
  const row = document.getElementById('filter-row');
  if (!row) return;
  row.innerHTML = MUSCLE_GROUPS.map(g =>
    `<button class="filter-chip ${filterMuscle === g ? 'active' : ''}" onclick="setFilter('${g}')">${g}</button>`
  ).join('');
}

function setFilter(m) {
  filterMuscle = m;
  renderFilters();
  renderWorkoutList();
}

function renderWorkoutList() {
  let list = DB.getWorkouts();
  if (filterMuscle !== 'Todos') {
    list = list.filter(w => (w.muscles||[]).includes(filterMuscle));
  }
  const container = document.getElementById('workout-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">💪</div>
      <div class="empty-title">Nenhum treino aqui</div>
      <div class="empty-sub">Adicione seu primeiro treino de ${filterMuscle === 'Todos' ? 'qualquer grupo' : filterMuscle}</div>
    </div>`;
    return;
  }
  container.innerHTML = list.map(w => {
    const exCount = (w.exercises||[]).length;
    const date = new Date(w.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'2-digit' });
    return `<div class="workout-list-item" onclick="openWorkoutDetail('${w.id}')">
      <div class="workout-icon">${muscleEmoji(w.muscles)}</div>
      <div class="wl-info">
        <div class="wl-name">${escHtml(w.name)}</div>
        <div class="wl-tags">${(w.muscles||[]).map(m => `<span class="wl-tag">${m}</span>`).join('')}</div>
        <div class="wl-meta">${date} · ${exCount} exercício${exCount !== 1 ? 's' : ''}</div>
      </div>
      <div class="wl-arrow">›</div>
    </div>`;
  }).join('');
}

// ===== ADD WORKOUT DRAWER =====
function setupFAB() {
  const fab = document.getElementById('mainFab');
  if (fab) fab.addEventListener('click', openAddWorkout);
}

function openAddWorkout() {
  workoutDraft = { name: '', muscles: [], exercises: [], note: '' };
  renderDraft();
  document.getElementById('addOverlay').classList.add('open');
}

function closeAddWorkout() {
  document.getElementById('addOverlay').classList.remove('open');
}

function renderDraft() {
  document.getElementById('wName').value = workoutDraft.name;
  document.getElementById('wNote').value = workoutDraft.note;
  // muscles checkboxes
  const mc = document.getElementById('muscle-checks');
  if (mc) {
    mc.innerHTML = MUSCLE_GROUPS.filter(g => g !== 'Todos').map(g =>
      `<label style="display:flex;align-items:center;gap:6px;font-size:14px;color:var(--text2);cursor:pointer;">
        <input type="checkbox" value="${g}" ${workoutDraft.muscles.includes(g) ? 'checked' : ''}
          onchange="toggleMuscle('${g}',this.checked)" style="accent-color:var(--accent)"> ${g}
      </label>`
    ).join('');
  }
  renderExercises();
}

function toggleMuscle(m, checked) {
  if (checked) { if (!workoutDraft.muscles.includes(m)) workoutDraft.muscles.push(m); }
  else workoutDraft.muscles = workoutDraft.muscles.filter(x => x !== m);
}

function renderExercises() {
  const el = document.getElementById('exercises-list');
  if (!el) return;
  el.innerHTML = workoutDraft.exercises.map((ex, ei) => `
    <div class="exercise-item">
      <div class="exercise-item-header">
        <span class="exercise-item-name">Exercício ${ei + 1}</span>
        <button class="delete-ex-btn" onclick="removeExercise(${ei})">✕</button>
      </div>
      <div class="field">
        <input type="text" placeholder="Nome (ex: Supino reto)" value="${escHtml(ex.name)}"
          oninput="updateExName(${ei},this.value)">
      </div>
      ${ex.sets.map((s, si) => `
        <div class="sets-grid" style="margin-bottom:8px;">
          <div class="set-field field">
            <label>Série ${si+1}</label>
            <input type="number" placeholder="Reps" value="${s.reps||''}" min="0"
              oninput="updateSet(${ei},${si},'reps',this.value)">
          </div>
          <div class="set-field field">
            <label>Peso (kg)</label>
            <input type="number" placeholder="0" value="${s.weight||''}" min="0" step="0.5"
              oninput="updateSet(${ei},${si},'weight',this.value)">
          </div>
          <div class="set-field field">
            <label>Obs</label>
            <input type="text" placeholder="—" value="${escHtml(s.obs||'')}"
              oninput="updateSet(${ei},${si},'obs',this.value)">
          </div>
        </div>
      `).join('')}
      <button class="btn-secondary" style="font-size:13px;padding:8px;" onclick="addSet(${ei})">+ Série</button>
    </div>
  `).join('');
}

function addExercise() {
  workoutDraft.exercises.push({ name: '', sets: [{ reps:'', weight:'', obs:'' }] });
  renderExercises();
}

function removeExercise(i) {
  workoutDraft.exercises.splice(i, 1);
  renderExercises();
}

function addSet(ei) {
  workoutDraft.exercises[ei].sets.push({ reps:'', weight:'', obs:'' });
  renderExercises();
}

function updateExName(ei, val) { workoutDraft.exercises[ei].name = val; }
function updateSet(ei, si, field, val) { workoutDraft.exercises[ei].sets[si][field] = val; }

function saveWorkout() {
  const name = document.getElementById('wName').value.trim();
  if (!name) { showToast('Digite um nome para o treino'); return; }
  workoutDraft.name = name;
  workoutDraft.note = document.getElementById('wNote').value.trim();
  // clean empty exercises
  workoutDraft.exercises = workoutDraft.exercises.filter(e => e.name.trim());
  DB.addWorkout({ ...workoutDraft });
  closeAddWorkout();
  showToast('✅ Treino salvo!');
  renderHome();
  renderWorkouts();
}

// ===== WORKOUT DETAIL =====
function openWorkoutDetail(id) {
  const w = DB.getWorkout(id);
  if (!w) return;
  const overlay = document.getElementById('detailOverlay');
  const content = document.getElementById('detailContent');

  const date = new Date(w.createdAt).toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const totalVol = (w.exercises||[]).reduce((a,e) =>
    a + (e.sets||[]).reduce((b,s) => b + (+(s.weight||0))*(+(s.reps||0)), 0), 0);

  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-name">${escHtml(w.name)}</div>
      <div class="detail-meta">
        <span class="detail-chip">${date}</span>
        ${totalVol > 0 ? `<span class="detail-chip">Vol: ${totalVol.toFixed(0)}kg</span>` : ''}
        ${(w.muscles||[]).map(m => `<span class="detail-chip">${m}</span>`).join('')}
      </div>
      ${w.note ? `<p style="font-size:14px;color:var(--text2);margin-top:12px;">${escHtml(w.note)}</p>` : ''}
    </div>
    ${(w.exercises||[]).length === 0 ? '<p style="color:var(--text2);font-size:14px;">Nenhum exercício registrado.</p>' :
      (w.exercises||[]).map(ex => `
        <div class="exercise-section">
          <div class="ex-section-name">${escHtml(ex.name)}</div>
          <table class="sets-table">
            <thead><tr><th>Série</th><th>Reps</th><th>Peso</th><th>Obs</th></tr></thead>
            <tbody>
              ${(ex.sets||[]).map((s,i) => `
                <tr>
                  <td>${i+1}</td>
                  <td>${s.reps || '—'}</td>
                  <td>${s.weight ? s.weight + 'kg' : '—'}</td>
                  <td style="font-size:12px;color:var(--text2);">${s.obs || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')
    }
    <button class="btn-secondary" style="margin-top:16px;color:#e05040;border-color:#e05040;" onclick="deleteWorkout('${w.id}')">
      🗑 Excluir treino
    </button>
  `;
  overlay.classList.add('open');
}

function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
}

function deleteWorkout(id) {
  if (!confirm('Excluir este treino?')) return;
  DB.deleteWorkout(id);
  closeDetail();
  showToast('Treino excluído');
  renderHome();
  renderWorkouts();
  renderProgress();
}

// ===== TIMER =====
function setupTimer() {
  const dur = settings.restTime || 90;
  Timer.setDuration(dur);

  Timer.onTick((rem, total) => {
    updateTimerDisplay(rem, total);
    updateMiniTimer(rem);
  });

  Timer.onEnd(() => {
    showToast('⏱ Descanso finalizado!');
    updateTimerDisplay(0, Timer.getDuration());
    hideMiniTimer();
  });

  // presets click
  document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseInt(btn.dataset.seconds);
      document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('customMin').value = Math.floor(s / 60);
      document.getElementById('customSec').value = s % 60;
      Timer.setDuration(s);
      Timer.reset();
      updateTimerDisplay(s, s);
    });
  });

  document.getElementById('customMin')?.addEventListener('input', applyCustomTime);
  document.getElementById('customSec')?.addEventListener('input', applyCustomTime);

  document.getElementById('timerStartBtn')?.addEventListener('click', () => {
    if (Timer.isRunning()) {
      Timer.pause();
      document.getElementById('timerStartBtn').textContent = 'Retomar';
    } else {
      Timer.start();
      document.getElementById('timerStartBtn').textContent = 'Pausar';
      showMiniTimer();
    }
  });

  document.getElementById('timerResetBtn')?.addEventListener('click', () => {
    Timer.reset();
    document.getElementById('timerStartBtn').textContent = 'Iniciar';
    hideMiniTimer();
  });

  // init display
  updateTimerDisplay(dur, dur);
}

function applyCustomTime() {
  const m = parseInt(document.getElementById('customMin')?.value || 0);
  const s = parseInt(document.getElementById('customSec')?.value || 0);
  const total = m * 60 + s;
  if (total > 0) {
    document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('selected'));
    Timer.setDuration(total);
    Timer.reset();
    updateTimerDisplay(total, total);
  }
}

function updateTimerDisplay(rem, total) {
  const display = document.getElementById('timerValue');
  if (display) display.textContent = Timer.formatTime(rem);

  // ring
  const ring = document.getElementById('timerProgressRing');
  if (ring) {
    const r = 88;
    const circ = 2 * Math.PI * r;
    const pct = total > 0 ? rem / total : 1;
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ * (1 - pct);
  }
}

function showMiniTimer() {
  document.getElementById('timerFab').style.display = 'block';
}
function hideMiniTimer() {
  document.getElementById('timerFab').style.display = 'none';
}
function updateMiniTimer(rem) {
  const el = document.getElementById('miniTimerVal');
  if (el) el.textContent = Timer.formatTime(rem);
}

// ===== PROGRESS =====
function setProgressPeriod(p) {
  progressPeriod = p;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.toggle('active', b.dataset.period === p));
  renderProgress();
}

function renderProgress() {
  const stats = DB.getStats();

  // heatmap
  const hm = document.getElementById('heatmap-grid');
  if (hm) {
    hm.innerHTML = stats.heatmap.map(d => {
      const lvl = d.count === 0 ? 0 : d.count === 1 ? 1 : d.count === 2 ? 2 : d.count >= 3 ? 3 : 4;
      return `<div class="heatmap-day level-${lvl}" title="${d.date}: ${d.count} treino(s)"></div>`;
    }).join('');
  }

  // PRs
  const prList = document.getElementById('pr-list');
  if (prList) {
    const entries = Object.entries(stats.prs).sort((a,b) => b[1]-a[1]).slice(0,8);
    prList.innerHTML = entries.length === 0
      ? '<p style="color:var(--text2);font-size:14px;">Sem PRs registrados ainda.</p>'
      : entries.map(([name, kg]) =>
          `<div class="pr-item">
            <span class="pr-name">${escHtml(name)}</span>
            <span class="pr-value">${kg}<span class="pr-unit">kg</span></span>
          </div>`
        ).join('');
  }

  // muscle bars
  const mbEl = document.getElementById('muscle-bars');
  if (mbEl) {
    const entries = Object.entries(stats.muscles).sort((a,b) => b[1]-a[1]).slice(0,6);
    const maxM = Math.max(...entries.map(e => e[1]), 1);
    mbEl.innerHTML = entries.length === 0
      ? '<p style="color:var(--text2);font-size:14px;">Treine para ver seus grupos favoritos.</p>'
      : entries.map(([m, n]) => `
          <div class="muscle-bar-item">
            <div class="muscle-bar-header">
              <span class="muscle-bar-name">${m}</span>
              <span class="muscle-bar-count">${n} treino${n!==1?'s':''}</span>
            </div>
            <div class="muscle-bar-track">
              <div class="muscle-bar-fill" style="width:${(n/maxM*100).toFixed(0)}%"></div>
            </div>
          </div>
        `).join('');
  }

  // charts (with slight delay for layout)
  setTimeout(() => {
    const { weeklyVolume } = stats;
    Charts.drawBarChart('chartVolume', weeklyVolume.map(w => w.label), weeklyVolume.map(w => w.vol));
    Charts.drawLineChart('chartFreq', weeklyVolume.map(w => w.label), weeklyVolume.map(w => w.vol > 0 ? 1 : 0));
  }, 50);
}

// ===== PROFILE =====
function renderProfile() {
  document.getElementById('profileName').textContent = settings.name;
  const stats = DB.getStats();
  document.getElementById('profileTotal').textContent = stats.total + ' treinos';
  const toggle = document.getElementById('themeToggleCheck');
  if (toggle) toggle.checked = settings.theme === 'light';
}

function setupProfile() {
  document.getElementById('profileNameInput')?.addEventListener('input', (e) => {
    settings.name = e.target.value || 'Atleta';
    DB.saveSettings(settings);
    document.getElementById('profileName').textContent = settings.name;
    document.getElementById('greeting-name').textContent = settings.name;
  });

  document.getElementById('restTimeInput')?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    if (v > 0) {
      settings.restTime = v;
      DB.saveSettings(settings);
      Timer.setDuration(v);
      Timer.reset();
      updateTimerDisplay(v, v);
    }
  });
}

function openProfileNameEdit() {
  const input = document.getElementById('profileNameInput');
  if (input) {
    input.value = settings.name;
    input.focus();
  }
}

// ===== UTILS =====
function muscleEmoji(muscles) {
  const map = { Peito:'🫀', Costas:'🏋️', Ombros:'🔱', Bíceps:'💪', Tríceps:'💪', Pernas:'🦵', Abdômen:'🎯', Glúteos:'🍑', Cardio:'🏃' };
  if (!muscles || muscles.length === 0) return '🏋️';
  return map[muscles[0]] || '🏋️';
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
