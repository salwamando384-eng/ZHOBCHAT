import { auth, db, storage } from "./firebase_config.js";
import { ref as dbRef, update, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderSelect = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveMsg = document.getElementById("saveMsg");
const saveBtn = document.getElementById("saveProfileBtn"); // FIXED

let uid;

// Load Current User Data
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  uid = user.uid;

  const snap = await get(dbRef(db, "users/" + uid));
  if (snap.exists()) {
    const data = snap.val();

    let dp = data.dp ? data.dp + "?v=" + Date.now() : "default_dp.png";
    profileImg.src = dp;

    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderSelect.value = data.gender || "";
    cityInput.value = data.city || "";
  }
});

// Save Profile
saveBtn.onclick = async () => {
  if (!uid) return;

  let dpURL = profileImg.src;

  // If new DP selected
  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const sRef = storageRef(storage, `dps/${uid}_${Date.now()}_${file.name}`); // FIXED PATH

    await uploadBytes(sRef, file);
    dpURL = await getDownloadURL(sRef);

    dpURL = dpURL + "?v=" + Date.now(); // FORCE UPDATE
    profileImg.src = dpURL;
  }

  // UPDATE instead of REPLACE
  await update(dbRef(db, "users/" + uid), {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderSelect.value,
    city: cityInput.value,
    dp: dpURL
  });

  saveMsg.innerHTML = "✅ Saved!";
  saveMsg.style.display = "block";
  setTimeout(() => saveMsg.style.display = "none", 2000);
};
