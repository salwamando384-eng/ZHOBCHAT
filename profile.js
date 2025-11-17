import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const uid = auth.currentUser.uid;
const userRef = ref(db, "users/" + uid);

// Load existing profile
get(userRef).then((snap) => {
  if (snap.exists()) {
    const d = snap.val();
    document.getElementById("name").value = d.name || "";
    document.getElementById("age").value = d.age || "";
    document.getElementById("gender").value = d.gender || "";
    document.getElementById("city").value = d.city || "";
    document.getElementById("profileImg").src = d.dp || "default_dp.png";
  }
});

// Save Profile
document.getElementById("saveBtn").onclick = async () => {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value;

  await update(userRef, { name, age, gender, city });

  alert("Profile Updated");
};

// Back to chat
document.getElementById("backBtn").onclick = () => {
  window.location.href = "chat.html";
};

// Upload DP
document.getElementById("dpInput").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const dpRef = sRef(storage, "dp/" + uid + ".jpg");

  await uploadBytes(dpRef, file);
  const url = await getDownloadURL(dpRef);

  await update(userRef, { dp: url });

  document.getElementById("profileImg").src = url;

  alert("Profile Photo Updated");
};
