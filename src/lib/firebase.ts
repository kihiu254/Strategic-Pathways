import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAele6GUEDrFSwY31Dy8vB7hmBEZOqJkIE",
  authDomain: "strategic-pathways-ba4ba.firebaseapp.com",
  projectId: "strategic-pathways-ba4ba",
  storageBucket: "strategic-pathways-ba4ba.firebasestorage.app",
  messagingSenderId: "1041821154748",
  appId: "1:1041821154748:web:e0aa66e3976a614dba7fb9",
  measurementId: "G-47054GND7M"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const analytics = getAnalytics(app);
export default app;