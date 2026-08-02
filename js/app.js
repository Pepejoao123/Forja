// FORJA – App Main v2
'use strict';

// ===== FRASES MOTIVACIONAIS =====
const QUOTES = [
  { text: "A dor que você sente hoje é a força que você terá amanhã.", author: "— Arnold Schwarzenegger" },
  { text: "Não conte os dias. Faça os dias contarem.", author: "— Muhammad Ali" },
  { text: "O único treino ruim é aquele que não aconteceu.", author: "— FORJA" },
  { text: "Seu corpo consegue quase tudo. É sua mente que você precisa convencer.", author: "— FORJA" },
  { text: "Disciplina é fazer o que precisa ser feito, mesmo quando não quer.", author: "— FORJA" },
  { text: "Cada série te aproxima da melhor versão de você.", author: "— FORJA" },
  { text: "Forje seu corpo. Forje sua mente. Forje seu caráter.", author: "— FORJA" },
  { text: "O ferro não mente. Coloque mais peso ou fica onde está.", author: "— FORJA" },
  { text: "Sucessos são a soma de pequenos esforços repetidos dia após dia.", author: "— Robert Collier" },
  { text: "Levante pesos, não desculpas.", author: "— FORJA" },
  { text: "Um ano de treino consistente muda mais do que uma vida de desculpas.", author: "— FORJA" },
  { text: "Se parece difícil, é porque você está crescendo.", author: "— FORJA" },
  { text: "O suor de hoje é o resultado de amanhã.", author: "— FORJA" },
  { text: "Não pare quando estiver cansado. Pare quando terminar.", author: "— FORJA" },
  { text: "Você não precisa ser extraordinário para começar, mas precisa começar para ser extraordinário.", author: "— Zig Ziglar" },
  { text: "Treine como se ninguém estivesse assistindo. Apareça como se todos estivessem.", author: "— FORJA" },
  { text: "A consistência bate o talento quando o talento não é consistente.", author: "— FORJA" },
  { text: "Músculos não são construídos na academia. São construídos na recuperação.", author: "— FORJA" },
  { text: "Seu maior competidor é você de ontem.", author: "— FORJA" },
  { text: "Força não vem do que você consegue fazer. Vem de superar o que você achava impossível.", author: "— Rikki Rogers" },
  { text: "A academia é cara. Ser fraco também é. Escolha seu investimento.", author: "— FORJA" },
  { text: "Uma hora de treino é 4% do seu dia. Sem desculpas.", author: "— FORJA" },
  { text: "Quando você quiser desistir, lembre do motivo que te fez começar.", author: "— FORJA" },
  { text: "O corpo é seu templo. Trate-o com respeito e ele te servirá com força.", author: "— FORJA" },
  { text: "Resultados não acontecem da noite pro dia. Mas acontecem todos os dias.", author: "— FORJA" },
  { text: "Cada gota de suor é uma vitória silenciosa.", author: "— FORJA" },
  { text: "A diferença entre quem consegue e quem não consegue é a vontade de tentar.", author: "— FORJA" },
  { text: "Push harder than yesterday, if you want a different tomorrow.", author: "— FORJA" },
  { text: "Você está a um treino de distância de um bom humor.", author: "— FORJA" },
  { text: "O segredo é que não existe segredo. Treino, dieta, consistência.", author: "— FORJA" },
  { text: "Seja mais forte do que suas desculpas.", author: "— FORJA" },
  { text: "Cada repetição conta. Cada dia importa.", author: "— FORJA" },
  { text: "O único lugar onde sucesso vem antes de trabalho é no dicionário.", author: "— Vince Lombardi" },
  { text: "Treine a mente para ser mais forte que as emoções.", author: "— FORJA" },
  { text: "Acordar cedo, treinar pesado, dormir bem. Repita.", author: "— FORJA" },
  { text: "A jornada de mil quilômetros começa com um único passo — ou uma única série.", author: "— FORJA" },
  { text: "Pequenas melhorias diárias resultam em resultados surpreendentes.", author: "— FORJA" },
  { text: "Sua limitação é só a sua imaginação.", author: "— FORJA" },
  { text: "Dores musculares são o som do seu corpo crescendo.", author: "— FORJA" },
  { text: "Nunca se arrependa de um treino feito.", author: "— FORJA" },
  { text: "O ferro é honesto. Ele pesa o mesmo toda vez. Quem muda é você.", author: "— FORJA" },
  { text: "Transformação não é evento. É processo.", author: "— FORJA" },
  { text: "Você não perde um treino. Você perde confiança, progresso e momentum.", author: "— FORJA" },
  { text: "A academia te ensina mais do que levantar peso. Te ensina a não desistir.", author: "— FORJA" },
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 864e5);
  return QUOTES[day % QUOTES.length];
}

