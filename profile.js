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

// -------- ELEMENTS --------
const profilePicInput = document.getElementById("profilePicInput");
const profilePicPreview = document.getElementById("profilePicPreview");

const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const genderInput = document.getElementById("genderInput");
const cityInput = document.getElementById("cityInput");
const aboutInput = document.getElementById("aboutInput");

const saveBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");

// -------- LOAD PROFILE DATA --------
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const uid = user.uid;
  const userRef = ref(db, "users/" + uid);
  const snap = await get(userRef);

  if (snap.exists()) {
    let data = snap.val();

    profilePicPreview.src = data.dp || "default_dp.png";
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
    aboutInput.value = data.about || "";
  }
});

// -------- SHOW PREVIEW WHEN SELECT NEW IMAGE --------
profilePicInput.onchange = () => {
  const file = profilePicInput.files[0];
  if (file) {
    profilePicPreview.src = URL.createObjectURL(file);
  }
};

// -------- SAVE PROFILE --------
saveBtn.onclick = async () => {
  const user = auth.currentUser;
  const uid = user.uid;

  const userRef = ref(db, "users/" + uid);

  let dpURL = "";
  let file = profilePicInput.files[0];

  // If user selected a new DP → upload
  if (file) {
    const storagePath = sRef(storage, "dp/" + uid + ".jpg");
    await uploadBytes(storagePath, file);
    dpURL = await getDownloadURL(storagePath);
  } else {
    const oldSnap = await get(userRef);
    dpURL = oldSnap.exists() ? oldSnap.val().dp : "default_dp.png";
  }

  // Save all data
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

// -------- BACK BUTTON --------
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
