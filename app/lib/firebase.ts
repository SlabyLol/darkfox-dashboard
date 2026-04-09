import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/**
 * @project DarkFox Terminal V3
 * @version 1.0.2
 * @copyright 2026 DarkFox Co.
 * @developer Sigma Dad
 */

const firebaseConfig = {
  apiKey: "AIzaSyBhu6xGZ3WjsAu9QSi02zyLP6KoNNEY1yE",
  authDomain: "df-dashboard-afd9e.firebaseapp.com",
  databaseURL: "https://df-dashboard-afd9e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "df-dashboard-afd9e",
  storageBucket: "df-dashboard-afd9e.firebasestorage.app",
  messagingSenderId: "1002536633152",
  appId: "1:1002536633152:web:58f42de855e5ed50ef70a5",
  measurementId: "G-HZXZ3MZW92"
};

// Singleton Initialisierung für Next.js
// Verhindert mehrfache Verbindungsaufbaue beim Hot-Reloading
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialisierung der Realtime Database
const db = getDatabase(app);

export { db };
