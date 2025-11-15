import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  set,
  update,
  get
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


// ---------- ELEMENTS ----------
const profilePicInput = document.getElementById("profilePicInput");
const profilePicPreview = document.getElementById("profilePicPreview");

const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const genderInput = document.getElementById("genderInput");
const cityInput = document.getElementById("cityInput");
const aboutInput = document.getElementById("aboutInput");

const saveBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");


// ---------- LOAD OLD DATA ----------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;

  const userRef = ref(db, "users/" + uid);
  const snap = await get(userRef);

  if (snap.exists()) {
    let data = snap.val();

    if (data.dp) profilePicPreview.src = data.dp;
    if (data.name) nameInput.value = data.name;
    if (data.age) ageInput.value = data.age;
    if (data.gender) genderInput.value = data.gender;
    if (data.city) cityInput.value = data.city;
    if (data.about) aboutInput.value = data.about;
  }
});


// ---------- IMAGE PREVIEW ----------
profilePicInput.onchange = () => {
  const file = profilePicInput.files[0];
  if (file) {
    profilePicPreview.src = URL.createObjectURL(file);
  }
};


// ---------- SAVE PROFILE ----------
saveBtn.onclick = async () => {
  const user = auth.currentUser;
  const uid = user.uid;

  const userRef = ref(db, "users/" + uid);

  let dpURL = "";
  let file = profilePicInput.files[0];

  // Upload DP if new image selected
  if (file) {
    const storagePath = sRef(storage, "dp/" + uid + ".jpg");
    await uploadBytes(storagePath, file);
    dpURL = await getDownloadURL(storagePath);
  } else {
    // Keep old DP if no new file selected
    const oldSnap = await get(userRef);
    dpURL = oldSnap.exists() ? oldSnap.val().dp : "default-dp.png";
  }

  // Save all data in database
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



// ---------- BACK TO CHAT ----------
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
