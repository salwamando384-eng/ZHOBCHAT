import { auth, db, storage } from "./firebase_config.js";
import {
  ref as dbRef,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const saveDpBtn = document.getElementById("saveDpBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");
const saveMsg = document.getElementById("saveMsg");

const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");

// Back button
backBtn.onclick = () => window.location.href = "chat.html";

auth.onAuthStateChanged(user => {
  if (!user) return;

  const uid = user.uid;
  const userRef = dbRef(db, "users/" + uid);

  onValue(userRef, snapshot => {
    const data = snapshot.val();
    if (!data) return;

    profileImg.src = (data.dp || "default_dp.png") + "?t=" + Date.now();
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
  });

  // Save DP
  saveDpBtn.onclick = async () => {
    const file = dpInput.files[0];
    if (!file) return alert("Select an image");

    const dpPath = storageRef(storage, "dp/" + uid + ".jpg");
    await uploadBytes(dpPath, file);

    const url = await getDownloadURL(dpPath);
    await update(userRef, { dp: url });

    profileImg.src = url + "?t=" + Date.now();
    showMsg("Profile picture updated!");
  };

  // Save Name, Age, Gender, City
  saveProfileBtn.onclick = async () => {
    await update(userRef, {
      name: nameInput.value,
      age: ageInput.value,
      gender: genderInput.value,
      city: cityInput.value
    });

    showMsg("Profile updated!");
  };
});

// Show message
function showMsg(msg) {
  saveMsg.textContent = msg;
  saveMsg.style.display = "block";
  setTimeout(() => saveMsg.style.display = "none", 2000);
}
