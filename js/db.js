// FORJA – DB Layer (localStorage)
const DB = {
  _read(key) {
    try { return JSON.parse(localStorage.getItem('forja_' + key) || 'null'); } catch { return null; }
  },
  _write(key, data) {
    localStorage.setItem('forja_' + key, JSON.stringify(data));
  },

  // ---- Settings ----
  getSettings() {
    return this._read('settings') || { theme: 'dark', name: '', restTime: 90, notifyRest: true, firstTime: true };
  },
  saveSettings(s) { this._write('settings', s); },

  // ---- Workouts ----
  getWorkouts() { return this._read('workouts') || []; },
  saveWorkouts(list) { this._write('workouts', list); },
  addWorkout(w) {
    const list = this.getWorkouts();
    w.id = Date.now().toString();
    w.createdAt = new Date().toISOString();
    list.unshift(w);
    this.saveWorkouts(list);
    return w;
  },
  deleteWorkout(id) {
    const list = this.getWorkouts().filter(w => w.id !== id);
    this.saveWorkouts(list);
  },
  getWorkout(id) { return this.getWorkouts().find(w => w.id === id); },

  // ---- Templates (treinos programados) ----
  getTemplates() { return this._read('templates') || []; },
  saveTemplates(list) { this._write('templates', list); },
  addTemplate(t) {
    const list = this.getTemplates();
    t.id = Date.now().toString();
    t.createdAt = new Date().toISOString();
    list.push(t);
    this.saveTemplates(list);
    return t;
  },
  updateTemplate(t) {
    const list = this.getTemplates().map(x => x.id === t.id ? t : x);
    this.saveTemplates(list);
  },
  deleteTemplate(id) {
    this.saveTemplates(this.getTemplates().filter(t => t.id !== id));
  },
  getTemplate(id) { return this.getTemplates().find(t => t.id === id); },

  // ---- Stats ----
  getStats() {
    const workouts = this.getWorkouts();
    const now = new Date();
    const weekAgo = new Date(now - 7 * 864e5);
    const monthAgo = new Date(now - 30 * 864e5);

    let streak = 0;
    const days = new Set(workouts.map(w => w.createdAt.slice(0, 10)));
    let d = new Date(); d.setHours(0,0,0,0);
    while (days.has(d.toISOString().slice(0,10))) { streak++; d.setDate(d.getDate() - 1); }

    const totalVolume = workouts.reduce((acc, w) =>
      acc + (w.exercises||[]).reduce((a2, e) =>
        a2 + (e.sets||[]).reduce((a3, s) => a3 + (+(s.weight||0)) * (+(s.reps||0)), 0), 0), 0);

    const thisWeek = workouts.filter(w => new Date(w.createdAt) >= weekAgo).length;
    const thisMonth = workouts.filter(w => new Date(w.createdAt) >= monthAgo).length;

    const prs = {};
    workouts.forEach(w => {
      (w.exercises||[]).forEach(e => {
        (e.sets||[]).forEach(s => {
          const kg = +(s.weight||0);
          if (!prs[e.name] || kg > prs[e.name]) prs[e.name] = kg;
        });
      });
    });

    const heatmap = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date(now - i * 864e5);
      const key = date.toISOString().slice(0,10);
      const count = workouts.filter(w => w.createdAt.slice(0,10) === key).length;
      heatmap.push({ date: key, count });
    }

    const muscles = {};
    workouts.forEach(w => { (w.muscles||[]).forEach(m => { muscles[m] = (muscles[m]||0) + 1; }); });

    const weeklyVolume = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now - (i+1)*7*864e5);
      const end = new Date(now - i*7*864e5);
      const vol = workouts
        .filter(w => { const d = new Date(w.createdAt); return d >= start && d < end; })
        .reduce((acc, w) => acc + (w.exercises||[]).reduce((a, e) =>
          a + (e.sets||[]).reduce((b, s) => b + (+(s.weight||0))*(+(s.reps||0)), 0), 0), 0);
      weeklyVolume.push({ label: `S${8-i}`, vol });
    }

    return { streak, totalVolume, thisWeek, thisMonth, prs, heatmap, muscles, weeklyVolume, total: workouts.length };
  }
};
