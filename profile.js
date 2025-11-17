import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  uploadBytes,
  getDownloadURL,
  ref as sRef
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");

const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

let currentUser;

// Load existing profile
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  currentUser = user;

  const userRef = ref(db, "users/" + user.uid);

  onValue(userRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    if (data.dp) profileImg.src = data.dp + "?t=" + Date.now();
    if (data.name) nameInput.value = data.name;
    if (data.age) ageInput.value = data.age;
    if (data.gender) genderInput.value = data.gender;
    if (data.city) cityInput.value = data.city;
  });
});

// Save Profile
saveBtn.onclick = async () => {
  if (!currentUser) return;

  const userRef = ref(db, "users/" + currentUser.uid);

  let dpURL = null;

  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const storageRef = sRef(storage, "dp/" + currentUser.uid);

    await uploadBytes(storageRef, file);
    dpURL = await getDownloadURL(storageRef);
  }

  await update(userRef, {
    dp: dpURL || profileImg.src,
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value
  });

  alert("Profile Saved!");
};

// Back to chat
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
