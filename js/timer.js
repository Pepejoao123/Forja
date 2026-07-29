// FORJA – Timer Module
const Timer = (() => {
  let duration = 90;
  let remaining = 90;
  let interval = null;
  let running = false;
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
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  }

  function tick() {
    remaining--;
    if (remaining <= 0) {
      remaining = 0;
      clearInterval(interval);
      running = false;
      beep(660, 0.15); setTimeout(() => beep(880, 0.15), 180); setTimeout(() => beep(1100, 0.3), 360);
      if (onEndCb) onEndCb();
    } else if (remaining <= 3) {
      beep(440, 0.1);
    }
    if (onTickCb) onTickCb(remaining, duration);
  }

  return {
    setDuration(s) { duration = s; remaining = s; if (onTickCb) onTickCb(remaining, duration); },
    getDuration() { return duration; },
    getRemaining() { return remaining; },
    isRunning() { return running; },
    formatTime,
    start() {
      if (running) return;
      if (remaining <= 0) remaining = duration;
      running = true;
      interval = setInterval(tick, 1000);
    },
    pause() {
      clearInterval(interval);
      running = false;
    },
    reset() {
      clearInterval(interval);
      running = false;
      remaining = duration;
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
