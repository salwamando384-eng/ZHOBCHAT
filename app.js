// app.js - English Version
import { auth, db, storage } from "./firebase_config.js";
import { signInAnonymously, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Helpers
function esc(s = "") {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function byId(id) {
  return document.getElementById(id);
}

// SHA-256 hash generator for password
async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Start Page Logic ---------- */
const startForm = byId("startForm");

if (startForm) {
  const msg = byId("startMsg");

  // Auto redirect if already logged in
  onAuthStateChanged(auth, (u) => {
    if (u) {
      location.href = "chat.html";
    }
  });

  startForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.style.display = "block";
    msg.style.color = "#000";
    msg.textContent = "⏳ Please wait...";

    const name = byId("name").value.trim();
    const gender = byId("gender").value;
    const age = byId("age").value.trim();
    const city = byId("city").value.trim();
    const nameColor = byId("nameColor").value || "#1565c0";
    const textColor = byId("textColor").value || "#000000";
    const file = byId("dpFile").files[0];
    const password = byId("password").value || "";

    if (!name || !gender || !age || !city) {
      msg.style.color = "red";
      msg.textContent = "⚠️ Please fill all required fields.";
      return;
    }

    try {
      // 1. Sign in anonymously
      const cred = await signInAnonymously(auth);
      const user = cred.user;

      // 2. Upload profile picture if provided
      let dpUrl = "default_dp.png";
      if (file) {
        const storageRef = sref(storage, `dps/${user.uid}_${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        dpUrl = await getDownloadURL(storageRef);
      }

      // 3. Update Firebase Auth profile
      await updateProfile(user, { displayName: name, photoURL: dpUrl });

      // 4. Hash password (if provided)
      let passwordHash = null;
      if (password) {
        passwordHash = await sha256Hex(password);
      }

      // 5. Save user data to Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        name: esc(name),
        gender,
        age,
        city: esc(city),
        dp: dpUrl,
        nameColor,
        textColor,
        status: "online",
        joinedAt: new Date().toISOString(),
        passwordHash
      });

      msg.style.color = "green";
      msg.textContent = "✅ Login successful! Redirecting to chat...";
      setTimeout(() => location.href = "chat.html", 800);

    } catch (err) {
      console.error(err);
      msg.style.color = "red";
      msg.textContent = "❌ " + err.message;
    }
  });
}