// ===== STATE =====
let settings = DB.getSettings();
let currentPage = 'home';
let workoutDraft = { name: '', muscles: [], exercises: [], note: '' };
let filterMuscle = 'Todos';
let activeWorkout = null; // { templateId, name, exercises: [{name, sets:[{reps,weight,obs,done}], done}] }

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();

  // First time? show onboarding
  if (settings.firstTime || !settings.name) {
    document.getElementById('onboardingOverlay').classList.add('open');
    return;
  }

  bootApp();
});

function bootApp() {
  setupNav();
  setupFAB();
  setupTimer();
  setupProfile();
  renderHome();
  renderWorkouts();
  renderProgress();
  renderProfile();
  checkActiveWorkoutBar();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// ===== ONBOARDING =====
function finishOnboarding() {
  const name = document.getElementById('onboardingName').value.trim();
  if (!name) { document.getElementById('onboardingName').focus(); return; }
  settings.name = name;
  settings.firstTime = false;
  DB.saveSettings(settings);
  document.getElementById('onboardingOverlay').classList.remove('open');

  // Ask for notification permission right after onboarding
  Timer.requestNotificationPermission();

  bootApp();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('onboardingOverlay')?.classList.contains('open')) {
    finishOnboarding();
  }
});

// ===== THEME =====
function applyTheme() {
  document.documentElement.setAttribute('data-theme', settings.theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = settings.theme === 'dark' ? '☀️' : '🌙';
  const check = document.getElementById('themeToggleCheck');
  if (check) check.checked = settings.theme === 'light';
}

function toggleTheme() {
  settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  DB.saveSettings(settings);
  applyTheme();
  setTimeout(() => renderProgress(), 100);
}

// ===== NAVIGATION =====
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page)?.classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  const fab = document.getElementById('mainFab');
  if (fab) fab.style.display = (page === 'treinos' || page === 'home') ? 'flex' : 'none';

  if (page === 'home') renderHome();
  if (page === 'treinos') renderWorkouts();
  if (page === 'progresso') renderProgress();
  if (page === 'perfil') renderProfile();
  if (page === 'planner') renderPlanner();
}

