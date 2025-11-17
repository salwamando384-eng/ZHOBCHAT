// profile.js
import { auth, db, storage } from "./firebase_config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const dpInput = document.getElementById("profilePicInput");
const dpPreview = document.getElementById("profilePicPreview");
const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const genderInput = document.getElementById("genderInput");
const cityInput = document.getElementById("cityInput");
const aboutInput = document.getElementById("aboutInput");
const saveBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");
const saveMsg = document.getElementById("saveMsg");

auth.onAuthStateChanged(async user => {
  if (!user) { location.href = "login.html"; return; }
  const uid = user.uid;
  const userRef = ref(db, "users/" + uid);
  const snap = await get(userRef);
  if (snap.exists()) {
    const d = snap.val();
    if (d.dp) dpPreview.src = d.dp;
    if (d.name) nameInput.value = d.name;
    if (d.age) ageInput.value = d.age;
    if (d.gender) genderInput.value = d.gender;
    if (d.city) cityInput.value = d.city;
    if (d.about) aboutInput.value = d.about;
  }
});

dpInput.onchange = () => {
  const file = dpInput.files[0];
  if (file) dpPreview.src = URL.createObjectURL(file);
};

saveBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in");
  const uid = user.uid;
  const userRef = ref(db, "users/" + uid);

  let dpURL = "";
  const file = dpInput.files[0];
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

  saveMsg.style.display = "block";
  setTimeout(() => saveMsg.style.display = "none", 2500);
};

backBtn.onclick = () => { location.href = "chat.html"; };
