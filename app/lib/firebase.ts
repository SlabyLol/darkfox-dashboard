import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/**
 * @project DarkFox Terminal V3
 * @version 1.0.1
 * @copyright 2026 DarkFox Co.
 */

const firebaseConfig = {
  // Diese Werte ziehen wir sicher aus den Railway-Umgebungsvariablen
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "df-dashboard-afd9e",
  storageBucket: "df-dashboard-afd9e.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  
  // DEINE LIVE DB URL (EU-WEST1)
  databaseURL: "https://df-dashboard-afd9e-default-rtdb.europe-west1.firebasedatabase.app"
};

// Next.js Singleton Initialisierung
// Verhindert, dass bei jedem Refresh eine neue Verbindung aufgebaut wird
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialisiere die Realtime Database Instanz
const db = getDatabase(app);

export { db };
