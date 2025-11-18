import { auth, db, storage } from "./firebase_config.js";
import { ref as dbRef, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderSelect = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveMsg = document.getElementById("saveMsg");
const saveBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");

let uid;
let userData = {};

// Load current user data
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  uid = user.uid;

  const snap = await get(dbRef(db, "users/" + uid));
  if (snap.exists()) {
    userData = snap.val();

    profileImg.src = userData.dp ? userData.dp + "?v=" + Date.now() : "default_dp.png";
    nameInput.value = userData.name || "";
    ageInput.value = userData.age || "";
    genderSelect.value = userData.gender || "";
    cityInput.value = userData.city || "";
  }
});

// Save profile data
saveBtn.onclick = async () => {
  if (!uid) return;

  let dpURL = profileImg.src;

  // Upload new DP if selected
  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const sRef = storageRef(storage, `dps/${uid}_${Date.now()}_${file.name}`);
    await uploadBytes(sRef, file);
    dpURL = await getDownloadURL(sRef);
    dpURL += "?v=" + Date.now(); // Force refresh
    profileImg.src = dpURL;
  }

  // Update Firebase DB
  await update(dbRef(db, `users/${uid}`), {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderSelect.value,
    city: cityInput.value,
    dp: dpURL
  });

  saveMsg.style.display = "block";
  setTimeout(() => saveMsg.style.display = "none", 2000);
};

// Back to Chat
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
