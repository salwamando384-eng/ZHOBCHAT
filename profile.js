import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

import {
  ref as dbRef,
  set,
  get
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ------------ Load Current User Data ------------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = dbRef(db, "users/" + user.uid);
  const snap = await get(userRef);

  if (snap.exists()) {
    const data = snap.val();

    document.getElementById("name").value = data.name || "";
    document.getElementById("dp-preview").src =
      data.dp || "default_dp.png";
  }
});

// ------------ Save Profile Button ------------
document.getElementById("saveProfile").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById("name").value;
  const file = document.getElementById("dp").files[0];

  let dpURL = null;

  // ---------- Upload DP if selected ----------
  if (file) {
    const storageRef = ref(storage, "profileImages/" + user.uid);
    await uploadBytes(storageRef, file);
    dpURL = await getDownloadURL(storageRef);
  }

  // ---------- Save to database ----------
  const userRef = dbRef(db, "users/" + user.uid);

  await set(userRef, {
    name: name,
    dp: dpURL || document.getElementById("dp-preview").src
  });

  alert("Profile Saved Successfully!");
});
