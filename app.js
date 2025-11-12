// app.js  (single place for index.html + chat.html logic)
// It detects current page by checking for elements

import { auth, db, storage } from "./firebase_config.js";
import {
  signInAnonymously, updateProfile, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  ref, set, push, onChildAdded, get, child, onValue, update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

/* ---------- helpers ---------- */
function esc(s=""){ return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
function byId(id){ return document.getElementById(id); }

/* ---------- PAGE: index.html (Start form) ---------- */
const startForm = byId("startForm");
if (startForm) {
  const msg = byId("startMsg");

  // If already logged-in, redirect to chat
  onAuthStateChanged(auth, (u) => {
    if (u) location.href = "chat.html";
  });

  startForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.style.display = "block";
    msg.style.color = "#000";
    msg.textContent = "⏳ براہ کرم انتظار کریں...";

    const name = byId("name").value.trim();
    const gender = byId("gender").value;
    const age = byId("age").value.trim();
    const city = byId("city").value.trim();
    const nameColor = byId("nameColor").value || "#1565c0";
    const textColor = byId("textColor").value || "#000000";
    const file = byId("dpFile").files[0];

    if (!name || !gender || !age || !city) {
      msg.style.color = "red";
      msg.textContent = "⚠️ تمام خانے بھریں۔";
      return;
    }

    try {
      // 1) sign in anonymously (persistent)
      const cred = await signInAnonymously(auth);
      const user = cred.user;

      // 2) if file provided upload to storage
      let dpUrl = "default_dp.png";
      if (file) {
        const storageRef = sref(storage, `dps/${user.uid}_${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        dpUrl = await getDownloadURL(storageRef);
      }

      // 3) update profile
      await updateProfile(user, { displayName: name, photoURL: dpUrl });

      // 4) write user record
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        name,
        gender,
        age,
        city,
        dp: dpUrl,
        nameColor,
        textColor,
        status: "online",
        joinedAt: new Date().toISOString()
      });

      msg.style.color = "green";
      msg.textContent = "✅ آپ لاگ ان ہو گئے ہیں — Chat کھول رہے ہیں...";
      setTimeout(()=>location.href="chat.html",800);

    } catch (err) {
      console.error(err);
      msg.style.color = "red";
      msg.textContent = "❌ " + err.message;
    }
  });
}

/* ---------- PAGE: chat.html ---------- */
const messagesEl = byId("messages");
if (messagesEl) {
  const sendForm = byId("sendForm");
  const msgInput = byId("msgInput");
  const msgColor = byId("msgColor");
  const usersList = byId("usersList");
  const openUsers = byId("openUsers");
  const logoutBtn = byId("logoutBtn");
  const myBrief = byId("myBrief");

  // private popup elements
  const privatePopup = byId("privatePopup");
  const ppTitle = byId("ppTitle");
  const ppMessages = byId("ppMessages");
  const ppForm = byId("ppForm");
  const ppInput = byId("ppInput");
  const ppClose = byId("ppClose");

  let me = null;
  let chatWithUid = null;

  // if not logged in -> redirect to index
  onAuthStateChanged(auth, async (user) => {
    if (!user) { location.href = "index.html"; return; }
    me = user;

    // load my profile (database)
    const uSnap = await get(ref(db, `users/${user.uid}`));
    const u = uSnap.exists() ? uSnap.val() : { name: user.displayName || "Anonymous", dp: user.photoURL || "default_dp.png" };
    myBrief.innerHTML = `<div style="display:flex;gap:8px;align-items:center">
      <img src="${esc(u.dp)}" class="dpSmall" /><div><b style="color:${esc(u.nameColor||'#000')}">${esc(u.name)}</b><br/><small>${esc(u.city||'')}</small></div></div>`;

    // mark online
    await update(ref(db, `users/${user.uid}`), { status: "online", lastSeen: null });

    // load existing public messages once
    const msgsSnap = await get(ref(db, "messages"));
    messagesEl.innerHTML = "";
    if (!msgsSnap.exists()) {
      messagesEl.innerHTML = "<p class='muted'>کوئی پیغام نہیں — پہلا پیغام آپ بھیجیں</p>";
    } else {
      msgsSnap.forEach(child => renderPublicMessage(child.key, child.val()));
    }

    // realtime listener for public messages
    onChildAdded(ref(db, "messages"), (snap) => {
      // avoid duplicates
      if (!messagesEl.querySelector(`[data-key="${snap.key}"]`)) renderPublicMessage(snap.key, snap.val());
    });

    // load users list realtime
    onValue(ref(db, "users"), (snap) => {
      usersList.innerHTML = "";
      snap.forEach(child => {
        const uid = child.key;
        const uobj = child.val();
        const div = document.createElement("div");
        div.className = "userRow";
        div.innerHTML = `<img src="${esc(uobj.dp||'default_dp.png')}" class="dpSmall" /><div style="flex:1;text-align:right">
          <b style="color:${esc(uobj.nameColor||'#000')}">${esc(uobj.name)}</b><br/><small>${esc(uobj.age||'')} • ${esc(uobj.gender||'')}</small></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button data-uid="${uid}" class="profileBtn">Profile</button>
            <button data-uid="${uid}" class="pmBtn">Private</button>
          </div>`;
        usersList.appendChild(div);
      });

      // attach handlers (after list built)
      document.querySelectorAll(".profileBtn").forEach(b => b.addEventListener("click", (e)=> {
        const uid = e.target.dataset.uid;
        openProfile(uid);
      }));
      document.querySelectorAll(".pmBtn").forEach(b => b.addEventListener("click", (e)=> {
        const uid = e.target.dataset.uid;
        openPrivate(uid);
      }));
    });

  }); // end onAuthStateChanged

  /* ---------- public message rendering ---------- */
  function renderPublicMessage(key, m) {
    const d = document.createElement("div");
    d.className = "msg";
    d.dataset.key = key;
    const dp = esc(m.dp || "default_dp.png");
    const name = esc(m.fromName || m.fromEmail || "Unknown");
    const color = esc(m.nameColor || "#1565c0");
    const textColor = esc(m.textColor || "#000000");
    d.innerHTML = `<img src="${dp}" class="dpTiny" />
      <div style="flex:1">
        <div class="meta"><strong style="color:${color}">${name}</strong> <span style="color:var(--muted)">• ${esc(m.time||'')}</span></div>
        <div style="color:${textColor}">${esc(m.text)}</div>
      </div>`;
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ---------- send public message ---------- */
  sendForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text || !me) return;
    // load my profile snapshot to get dp, colors
    const snap = await get(ref(db, `users/${me.uid}`));
    const u = snap.exists() ? snap.val() : {};
    const msgObj = {
      fromUid: me.uid,
      fromName: u.name || me.displayName || "Anonymous",
      fromEmail: me.email || null,
      dp: u.dp || me.photoURL || "default_dp.png",
      nameColor: u.nameColor || "#1565c0",
      textColor: u.textColor || "#000000",
      text,
      time: new Date().toLocaleTimeString()
    };
    await push(ref(db, "messages"), msgObj);
    msgInput.value = "";
  });

  /* ---------- private chat (popup) ---------- */
  function openPrivate(uid) {
    if (!me) return alert("لوگ ان کریں");
    if (uid === me.uid) return alert("اپنے آپ کو پرائیویٹ پیغام نہیں بھیج سکتے");
    chatWithUid = uid;
    // show header
    get(ref(db, `users/${uid}`)).then(snap => {
      const u = snap.exists() ? snap.val() : { name: "User" };
      ppTitle.innerHTML = `<img src="${esc(u.dp||'default_dp.png')}" class="dpTiny" /> <b style="color:${esc(u.nameColor||'#000')}">${esc(u.name)}</b>`;
      // load private messages (simple): we'll listen to all privateMessages and filter
      ppMessages.innerHTML = "";
      onChildAdded(ref(db, "privateMessages"), (snap2) => {
        const m = snap2.val();
        if ((m.fromUid===me.uid && m.toUid===uid) || (m.fromUid===uid && m.toUid===me.uid)) {
          const div = document.createElement("div");
          div.className = "msg";
          div.innerHTML = `<div style="font-size:12px;color:var(--muted)">${esc(m.time)}</div><div>${esc(m.fromName)}: ${esc(m.text)}</div>`;
          ppMessages.appendChild(div);
          ppMessages.scrollTop = ppMessages.scrollHeight;
        }
      });
      privatePopup.classList.remove("hidden");
    });
  }

  ppClose.addEventListener("click", ()=> privatePopup.classList.add("hidden"));

  ppForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const txt = ppInput.value.trim();
    if (!txt || !me || !chatWithUid) return;
    const snap = await get(ref(db, `users/${me.uid}`));
    const u = snap.exists() ? snap.val() : {};
    await push(ref(db, "privateMessages"), {
      fromUid: me.uid,
      fromName: u.name || me.displayName || "You",
      toUid: chatWithUid,
      text: txt,
      time: new Date().toLocaleTimeString()
    });
    ppInput.value = "";
  });

  /* ---------- profile view (simple modal via alert) ---------- */
  async function openProfile(uid) {
    const snap = await get(ref(db, `users/${uid}`));
    if (!snap.exists()) return alert("یوزر نہیں ملا");
    const u = snap.val();
    const info = `نام: ${u.name}\nعمر: ${u.age}\nجنس: ${u.gender}\nشہر: ${u.city}`;
    if (confirm(info + "\n\nپرائیویٹ پیغام بھیجیں؟")) openPrivate(uid);
  }

  /* ---------- logout ---------- */
  logoutBtn.addEventListener("click", async () => {
    if (!me) return;
    await update(ref(db, `users/${me.uid}`), { status: "offline", lastSeen: new Date().toISOString() });
    await signOut(auth);
    location.href = "index.html";
  });

  /* helper end */
} // end if chat page
