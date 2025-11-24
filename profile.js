// profile.js
import { auth, db, storage } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { uploadBytes, getDownloadURL, ref as sRef } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const dpFileEl = document.getElementById("dpFile");
const dpPreview = document.getElementById("dpPreview");
const saveBtn = document.getElementById("saveBtn");
const msgEl = document.getElementById("msg");
let currentUid = null;
let myProfile = {};

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUid = user.uid;

  const snap = await get(ref(db, "users/" + currentUid));
  if (snap.exists()) {
    myProfile = snap.val();
    dpPreview.src = myProfile.dp || "default_dp.png";
    document.getElementById("name").value = myProfile.name || "";
    document.getElementById("age").value = myProfile.age || "";
    document.getElementById("gender").value = myProfile.gender || "";
    document.getElementById("city").value = myProfile.city || "";
  }

  // listen for external DP changes and update preview
  onValue(ref(db, "users/" + currentUid + "/dp"), s => {
    const v = s.val();
    if (v) dpPreview.src = v;
  });
});

dpFileEl.onchange = () => {
  const f = dpFileEl.files[0];
  if (f) dpPreview.src = URL.createObjectURL(f);
};

saveBtn.onclick = async () => {
  if (!currentUid) return;
  msgEl.style.color = "green";
  msgEl.textContent = "Saving...";

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value.trim();
  const dpFile = dpFileEl.files[0];

  const updates = { name, age, gender, city };

  try {
    if (dpFile) {
      const storageRef = sRef(storage, "dp/" + currentUid + ".jpg");
      await uploadBytes(storageRef, dpFile);
      const url = await getDownloadURL(storageRef);
      updates.dp = url;
    }

    await update(ref(db, "users/" + currentUid), updates);
    msgEl.style.color = "green";
    msgEl.textContent = "Profile Updated!";
    // clear file input
    dpFileEl.value = "";
  } catch (err) {
    msgEl.style.color = "red";
    msgEl.textContent = err.message;
  }
};
