// profile.js

import { auth, db, storage } from "./firebase.js";
import {
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const saveMsg = document.getElementById("saveMsg");

let uid;
let currentDP = "";

// Load Profile Data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Login required");
    location.href = "index.html";
    return;
  }

  uid = user.uid;

  const snap = await get(ref(db, "users/" + uid));
  if (snap.exists()) {
    const data = snap.val();

    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
    currentDP = data.dp || "default_dp.png";

    profileImg.src = currentDP + "?v=" + Date.now();
  }
});

// Preview new DP
dpInput.onchange = () => {
  if (dpInput.files.length > 0) {
    profileImg.src = URL.createObjectURL(dpInput.files[0]);
  }
};

// Save Profile
saveBtn.onclick = async () => {
  saveMsg.textContent = "Saving...";

  let dpURL = currentDP;

  // Upload new DP
  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const storageRef = sRef(storage, "dp/" + uid + ".jpg");
    await uploadBytes(storageRef, file);
    dpURL = await getDownloadURL(storageRef);
  }

  await set(ref(db, "users/" + uid), {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    dp: dpURL
  });

  saveMsg.textContent = "✔ Profile Saved!";
  setTimeout(() => (saveMsg.textContent = ""), 2000);
};

// Logout
logoutBtn.onclick = async () => {
  await signOut(auth);
  location.href = "index.html";
};
