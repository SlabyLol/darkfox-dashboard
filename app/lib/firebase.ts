import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBhu6xGZ3WjsAu9QSi02zyLP6KoNNEY1yE",
  authDomain: "df-dashboard-afd9e.firebaseapp.com",
  projectId: "df-dashboard-afd9e",
  storageBucket: "df-dashboard-afd9e.firebasestorage.app",
  messagingSenderId: "1002536633152",
  appId: "1:1002536633152:web:58f42de855e5ed50ef70a5",
  measurementId: "G-HZXZ3MZW92",
  databaseURL: "https://df-dashboard-afd9e-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
