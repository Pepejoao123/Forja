const CACHE_NAME = 'forja-v3';
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

self.addEventListener('message', e => {
  if (e.data.type === 'SCHEDULE_NOTIFICATION') {
    if (notificationTimeout) clearTimeout(notificationTimeout);
    const delay = Math.max(0, e.data.delay);

    notificationTimeout = setTimeout(() => {
      self.registration.showNotification('FORJA 🔥 Descanse acabou!', {
        body: 'Hora de voltar pro ferro! Próxima série te espera.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [300, 150, 300, 150, 600],
        tag: 'forja-rest-timer',
        renotify: true,
        requireInteraction: true,   // mantém visível até o usuário dispensar
        silent: false,
        data: { url: '/' }
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
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
