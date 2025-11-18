import { auth, db, storage } from "./firebase_config.js";
import { ref as dbRef, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderSelect = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveMsg = document.getElementById("saveMsg");
const saveBtn = document.getElementById("saveProfileBtn");

let uid = null;

// Load current user
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  uid = user.uid;

  const snap = await get(dbRef(db, "users/" + uid));
  if (snap.exists()) {
    const data = snap.val();

    profileImg.src = (data.dp || "default_dp.png") + "?t=" + Date.now();
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderSelect.value = data.gender || "";
    cityInput.value = data.city || "";
  }
});

// Save Profile Handler
saveBtn.onclick = async () => {
  if (!uid) return;

  saveMsg.style.color = "black";
  saveMsg.textContent = "Saving...";

  let dpURL = null;

  // If new DP selected
  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const picRef = sRef(storage, "users/" + uid + "/dp.jpg");

    await uploadBytes(picRef, file);
    dpURL = await getDownloadURL(picRef);
  }

  const dataToUpdate = {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderSelect.value,
    city: cityInput.value
  };

  if (dpURL) dataToUpdate.dp = dpURL;

  await update(dbRef(db, "users/" + uid), dataToUpdate);

  saveMsg.style.color = "green";
  saveMsg.textContent = "Profile Updated ✔";

  if (dpURL) {
    profileImg.src = dpURL + "?t=" + Date.now(); // force refresh
  }
};
