// FORJA – Timer Module with Push Notification support
const Timer = (() => {
  let duration = 90;
  let remaining = 90;
  let interval = null;
  let running = false;
  let onTickCb = null;
  let onEndCb = null;
  let swTimerTimeout = null; // background timer via SW

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

  // Schedule a push notification via Service Worker for when app is in background
  async function scheduleNotification(seconds) {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const reg = await navigator.serviceWorker.ready;
    // Cancel any pending
    cancelScheduledNotification();
    // Post message to SW to schedule
    if (reg.active) {
      reg.active.postMessage({ type: 'SCHEDULE_NOTIFICATION', delay: seconds * 1000 });
    }
  }

  function cancelScheduledNotification() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg.active) reg.active.postMessage({ type: 'CANCEL_NOTIFICATION' });
      });
    }
  }

  function tick() {
    remaining--;
    if (remaining <= 0) {
      remaining = 0;
      clearInterval(interval);
      running = false;
      beep(660, 0.15);
      setTimeout(() => beep(880, 0.15), 180);
      setTimeout(() => beep(1100, 0.3), 360);
      cancelScheduledNotification();
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

    async requestNotificationPermission() {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      const result = await Notification.requestPermission();
      return result === 'granted';
    },

    start() {
      if (running) return;
      if (remaining <= 0) remaining = duration;
      running = true;
      interval = setInterval(tick, 1000);
      scheduleNotification(remaining);
    },

    pause() {
      clearInterval(interval);
      running = false;
      cancelScheduledNotification();
    },

    reset() {
      clearInterval(interval);
      running = false;
      remaining = duration;
      cancelScheduledNotification();
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