// ===== HOME =====
function renderHome() {
  const stats = DB.getStats();
  document.getElementById('greeting-name').textContent = settings.name;

  // Daily quote
  const q = getDailyQuote();
  const qEl = document.getElementById('daily-quote');
  if (qEl) {
    qEl.innerHTML = `<div class="quote-text">"${q.text}"</div><div class="quote-author">${q.author}</div>`;
  }

  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-week').textContent = stats.thisWeek;
  document.getElementById('stat-streak').textContent = stats.streak;
  document.getElementById('stat-vol').textContent = stats.totalVolume >= 1000
    ? (stats.totalVolume / 1000).toFixed(1) + 't' : stats.totalVolume.toFixed(0) + 'kg';

  const streakEl = document.getElementById('streak-banner');
  if (streakEl) {
    streakEl.style.display = stats.streak > 0 ? 'flex' : 'none';
    document.getElementById('streak-num').textContent = stats.streak + ' dia' + (stats.streak !== 1 ? 's' : '');
  }

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

function setFilter(m) { filterMuscle = m; renderFilters(); renderWorkoutList(); }

function renderWorkoutList() {
  let list = DB.getWorkouts();
  if (filterMuscle !== 'Todos') list = list.filter(w => (w.muscles||[]).includes(filterMuscle));
  const container = document.getElementById('workout-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">💪</div>
      <div class="empty-title">Nenhum treino aqui</div>
      <div class="empty-sub">Adicione seu primeiro treino</div>
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

// ===== ADD WORKOUT =====
function setupFAB() {
  document.getElementById('mainFab')?.addEventListener('click', openAddWorkout);
}

function openAddWorkout() {
  workoutDraft = { name: '', muscles: [], exercises: [], note: '' };
  renderDraft();
  document.getElementById('addOverlay').classList.add('open');
}

function closeAddWorkout() { document.getElementById('addOverlay').classList.remove('open'); }

function renderDraft() {
  document.getElementById('wName').value = workoutDraft.name;
  document.getElementById('wNote').value = workoutDraft.note;
  const mc = document.getElementById('muscle-checks');
  if (mc) {
    mc.innerHTML = MUSCLE_GROUPS.filter(g => g !== 'Todos').map(g =>
      `<label style="display:flex;align-items:center;gap:6px;font-size:14px;color:var(--text2);cursor:pointer;">
        <input type="checkbox" value="${g}" ${workoutDraft.muscles.includes(g)?'checked':''}
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

function addExercise() { workoutDraft.exercises.push({ name: '', sets: [{ reps:'', weight:'', obs:'' }] }); renderExercises(); }
function removeExercise(i) { workoutDraft.exercises.splice(i, 1); renderExercises(); }
function addSet(ei) { workoutDraft.exercises[ei].sets.push({ reps:'', weight:'', obs:'' }); renderExercises(); }
function updateExName(ei, val) { workoutDraft.exercises[ei].name = val; }
function updateSet(ei, si, field, val) { workoutDraft.exercises[ei].sets[si][field] = val; }

function saveWorkout() {
  const name = document.getElementById('wName').value.trim();
  if (!name) { showToast('Digite um nome para o treino'); return; }
  workoutDraft.name = name;
  workoutDraft.note = document.getElementById('wNote').value.trim();
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
              ${(ex.sets||[]).map((s,i) => `<tr>
                <td>${i+1}</td><td>${s.reps||'—'}</td>
                <td>${s.weight?s.weight+'kg':'—'}</td>
                <td style="font-size:12px;color:var(--text2);">${s.obs||'—'}</td>
              </tr>`).join('')}
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

function closeDetail() { document.getElementById('detailOverlay').classList.remove('open'); }

function deleteWorkout(id) {
  if (!confirm('Excluir este treino?')) return;
  DB.deleteWorkout(id);
  closeDetail();
  showToast('Treino excluído');
  renderHome(); renderWorkouts(); renderProgress();
}

// ===== PLANNER (TREINOS PROGRAMADOS) =====
function renderPlanner() {
  const templates = DB.getTemplates();
  const container = document.getElementById('template-list');
  if (!container) return;

  if (templates.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-title">Sem treinos programados</div>
      <div class="empty-sub">Crie um template para começar treinos com check rápido</div>
    </div>`;
    return;
  }

  container.innerHTML = templates.map(t => {
    const exCount = (t.exercises||[]).length;
    return `<div class="template-card">
      <div class="template-header" onclick="toggleTemplateExpand('tpl-ex-${t.id}')">
        <div class="template-icon">${muscleEmoji(t.muscles)}</div>
        <div class="template-info">
          <div class="template-name">${escHtml(t.name)}</div>
          <div class="template-meta">${exCount} exercício${exCount!==1?'s':''} · ${(t.muscles||[]).join(', ')||'Geral'}</div>
        </div>
        <div class="template-actions">
          <button class="tpl-btn" onclick="event.stopPropagation();deleteTemplate('${t.id}')" title="Excluir">🗑</button>
          <button class="tpl-btn start-tpl" onclick="event.stopPropagation();startActiveWorkout('${t.id}')" title="Iniciar treino">▶</button>
        </div>
      </div>
      <div class="template-exercises" id="tpl-ex-${t.id}">
        ${(t.exercises||[]).map(ex => `
          <div class="tpl-ex-item">
            <div class="tpl-ex-name">${escHtml(ex.name)}</div>
            <div class="tpl-ex-meta">${ex.sets.length} série${ex.sets.length!==1?'s':''} · ${ex.sets[0]?.weight||'?'}kg · ${ex.sets[0]?.reps||'?'} reps</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleTemplateExpand(id) {
  document.getElementById(id)?.classList.toggle('open');
}

function openAddTemplate() {
  workoutDraft = { name: '', muscles: [], exercises: [], note: '' };
  document.getElementById('addDrawerTitle').textContent = 'Novo Template';
  document.getElementById('saveWorkoutBtn').onclick = saveAsTemplate;
  renderDraft();
  document.getElementById('addOverlay').classList.add('open');
}

function saveAsTemplate() {
  const name = document.getElementById('wName').value.trim();
  if (!name) { showToast('Digite um nome para o template'); return; }
  workoutDraft.name = name;
  workoutDraft.note = document.getElementById('wNote').value.trim();
  workoutDraft.exercises = workoutDraft.exercises.filter(e => e.name.trim());
  DB.addTemplate({ ...workoutDraft });
  closeAddWorkout();
  showToast('📋 Template salvo!');
  renderPlanner();
}

function deleteTemplate(id) {
  if (!confirm('Excluir este template?')) return;
  DB.deleteTemplate(id);
  renderPlanner();
  showToast('Template excluído');
}

// ===== ACTIVE WORKOUT (check mode) =====
function startActiveWorkout(templateId) {
  const t = DB.getTemplate(templateId);
  if (!t) return;

  activeWorkout = {
    templateId,
    name: t.name,
    muscles: t.muscles,
    note: t.note || '',
    exercises: t.exercises.map(ex => ({
      name: ex.name,
      done: false,
      sets: ex.sets.map(s => ({ ...s, done: false }))
    }))
  };

  saveActiveWorkoutState();
  navigateTo('ativo');
  renderActiveWorkout();
  checkActiveWorkoutBar();
}

function saveActiveWorkoutState() {
  if (activeWorkout) localStorage.setItem('forja_active', JSON.stringify(activeWorkout));
  else localStorage.removeItem('forja_active');
}

function loadActiveWorkoutState() {
  try { return JSON.parse(localStorage.getItem('forja_active') || 'null'); } catch { return null; }
}

function checkActiveWorkoutBar() {
  activeWorkout = loadActiveWorkoutState();
  const bar = document.getElementById('activeWorkoutBar');
  if (!bar) return;
  if (activeWorkout) {
    bar.classList.add('open');
    const nameEl = document.getElementById('awbName');
    if (nameEl) nameEl.textContent = activeWorkout.name;
    // show header offset
    document.querySelector('.app-header').style.marginTop = '48px';
  } else {
    bar.classList.remove('open');
    document.querySelector('.app-header').style.marginTop = '';
  }
}

function renderActiveWorkout() {
  if (!activeWorkout) return;
  const container = document.getElementById('active-workout-container');
  if (!container) return;

  document.getElementById('active-workout-name').textContent = activeWorkout.name;

  const total = activeWorkout.exercises.length;
  const done = activeWorkout.exercises.filter(e => e.done).length;
  document.getElementById('active-progress-text').textContent = `${done}/${total} exercícios`;

  const pct = total > 0 ? (done/total*100) : 0;
  const bar = document.getElementById('active-progress-bar');
  if (bar) bar.style.width = pct + '%';

  container.innerHTML = activeWorkout.exercises.map((ex, ei) => `
    <div class="active-ex-card ${ex.done ? 'done' : ''}" id="aex-${ei}">
      <div class="active-ex-header">
        <div class="active-ex-check ${ex.done ? 'checked' : ''}" onclick="toggleExDone(${ei})">
          ${ex.done ? '✓' : ''}
        </div>
        <div class="active-ex-name">${escHtml(ex.name)}</div>
        <div class="active-ex-toggle" onclick="toggleActiveSetTable(${ei})">≡</div>
      </div>
      <div class="active-sets-table" id="asets-${ei}">
        <div class="active-sets-header">
          <span>#</span><span>Reps</span><span>Kg</span><span>Obs</span><span>✓</span>
        </div>
        ${ex.sets.map((s, si) => `
          <div class="active-set-row" id="asr-${ei}-${si}">
            <div class="active-set-num">${si+1}</div>
            <input type="number" placeholder="Reps" value="${s.reps||''}" min="0"
              oninput="updateActiveSet(${ei},${si},'reps',this.value)">
            <input type="number" placeholder="Kg" value="${s.weight||''}" min="0" step="0.5"
              oninput="updateActiveSet(${ei},${si},'weight',this.value)">
            <input type="text" placeholder="—" value="${escHtml(s.obs||'')}"
              oninput="updateActiveSet(${ei},${si},'obs',this.value)">
            <div class="set-check-btn ${s.done?'done':''}" onclick="toggleSetDone(${ei},${si})">
              ${s.done ? '✓' : '○'}
            </div>
          </div>
        `).join('')}
        <button class="rest-quick-btn" onclick="startQuickRest()">⏱ Iniciar descanso</button>
      </div>
    </div>
  `).join('');
}

function toggleActiveSetTable(ei) {
  document.getElementById(`asets-${ei}`)?.classList.toggle('open');
}

function toggleExDone(ei) {
  if (!activeWorkout) return;
  activeWorkout.exercises[ei].done = !activeWorkout.exercises[ei].done;
  saveActiveWorkoutState();
  renderActiveWorkout();
}

function toggleSetDone(ei, si) {
  if (!activeWorkout) return;
  activeWorkout.exercises[ei].sets[si].done = !activeWorkout.exercises[ei].sets[si].done;
  // auto-check exercise if all sets done
  const allDone = activeWorkout.exercises[ei].sets.every(s => s.done);
  if (allDone) activeWorkout.exercises[ei].done = true;
  saveActiveWorkoutState();
  renderActiveWorkout();
}

function updateActiveSet(ei, si, field, val) {
  if (!activeWorkout) return;
  activeWorkout.exercises[ei].sets[si][field] = val;
  saveActiveWorkoutState();
}

function startQuickRest() {
  const secs = settings.restTime || 90;
  Timer.startRest(secs);
  showToast(`⏱ Descanso de ${Timer.formatTime(secs)} iniciado`);
  showMiniTimer();
  navigateTo('timer');
}

function finishActiveWorkout() {
  if (!activeWorkout) return;
  if (!confirm('Finalizar e salvar este treino?')) return;

  // Build workout from active state
  const workout = {
    name: activeWorkout.name,
    muscles: activeWorkout.muscles || [],
    note: activeWorkout.note || '',
    exercises: activeWorkout.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.map(s => ({ reps: s.reps||'', weight: s.weight||'', obs: s.obs||'' }))
    })).filter(ex => ex.name)
  };

  DB.addWorkout(workout);
  activeWorkout = null;
  saveActiveWorkoutState();
  checkActiveWorkoutBar();
  showToast('🏆 Treino finalizado e salvo!');
  navigateTo('home');
  renderHome();
}

function abandonActiveWorkout() {
  if (!confirm('Abandonar treino atual?')) return;
  activeWorkout = null;
  saveActiveWorkoutState();
  checkActiveWorkoutBar();
  navigateTo('planner');
}

// ===== TIMER =====
function setupTimer() {
  const dur = settings.restTime || 90;
  Timer.setDuration(dur);
  // Sync custom input fields to match initial duration (don't trigger applyCustomTime)
  const minEl = document.getElementById('customMin');
  const secEl = document.getElementById('customSec');
  if (minEl) minEl.value = Math.floor(dur / 60);
  if (secEl) secEl.value = dur % 60;

  Timer.onTick((rem, total) => {
    updateTimerDisplay(rem, total);
    updateMiniTimer(rem);
  });

  Timer.onEnd(() => {
    showToast('⏱ Descanso finalizado!');
    updateTimerDisplay(0, Timer.getDuration());
    hideMiniTimer();
  });

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

  document.getElementById('customMin')?.addEventListener('change', applyCustomTime);
  document.getElementById('customSec')?.addEventListener('change', applyCustomTime);

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

  updateTimerDisplay(dur, dur);
}

function applyCustomTime() {
  const mRaw = document.getElementById('customMin')?.value;
  const sRaw = document.getElementById('customSec')?.value;
  if (mRaw === '' && sRaw === '') return; // ignore if both blank
  const m = parseInt(mRaw || 0);
  const s = parseInt(sRaw || 0);
  const total = m * 60 + s;
  if (total > 0 && !Timer.isRunning()) {
    document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('selected'));
    Timer.setDuration(total);
    Timer.reset();
    updateTimerDisplay(total, total);
  }
}

function updateTimerDisplay(rem, total) {
  const display = document.getElementById('timerValue');
  if (display) display.textContent = Timer.formatTime(rem);
  const ring = document.getElementById('timerProgressRing');
  if (ring) {
    const r = 88, circ = 2 * Math.PI * r;
    const pct = total > 0 ? rem / total : 1;
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ * (1 - pct);
  }
}

function showMiniTimer() { document.getElementById('timerFab').style.display = 'block'; }
function hideMiniTimer() { document.getElementById('timerFab').style.display = 'none'; }
function updateMiniTimer(rem) {
  const el = document.getElementById('miniTimerVal');
  if (el) el.textContent = Timer.formatTime(rem);
}

// ===== PROGRESS =====
function renderProgress() {
  const stats = DB.getStats();
  const hm = document.getElementById('heatmap-grid');
  if (hm) {
    hm.innerHTML = stats.heatmap.map(d => {
      const lvl = d.count === 0 ? 0 : d.count === 1 ? 1 : d.count === 2 ? 2 : 3;
      return `<div class="heatmap-day level-${lvl}" title="${d.date}: ${d.count}"></div>`;
    }).join('');
  }
  const prList = document.getElementById('pr-list');
  if (prList) {
    const entries = Object.entries(stats.prs).sort((a,b) => b[1]-a[1]).slice(0,8);
    prList.innerHTML = entries.length === 0
      ? '<p style="color:var(--text2);font-size:14px;">Sem PRs registrados ainda.</p>'
      : entries.map(([name, kg]) =>
          `<div class="pr-item"><span class="pr-name">${escHtml(name)}</span>
          <span class="pr-value">${kg}<span class="pr-unit">kg</span></span></div>`
        ).join('');
  }
  const mbEl = document.getElementById('muscle-bars');
  if (mbEl) {
    const entries = Object.entries(stats.muscles).sort((a,b) => b[1]-a[1]).slice(0,6);
    const maxM = Math.max(...entries.map(e => e[1]), 1);
    mbEl.innerHTML = entries.length === 0
      ? '<p style="color:var(--text2);font-size:14px;">Treine para ver seus grupos.</p>'
      : entries.map(([m, n]) => `
          <div class="muscle-bar-item">
            <div class="muscle-bar-header">
              <span class="muscle-bar-name">${m}</span>
              <span class="muscle-bar-count">${n} treino${n!==1?'s':''}</span>
            </div>
            <div class="muscle-bar-track"><div class="muscle-bar-fill" style="width:${(n/maxM*100).toFixed(0)}%"></div></div>
          </div>
        `).join('');
  }
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
  const ni = document.getElementById('profileNameInput');
  if (ni) ni.value = settings.name;
  const ri = document.getElementById('restTimeInput');
  if (ri) ri.value = settings.restTime || 90;

  // Notification permission status
  const statusEl = document.getElementById('notif-status');
  const btnEl = document.getElementById('notif-btn');
  if (statusEl && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      statusEl.textContent = '✅ Ativadas';
      statusEl.style.color = '#2ecc71';
      if (btnEl) { btnEl.textContent = '✓ Ativo'; btnEl.style.color = '#2ecc71'; }
    } else if (Notification.permission === 'denied') {
      statusEl.textContent = '❌ Bloqueadas — ative nas configurações do celular';
      statusEl.style.color = '#e05040';
      if (btnEl) btnEl.textContent = '⚙️ Configurações';
    } else {
      statusEl.textContent = 'Toque para ativar';
      if (btnEl) btnEl.textContent = '🔔 Ativar';
    }
  } else if (statusEl) {
    statusEl.textContent = 'Não suportado neste dispositivo';
  }
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

function requestNotifPermission() {
  Timer.requestNotificationPermission().then(granted => {
    if (granted) {
      showToast('🔔 Notificações ativadas!');
      requestOverlayPermission();
    } else {
      showToast('❌ Permissão negada — verifique as configurações do celular');
    }
  });
}

function requestOverlayPermission() {
  try {
    const intentUrl = 'intent:#Intent;action=android.settings.action.MANAGE_OVERLAY_PERMISSION;end';
    const a = document.createElement('a');
    a.href = intentUrl;
    a.click();
  } catch(e) {}
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
