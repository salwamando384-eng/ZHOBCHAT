import { auth, db, storage } from "./firebase_config.js";

import {
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Inputs
const profilePicInput = document.getElementById("profilePicInput");
const profilePicPreview = document.getElementById("profilePicPreview");
const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const genderInput = document.getElementById("genderInput");
const cityInput = document.getElementById("cityInput");
const aboutInput = document.getElementById("aboutInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");

// Show selected image preview
profilePicInput.onchange = () => {
  const file = profilePicInput.files[0];
  if (file) {
    profilePicPreview.src = URL.createObjectURL(file);
  }
};

// Load user profile data
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const userRef = ref(db, "users/" + user.uid);
  const snap = await get(userRef);

  if (snap.exists()) {
    const data = snap.val();

    if (data.dp) profilePicPreview.src = data.dp;
    if (data.name) nameInput.value = data.name;
    if (data.age) ageInput.value = data.age;
    if (data.gender) genderInput.value = data.gender;
    if (data.city) cityInput.value = data.city;
    if (data.about) aboutInput.value = data.about;
  }
});

// SAVE PROFILE
saveProfileBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  let dpURL = profilePicPreview.src; // default old dp

  // If new DP selected → upload
  if (profilePicInput.files[0]) {
    const file = profilePicInput.files[0];
    const storageRef = sRef(storage, "dp/" + user.uid);

    await uploadBytes(storageRef, file);
    dpURL = await getDownloadURL(storageRef);
  }

  // Save data to database
  await set(ref(db, "users/" + user.uid), {
    dp: dpURL,
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    about: aboutInput.value
  });

  alert("Profile Updated Successfully!");
};

// Back Button
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
