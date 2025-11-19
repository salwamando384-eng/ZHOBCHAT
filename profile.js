// profile.js
import { auth, db, storage } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { get, ref as dbRef, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const nameInput = document.getElementById("nameInput");
const dpInput = document.getElementById("dpInput");
const saveBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const profileMsg = document.getElementById("profileMsg");

let uid;

onAuthStateChanged(auth, async (user) => {
  if (!user) { location.href = "index.html"; return; }
  uid = user.uid;

  const snap = await get(dbRef(db, `users/${uid}`));
  if (snap.exists()) {
    const data = snap.val();
    nameInput.value = data.name || "";
    profileImg.src = data.dp ? data.dp + "?v=" + Date.now() : "default_dp.png";
  }
});

saveBtn.onclick = async () => {
  profileMsg.textContent = "Saving...";
  let dpURL;

  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const sref = sRef(storage, `dp/${uid}.jpg`);
    await uploadBytes(sref, file);
    dpURL = await getDownloadURL(sref);
  } else {
    // keep existing
    const s = await get(dbRef(db, `users/${uid}/dp`));
    dpURL = s.exists() ? s.val() : "default_dp.png";
  }

  await set(dbRef(db, `users/${uid}`), {
    name: nameInput.value,
    dp: dpURL,
    lastSeen: Date.now(),
    online: true
  });

  profileMsg.textContent = "Saved!";
  profileImg.src = dpURL + "?v=" + Date.now();
  setTimeout(()=> profileMsg.textContent = "", 2000);
};

logoutBtn.onclick = async () => {
  // set offline
  await set(dbRef(db, `users/${auth.currentUser.uid}/online`), false);
  await set(dbRef(db, `users/${auth.currentUser.uid}/lastSeen`), Date.now());
  await signOut(auth);
  location.href = "index.html";
};
