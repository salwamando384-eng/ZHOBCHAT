// chat.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded, get, remove, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// elements
const messagesBox = document.getElementById("messages");
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const chatDp = document.getElementById("chatDp");
const usersBtn = document.getElementById("usersBtn");
const profileBtn = document.getElementById("profileBtn");

// users overlay elements
const usersOverlay = document.getElementById("usersOverlay");
const usersListArea = document.getElementById("usersListArea");
const userDetailArea = document.getElementById("userDetailArea");
const closeUsers = document.getElementById("closeUsers");

// set OWNER_UID if you want admin capability (or set role in DB)
const OWNER_UID = null; // optional: put owner's uid string here e.g. "abc123"

// track current user
let currentUid = null;
let currentUserData = {};

// auth guard
onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUid = user.uid;

  // load my profile dp and name
  const userRef = ref(db, "users/" + currentUid);
  onValue(userRef, snap => {
    const data = snap.val();
    if (data && data.dp) chatDp.src = data.dp;
  });

  loadMessages();
});

// load messages and render
function loadMessages() {
  const messagesRef = ref(db, "messages");
  // clear
  messagesBox.innerHTML = "";

  onChildAdded(messagesRef, async (snap) => {
    const k = snap.key;
    const msg = snap.val();

    // create row
    const div = document.createElement("div");
    div.className = "msg-row";
    // bubble with admin delete if allowed
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    // assemble
    const img = document.createElement("img");
    img.className = "msg-dp";
    img.src = msg.dp || "default_dp.png";

    bubble.innerHTML = `<b>${msg.name || 'User'}</b><p>${msg.text}</p>`;

    div.appendChild(img);
    div.appendChild(bubble);

    // if current user is owner or message owner, show delete button
    const isOwner = (OWNER_UID && currentUid === OWNER_UID);
    if (isOwner || (msg.uid === currentUid)) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.marginLeft = "8px";
      delBtn.className = "admin-red";
      delBtn.onclick = async () => {
        if (confirm("Delete this message?")) {
          await remove(ref(db, "messages/" + k));
        }
      };
      div.appendChild(delBtn);
    }

    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

// send message
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  // read my user data (name and dp)
  const snap = await get(ref(db, "users/" + currentUid));
  const my = snap.exists() ? snap.val() : {};
  const name = my.name || "User";
  const dp = my.dp || "default_dp.png";

  await push(ref(db, "messages"), {
    uid: currentUid,
    name,
    dp,
    text,
    time: Date.now()
  });

  msgInput.value = "";
};

// logout
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

// Users overlay open
usersBtn.onclick = () => {
  usersOverlay.classList.remove("hidden");
  loadUsersList();
};
closeUsers.onclick = () => {
  usersOverlay.classList.add("hidden");
  userDetailArea.classList.add("hidden");
};

// Load users
async function loadUsersList(){
  usersListArea.innerHTML = "Loading...";
  const snap = await get(ref(db, "users"));
  usersListArea.innerHTML = "";
  if (!snap.exists()) { usersListArea.innerText = "No users"; return; }

  snap.forEach(child => {
    const u = child.val();
    const uid = child.key;

    const item = document.createElement("div");
    item.className = "user-item";
    item.innerHTML = `<img src="${u.dp || 'default_dp.png'}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;margin-right:10px">
                      <div><strong>${u.name||'User'}</strong><br><small>${u.city||''}</small></div>`;
    item.onclick = () => showUserDetail(uid, u);
    usersListArea.appendChild(item);
  });
}

// show user detail with actions
function showUserDetail(uid, u){
  userDetailArea.classList.remove("hidden");
  userDetailArea.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${u.dp||'default_dp.png'}" style="width:90px;height:90px;border-radius:50%;object-fit:cover">
      <div>
        <h3 style="margin:0">${u.name||'User'}</h3>
        <div style="color:#666">${u.gender||''} • ${u.age||''}</div>
        <div style="color:#666">${u.city||''}</div>
      </div>
    </div>
    <div style="margin-top:12px">
      <button id="pmBtn" class="btn">Private Message</button>
      <button id="frBtn" class="btn" style="background:#ff9800;color:white">Send Friend Request</button>
    </div>
    <div style="margin-top:12px">
      ${(OWNER_UID && currentUid===OWNER_UID) ? `<button id="delAll" class="admin-red">Delete All Messages</button>` : ''}
    </div>
  `;

  // wire actions
  document.getElementById("pmBtn").onclick = () => {
    // store selected chat user and go to private chat page
    localStorage.setItem("chatUser", uid);
    window.location.href = "private_chat.html";
  };

  document.getElementById("frBtn").onclick = async () => {
    // Friend request simple implementation: push to requests/uid/fromUid
    await push(ref(db, `friend_requests/${uid}`), {
      from: currentUid,
      time: Date.now()
    });
    alert("Friend request sent");
  };

  if (OWNER_UID && currentUid === OWNER_UID) {
    const delAllBtn = document.getElementById("delAll");
    delAllBtn.onclick = async () => {
      if (!confirm("Delete ALL messages?")) return;
      // remove entire messages node
      await remove(ref(db, "messages"));
      alert("All messages deleted");
    };
  }
}
