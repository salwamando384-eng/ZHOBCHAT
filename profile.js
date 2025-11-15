import { auth, db, storage } from "./firebase_config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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

// --- UI Elements ---
const profilePicPreview = document.getElementById("profilePicPreview");
const profilePicInput = document.getElementById("profilePicInput");

const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const genderInput = document.getElementById("genderInput");
const cityInput = document.getElementById("cityInput");
const aboutInput = document.getElementById("aboutInput");

const saveBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");

let currentUID = "";
let currentDP = "default-dp.png";


// ==================================================
//  Load Logged In User Data
// ==================================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  currentUID = user.uid;

  const userRef = ref(db, "users/" + currentUID);
  const snap = await get(userRef);

  if (snap.exists()) {
    const data = snap.val();

    currentDP = data.dp || "default-dp.png";
    profilePicPreview.src = currentDP;

    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
    aboutInput.value = data.about || "";
  }
});


// ==================================================
//  Upload DP if changed
// ==================================================
async function uploadDP() {
  if (profilePicInput.files.length === 0) {
    return currentDP; // No new DP selected
  }

  const file = profilePicInput.files[0];
  const dpRef = sRef(storage, "dp/" + currentUID);

  await uploadBytes(dpRef, file);
  return await getDownloadURL(dpRef);
}


// ==================================================
//  SAVE PROFILE BUTTON
// ==================================================
saveBtn.onclick = async () => {
  if (!currentUID) return;

  const dpURL = await uploadDP();

  const userData = {
    dp: dpURL,
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    about: aboutInput.value
  };

  await update(ref(db, "users/" + currentUID), userData);

  alert("Profile Saved!");
};



// ==================================================
//  BACK BUTTON
// ==================================================
backBtn.onclick = () => {
  location.href = "chat.html";
};
