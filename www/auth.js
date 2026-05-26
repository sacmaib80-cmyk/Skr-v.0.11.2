
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

let currentUser = null;

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
      try {
        await GoogleAuth.initialize({
          clientId: "1069498952404-r337mi9jggc4fcf6mtfstcenp9mpie03.apps.googleusercontent.com",
          scopes: ["profile", "email"],
          grantOfflineAccess: true
        });
      } catch(initErr) {
        console.warn("GoogleAuth.initialize error (might be ok):", initErr);
      }
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

async function logoutNow() {
  try {
    if (isCapacitor()) {
      try {
        const GoogleAuth = window.Capacitor?.Plugins?.GoogleAuth;
        if (GoogleAuth) await GoogleAuth.signOut();
      } catch (e) {}
    }
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    alert("Logout failed");
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
