// =====================================================
// FIREBASE YAPILANDIRMASI
// Kurulum adımları için KURULUM_REHBERI.txt dosyasına bakın
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ⚠️  BURAYA KENDİ FİREBASE BİLGİLERİNİZİ GİRİN
// Firebase Console → Proje Ayarları → Uygulamalar → Web Uygulaması
const firebaseConfig = {
  apiKey: "AIzaSyAKCq8ym1AiVBuxjUADL5XiHBvtq_3bUd0",
  authDomain: "azra-sahil-2026.firebaseapp.com",
  projectId: "azra-sahil-2026",
  storageBucket: "azra-sahil-2026.firebasestorage.app",
  messagingSenderId: "989272396445",
  appId: "1:989272396445:web:e1bd4e2cebbf7caba7fa74"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
