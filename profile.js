import { auth, db, storage } from "./firebase_config.js";
import { ref as dbRef, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");
const saveMsg = document.getElementById("saveMsg");

let currentUser = null;
let dpFile = null;

// DP file selected
dpInput.onchange = e => { dpFile = e.target.files[0]; };

// Go back to chat
backBtn.onclick = () => { window.location.href = "chat.html"; };

// Load profile
onAuthStateChanged(auth, user => {
  if (!user) return;
  currentUser = user;

  const userRef = dbRef(db, "users/" + user.uid);
  onValue(userRef, snapshot => {
    const data = snapshot.val();
    if (!data) return;
    profileImg.src = data.dp ? data.dp + "?t=" + Date.now() : "default_dp.png";
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
  });
});

// Save profile
saveBtn.onclick = async () => {
  if (!currentUser) return;

  let dpURL = profileImg.src;
  if (dpFile) {
    const storageReference = storageRef(storage, "dp/" + currentUser.uid);
    await uploadBytes(storageReference, dpFile);
    dpURL = await getDownloadURL(storageReference);
  }

  await set(dbRef(db, "users/" + currentUser.uid), {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    dp: dpURL
  });

  saveMsg.style.display = "block";
  setTimeout(() => saveMsg.style.display = "none", 3000);

  profileImg.src = dpURL + "?t=" + Date.now(); // refresh DP immediately
};
