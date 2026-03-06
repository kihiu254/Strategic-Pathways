importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAele6GUEDrFSwY31Dy8vB7hmBEZOqJkIE",
  authDomain: "strategic-pathways-ba4ba.firebaseapp.com",
  projectId: "strategic-pathways-ba4ba",
  storageBucket: "strategic-pathways-ba4ba.firebasestorage.app",
  messagingSenderId: "1041821154748",
  appId: "1:1041821154748:web:e0aa66e3976a614dba7fb9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});