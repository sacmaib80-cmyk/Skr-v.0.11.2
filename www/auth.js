
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_GnE6EKZdxem2XUHpgMuub2gPj3_PFgM",
  authDomain: "sakuraq-b7f96.firebaseapp.com",
  projectId: "sakuraq-b7f96",
  storageBucket: "sakuraq-b7f96.firebasestorage.app",
  messagingSenderId: "1069498952404",
  appId: "1:1069498952404:web:34daf6db0244513bda6941",
  measurementId: "G-L7BZVP9WRR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" }); // บังคับแสดง account chooser ทุกครั้ง

let currentUser = null;
let googleAuthReady = false;

function isCapacitor() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function isInAppBrowser() {
  if (isCapacitor()) return false;
  const ua = navigator.userAgent || "";
  return /Line|FBAN|FBAV|FB_IAB|FB4A|Instagram|TikTok|Twitter|Messenger|MicroMessenger/i.test(ua);
}

function syncAuthGate(user) {
  const gate = document.getElementById("authGate");
  if (!gate) return;

  const inApp = isInAppBrowser();
  document.body.classList.toggle("in-app-browser", inApp);

  window.sqAuthReady = true;

  if (user || inApp) {
    gate.style.setProperty("display", "none", "important");
    gate.setAttribute("aria-hidden", "true");
    return;
  }

  gate.style.setProperty("display", "flex", "important");
  gate.setAttribute("aria-hidden", "false");
}

function getEls() {
  return {
    googleLoginBtn: document.getElementById("googleLoginBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    userBox: document.getElementById("userBox"),
    userPhoto: document.getElementById("userPhoto"),
    userName: document.getElementById("userName"),
    userEmail: document.getElementById("userEmail"),
    authGateLoginBtn: document.getElementById("authGateLoginBtn")
  };
}

function syncAuthToWindow() {
  window.sqAuth = {
    user: currentUser,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    name: currentUser?.displayName || null
  };
}

function renderSignedOut() {
  const el = getEls();
  if (el.googleLoginBtn) el.googleLoginBtn.hidden = false;
  if (el.logoutBtn) el.logoutBtn.hidden = true;
  if (el.userBox) el.userBox.hidden = true;
  if (el.userPhoto) el.userPhoto.src = "";
  if (el.userName) el.userName.textContent = "Guest";
  if (el.userEmail) el.userEmail.textContent = "";
  const sub = document.getElementById("accountSubText");
  if (sub) sub.textContent = "Continue with Google";
}

function renderSignedIn(user) {
  const el = getEls();
  if (el.googleLoginBtn) el.googleLoginBtn.hidden = true;
  if (el.logoutBtn) el.logoutBtn.hidden = false;
  if (el.userBox) el.userBox.hidden = false;
  if (el.userPhoto) el.userPhoto.src = user.photoURL || "";
  if (el.userName) el.userName.textContent = user.displayName || "No name";
  if (el.userEmail) el.userEmail.textContent = user.email || "";
  const sub = document.getElementById("accountSubText");
  if (sub) sub.textContent = user.displayName || "Logged in";
}

async function loginWithGoogle() {
  if (isInAppBrowser()) {
    alert("ถ้าจะล็อกอิน Google ให้เปิดใน Chrome/Safari ก่อน แต่ตอนนี้ยังใช้แบบ Guest ได้");
    return;
  }

  try {
    await setPersistence(auth, browserLocalPersistence);

    if (isCapacitor()) {
      const GoogleAuth = window.Capacitor?.Plugins?.GoogleAuth;
      if (!GoogleAuth) throw new Error("GoogleAuth plugin not available");
      if (!googleAuthReady) {
        try {
          await GoogleAuth.initialize({
            clientId: "1069498952404-r337mi9jggc4fcf6mtfstcenp9mpie03.apps.googleusercontent.com",
            scopes: ["profile", "email"],
            grantOfflineAccess: true
          });
          googleAuthReady = true;
        } catch(initErr) {
          console.warn("GoogleAuth.initialize error (might be ok):", initErr);
        }
      }
      // เคลียร์บัญชี Google ที่ค้างก่อนเสมอ → บังคับให้หน้าจอ "เลือกบัญชี" โผล่ทุกครั้ง
      // (แก้บั๊ก: logout แล้วสลับ ID ไม่ได้ เพราะ plugin คืนบัญชีเดิมอัตโนมัติ)
      try { await GoogleAuth.signOut(); } catch (e) { /* ไม่มีบัญชีค้าง = ข้ามได้ */ }
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser?.authentication?.idToken;
      if (!idToken) throw new Error("No idToken from Google");
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } else {
      await signInWithPopup(auth, provider);
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    if (error.code === "auth/popup-blocked") {
      alert("Popup ถูกบล็อก กรุณาอนุญาต popup");
      return;
    }
    if (error.code === "auth/unauthorized-domain") {
      alert("Domain ไม่ได้รับอนุญาต กรุณาแจ้ง admin");
      return;
    }
    alert("Login ไม่สำเร็จ กรุณาลองใหม่");
  }
}

let _loggingOut = false;
async function logoutNow() {
  if (_loggingOut) return;          // กัน double-fire → กัน native crash จาก GoogleAuth.signOut ซ้อน
  _loggingOut = true;

  const btn = document.getElementById("logoutBtn");
  if (btn) btn.disabled = true;

  try {
    // Firebase signOut ก่อนเสมอ — สำคัญสุดและไม่ทำให้แอพ crash
    // (ทำก่อน GoogleAuth.signOut เผื่อ native call มีปัญหา อย่างน้อย session ฝั่ง Firebase ก็หลุดแล้ว)
    await signOut(auth);

    // เคลียร์ native Google session (best-effort) — ต้อง initialize ก่อน
    // ไม่งั้นเรียก signOut บน plugin ที่ยังไม่ init จะ crash ระดับ native (catch ใน JS ไม่ได้)
    if (isCapacitor()) {
      const GoogleAuth = window.Capacitor?.Plugins?.GoogleAuth;
      if (GoogleAuth) {
        try {
          if (!googleAuthReady) {
            await GoogleAuth.initialize({
              clientId: "1069498952404-r337mi9jggc4fcf6mtfstcenp9mpie03.apps.googleusercontent.com",
              scopes: ["profile", "email"],
              grantOfflineAccess: true
            });
            googleAuthReady = true;
          }
          await GoogleAuth.signOut();
        } catch (e) {
          console.warn("GoogleAuth.signOut skipped:", e);
        }
        googleAuthReady = false;
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    _loggingOut = false;
    if (btn) btn.disabled = false;
  }
}

window.loginWithGoogle = loginWithGoogle;
window.logoutNow = logoutNow;

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  syncAuthToWindow();
  document.body.classList.toggle("is-guest", !user);
  document.body.classList.toggle("is-authed", !!user);
  if (user) {
    renderSignedIn(user);
  } else {
    renderSignedOut();
  }
  syncAuthGate(user);
  window.dispatchEvent(new CustomEvent("sq-auth-changed", { detail: window.sqAuth }));
  window.dispatchEvent(new Event("sq-user-changed"));
});

document.addEventListener("click", (e) => {
  if (e.target.closest("#authGateLoginBtn, #googleLoginBtn")) {
    e.preventDefault();
    loginWithGoogle();
    return;
  }
  if (e.target.closest("#logoutBtn")) {
    e.preventDefault();
    logoutNow();
  }
});
