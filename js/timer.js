// FORJA – Timer Module v3 (background-safe via timestamp)
const Timer = (() => {
  let duration = 90;
  let remaining = 90;
  let interval = null;
  let running = false;
  let startedAt = null;   // timestamp quando iniciou
  let onTickCb = null;
  let onEndCb = null;

  function beep(freq = 880, dur = 0.2, vol = 0.4) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  function formatTime(s) {
    s = Math.max(0, Math.round(s));
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  }

  async function scheduleNotification(seconds) {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.active) {
        reg.active.postMessage({ type: 'SCHEDULE_NOTIFICATION', delay: seconds * 1000 });
      }
    } catch(e) {}
  }

  function cancelScheduledNotification() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(reg => {
      if (reg.active) reg.active.postMessage({ type: 'CANCEL_NOTIFICATION' });
    }).catch(() => {});
  }

  // Salva estado no localStorage para recuperar se app recarregar
  function persistState() {
    localStorage.setItem('forja_timer', JSON.stringify({
      duration, startedAt, running
    }));
  }

  function clearPersistedState() {
    localStorage.removeItem('forja_timer');
  }

  // Recupera estado ao reabrir o app
  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem('forja_timer') || 'null');
      if (!saved || !saved.running || !saved.startedAt) return false;
      const elapsed = (Date.now() - saved.startedAt) / 1000;
      const rem = saved.duration - elapsed;
      if (rem <= 0) {
        // Já terminou enquanto estava em background
        clearPersistedState();
        return false;
      }
      duration = saved.duration;
      startedAt = saved.startedAt;
      remaining = rem;
      return true;
    } catch { return false; }
  }

  function tick() {
    // Calcula com base no timestamp real — imune a throttling do browser
    if (!startedAt) return;
    const elapsed = (Date.now() - startedAt) / 1000;
    remaining = Math.max(0, duration - elapsed);

    if (remaining <= 0) {
      remaining = 0;
      clearInterval(interval);
      running = false;
      clearPersistedState();
      beep(660, 0.15);
      setTimeout(() => beep(880, 0.15), 180);
      setTimeout(() => beep(1100, 0.3), 360);
      cancelScheduledNotification();
      if (onEndCb) onEndCb();
      return;
    }

    if (remaining <= 3) beep(440, 0.08);
    if (onTickCb) onTickCb(remaining, duration);
  }

  // Tenta restaurar timer ativo ao carregar
  if (restoreState()) {
    running = true;
    interval = setInterval(tick, 500);
  }

  return {
    setDuration(s) {
      duration = s;
      remaining = s;
      startedAt = null;
      if (onTickCb) onTickCb(remaining, duration);
    },
    getDuration() { return duration; },
    getRemaining() { return remaining; },
    isRunning() { return running; },
    formatTime,
    wasRestoredFromBackground() {
      return running && startedAt !== null;
    },

    async requestNotificationPermission() {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      const result = await Notification.requestPermission();
      return result === 'granted';
    },

    start() {
      if (running) return;
      if (remaining <= 0) remaining = duration;
      startedAt = Date.now() - (duration - remaining) * 1000;
      running = true;
      interval = setInterval(tick, 500);
      persistState();
      scheduleNotification(remaining);
    },

    pause() {
      clearInterval(interval);
      running = false;
      startedAt = null;
      cancelScheduledNotification();
      clearPersistedState();
    },

    reset() {
      clearInterval(interval);
      running = false;
      remaining = duration;
      startedAt = null;
      cancelScheduledNotification();
      clearPersistedState();
      if (onTickCb) onTickCb(remaining, duration);
    },

    onTick(cb) { onTickCb = cb; },
    onEnd(cb) { onEndCb = cb; },

    startRest(seconds) {
      this.setDuration(seconds);
      this.reset();
      this.start();
    }
  };
})();
