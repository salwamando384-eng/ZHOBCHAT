// profile.js
import { auth, db } from "./firebase_config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const dpFileInput = document.getElementById("dpFile");
const dpPreview = document.getElementById("dpPreview");
const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const genderInput = document.getElementById("genderInput");
const cityInput = document.getElementById("cityInput");
const saveBtn = document.getElementById("saveBtn");
const profileMsg = document.getElementById("profileMsg");

let currentUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUid = user.uid;

  // load existing profile
  const snap = await get(ref(db, "users/" + currentUid));
  if (snap.exists()) {
    const data = snap.val();
    dpPreview.src = data.dp || "default_dp.png";
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
  }
});

// preview on file select
dpFileInput.onchange = () => {
  const file = dpFileInput.files[0];
  if (!file) return;
  dpPreview.src = URL.createObjectURL(file);
};

saveBtn.onclick = async () => {
  if (!currentUid) return;
  saveBtn.innerText = "Saving...";
  profileMsg.innerText = "";

  try {
    const name = nameInput.value.trim();
    const age = ageInput.value.trim();
    const gender = genderInput.value;
    const city = cityInput.value.trim();

    let dpValue = null;
    const file = dpFileInput.files[0];
    if (file) {
      // convert to base64 data URL
      dpValue = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = err => rej(err);
        reader.readAsDataURL(file);
      });
    } else {
      // keep existing dp already loaded in preview (could be default_dp.png or data URL)
      dpValue = dpPreview.src;
    }

    // update DB
    await update(ref(db, "users/" + currentUid), {
      dp: dpValue,
      name: name,
      age: age,
      gender: gender,
      city: city
    });

    profileMsg.style.color = "green";
    profileMsg.innerText = "Profile Saved!";
    saveBtn.innerText = "Save Profile";

    // remove message after 2.5s
    setTimeout(() => { profileMsg.innerText = ""; }, 2500);
  } catch (err) {
    console.error(err);
    profileMsg.style.color = "red";
    profileMsg.innerText = err.message || "Save error";
    saveBtn.innerText = "Save Profile";
  }
};
