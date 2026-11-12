importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCKV5TLrYRR6ToXvEv7pXyBeBrkwnTskvc",
  authDomain: "neiges---to-do-list.firebaseapp.com",
  projectId: "neiges---to-do-list",
  storageBucket: "neiges---to-do-list.firebasestorage.app",
  messagingSenderId: "315683814261",
  appId: "1:315683814261:web:b52934b3c3a22e46f4713c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;

  const title = payload.data?.title || "❄️ Les Neiges D'Antan";
  const options = {
    body: payload.data?.body || "Nuovo aggiornamento",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data || {}
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
