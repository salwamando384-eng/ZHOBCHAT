import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  update,
  get
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


// Elements
const dpInput = document.getElementById("profilePicInput");
const dpPreview = document.getElementById("profilePicPreview");

const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const genderInput = document.getElementById("genderInput");
const cityInput = document.getElementById("cityInput");
const aboutInput = document.getElementById("aboutInput");

const saveBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");


// Load profile
auth.onAuthStateChanged(async (user) => {
  if (!user) return window.location.href = "login.html";

  const uid = user.uid;
  const refUser = ref(db, "users/" + uid);

  const snap = await get(refUser);

  if (snap.exists()) {
    let d = snap.val();

    if (d.dp) dpPreview.src = d.dp;
    if (d.name) nameInput.value = d.name;
    if (d.age) ageInput.value = d.age;
    if (d.gender) genderInput.value = d.gender;
    if (d.city) cityInput.value = d.city;
    if (d.about) aboutInput.value = d.about;
  }
});


// Preview DP
dpInput.onchange = () => {
  if (dpInput.files[0]) {
    dpPreview.src = URL.createObjectURL(dpInput.files[0]);
  }
};


// Save profile
saveBtn.onclick = async () => {
  const user = auth.currentUser;
  const uid = user.uid;

  const userRef = ref(db, "users/" + uid);

  let dpURL = "";
  let file = dpInput.files[0];

  if (file) {
    const path = sRef(storage, "dp/" + uid + ".jpg");
    await uploadBytes(path, file);
    dpURL = await getDownloadURL(path);
  } else {
    const old = await get(userRef);
    dpURL = old.exists() && old.val().dp ? old.val().dp : "default_dp.png";
  }

  await update(userRef, {
    dp: dpURL,
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    about: aboutInput.value
  });

  alert("Profile Saved Successfully!");
};


// Back button
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
