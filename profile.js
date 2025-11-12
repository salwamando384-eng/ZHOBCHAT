// profile.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const profileArea = document.getElementById("profileArea");

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  const viewUid = localStorage.getItem("profileView");
  if (!viewUid) { profileArea.innerHTML = "<p class='muted'>کوئی پروفائل منتخب نہیں۔</p>"; return; }

  const snap = await get(ref(db, `users/${viewUid}`));
  if (!snap.exists()) { profileArea.innerHTML = "<p class='muted'>یوزر نہیں ملا</p>"; return; }
  const u = snap.val();

  profileArea.innerHTML = `
    <img src="${u.dp||'default_dp.png'}" class="dpBig" />
    <h3>${escapeHtml(u.name)}</h3>
    <p>عمر: ${escapeHtml(u.age)}<br/>جنس: ${escapeHtml(u.gender)}<br/>شہر: ${escapeHtml(u.city)}</p>
    <p><button id="sendFriend">Send Friend Request</button> <button id="privateBtn">Private Message</button></p>
  `;

  document.getElementById("sendFriend").onclick = async () => {
    await push(ref(db, `friendRequests/${viewUid}`), {
      fromUid: user.uid,
      fromName: user.displayName || user.email,
      time: new Date().toISOString()
    });
    alert("Friend request sent.");
  };

  document.getElementById("privateBtn").onclick = () => {
    localStorage.setItem("chatWith", viewUid);
    window.location.href = "private_chat.html";
  };
});

function escapeHtml(s=""){ return (s+"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
