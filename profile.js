import { auth, db, storage } from "./firebase_config.js";
import { ref, get, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");
const saveMsg = document.getElementById("saveMsg");

let currentUser;

// Load profile data when user is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUser = user;
  const userRef = ref(db, "users/" + user.uid);

  onValue(userRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    profileImg.src = data.dp ? data.dp + "?t=" + Date.now() : "default_dp.png";
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
  });
});

// Save profile info
saveBtn.onclick = async () => {
  if (!currentUser) return;

  const userRef = ref(db, "users/" + currentUser.uid);
  let dpURL = null;

  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const storageRef = sRef(storage, "dp/" + currentUser.uid + ".jpg");

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

  if (dpURL) profileImg.src = dpURL + "?t=" + Date.now();
  saveMsg.style.display = "block";
  setTimeout(() => saveMsg.style.display = "none", 2500);
};

// Back to Chatroom
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
