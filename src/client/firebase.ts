// Firebase JS SDK client — PacketFlow
// Credentials are loaded from EXPO_PUBLIC_FIREBASE_* env vars.
// Switch between Supabase and Firebase via useSettingsStore.backend
import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyDV0tRh625zCYuYctwApswWMOTmiOevI3w',
  authDomain:        'packetflow-app.firebaseapp.com',
  projectId:         'packetflow-app',
  storageBucket:     'packetflow-app.firebasestorage.app',
  messagingSenderId: '822177604972',
  appId:             '1:822177604972:web:4f9fab89670f79402c3f49',
  measurementId:     'G-E1EG552QQN',
};

// Avoid duplicate app initialization in hot-reload environments
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const firebaseApp = app;
export const firebaseAuth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);

