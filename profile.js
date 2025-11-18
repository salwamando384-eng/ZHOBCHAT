import { auth, db, storage } from "./firebase_config.js";
import { ref as dbRef, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderSelect = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveMsg = document.getElementById("saveMsg");

let uid;

// LOAD CURRENT USER DATA
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  uid = user.uid;

  const snap = await get(dbRef(db, "users/" + uid));
  if (snap.exists()) {
    const data = snap.val();

    // FORCE NEW IMAGE REFRESH
    let dp = data.dp ? data.dp + "?v=" + Date.now() : "default_dp.png";
    profileImg.src = dp;

    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderSelect.value = data.gender || "";
    cityInput.value = data.city || "";
  }
});

// SAVE PROFILE
document.getElementById("saveProfileBtn").onclick = async () => {
  if (!uid) return;

  let dpURL = profileImg.src;

  // NEW DP SELECTED
  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const sRef = storageRef(storage, "users/" + uid + "/dp.jpg");

    await uploadBytes(sRef, file);
    dpURL = await getDownloadURL(sRef);

    // FORCE NEW IMAGE LOAD
    dpURL += "?v=" + Date.now();
    profileImg.src = dpURL;
  }

  // SAVE ALL DATA TO DATABASE
  await set(dbRef(db, "users/" + uid), {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderSelect.value,
    city: cityInput.value,
    dp: dpURL
  });

  saveMsg.style.display = "block";
  setTimeout(() => saveMsg.style.display = "none", 2000);
};

// BACK BUTTON
document.getElementById("backBtn").onclick = () => {
  window.location.href = "chatroom.html";
};
