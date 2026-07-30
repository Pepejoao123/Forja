const CACHE_NAME = 'forja-v2';
const ASSETS = ['/', '/index.html', '/css/style.css', '/js/app.js', '/js/db.js', '/js/timer.js', '/js/charts.js', '/manifest.json'];

let notificationTimeout = null;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

// Background notification scheduling
self.addEventListener('message', e => {
  if (e.data.type === 'SCHEDULE_NOTIFICATION') {
    if (notificationTimeout) clearTimeout(notificationTimeout);
    const delay = e.data.delay;
    notificationTimeout = setTimeout(() => {
      self.registration.showNotification('FORJA – Descanso Finalizado! 🔥', {
        body: 'Hora de voltar para o ferro! Próxima série te espera.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200, 100, 400],
        tag: 'forja-rest-timer',
        renotify: true,
        requireInteraction: false,
        actions: [
          { action: 'open', title: 'Abrir FORJA' }
        ]
      });
      notificationTimeout = null;
    }, delay);
  }

  if (e.data.type === 'CANCEL_NOTIFICATION') {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      notificationTimeout = null;
    }
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    for (const client of list) {
      if ('focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow('/');
  }));
});
