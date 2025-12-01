// users_popup_component.js
// small vanilla component to show overlay, fetch users from RTDB, and show details with buttons
import { db } from "./firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

window.openUsersOverlay = function() {
  // If overlay exists, toggle
  if (document.getElementById("usersOverlay")) {
    document.getElementById("usersOverlay").style.display = "flex";
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "usersOverlay";
  overlay.style = `
    position:fixed; inset:0; background:linear-gradient(135deg,#89f7fe,#66a6ff);
    display:flex; justify-content:center; align-items:flex-start; padding-top:30px; z-index:9999;
  `;
  overlay.innerHTML = `
    <div style="width:95%; max-width:520px; background:white; border-radius:14px; padding:14px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="margin:0">Users</h2>
        <button id="closeUsersOverlay" style="background:#f44336;color:white;border:none;padding:8px 12px;border-radius:8px;">Close</button>
      </div>
      <div id="usersOverlayList" style="margin-top:12px; max-height:60vh; overflow:auto;"></div>
      <div id="usersOverlayDetail" style="margin-top:12px; display:none;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("closeUsersOverlay").onclick = () => overlay.style.display = "none";

  // fetch users from RTDB
  const usersListEl = document.getElementById("usersOverlayList");
  const usersRef = ref(db, "users");
  onValue(usersRef, (snap) => {
    usersListEl.innerHTML = "";
    snap.forEach(child => {
      const data = child.val();
      const uid = child.key;
      const item = document.createElement("div");
      item.style = "display:flex; gap:12px; align-items:center; padding:10px; background:#f2f7ff; margin-bottom:8px; border-radius:10px; cursor:pointer;";
      const img = document.createElement("img");
      img.src = data.dp || "default_dp.png";
      img.style = "width:48px;height:48px;border-radius:50%;object-fit:cover;";
      const info = document.createElement("div");
      info.innerHTML = `<strong>${data.name||'User'}</strong><div style='font-size:13px;color:#666'>${data.city||''}</div>`;
      item.appendChild(img);
      item.appendChild(info);
      item.onclick = () => showUserDetail(uid, data);
      usersListEl.appendChild(item);
    });
  });

  function showUserDetail(uid, data) {
    const detailEl = document.getElementById("usersOverlayDetail");
    detailEl.style.display = "block";
    detailEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <img src="${data.dp || 'default_dp.png'}" style="width:80px;height:80px;border-radius:12px;object-fit:cover;" />
        <div>
          <h3 style="margin:0">${data.name||'User'}</h3>
          <div style="color:#666">Gender: ${data.gender||'N/A'}</div>
          <div style="color:#666">Age: ${data.age||'N/A'}</div>
          <div style="color:#666">City: ${data.city||'N/A'}</div>
        </div>
      </div>
      <div style="margin-top:12px; display:flex; gap:8px;">
        <button id="pmBtn" style="flex:1;padding:10px;border-radius:8px;border:none;background:#4caf50;color:white;">Private Message</button>
        <button id="frBtn" style="flex:1;padding:10px;border-radius:8px;border:none;background:#ff9800;color:white;">Friend Request</button>
      </div>
    `;
    document.getElementById("pmBtn").onclick = () => {
      // set chatUser in localStorage and open private chat
      localStorage.setItem("chatUser", uid);
      location.href = "private_chat.html";
    };
    document.getElementById("frBtn").onclick = async () => {
      // push friend request
      const frRef = ref(db, `friend_requests/${uid}`);
      // push a small request object
      const pushFn = (await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js")).push;
      await pushFn(frRef, { from: auth.currentUser.uid, time: Date.now() });
      alert("Friend request sent.");
    };
  }
};
