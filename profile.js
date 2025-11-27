// profile.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const dpFile = document.getElementById("dpFile");
const dpPreview = document.getElementById("dpPreview");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveBtn = document.getElementById("saveBtn");
const profileMsg = document.getElementById("profileMsg");

let currentUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUid = user.uid;

  const snap = await get(ref(db, "users/" + currentUid));
  if (snap.exists()) {
    const d = snap.val();
    dpPreview.src = d.dp || "default_dp.png";
    nameInput.value = d.name || "";
    ageInput.value = d.age || "";
    genderInput.value = d.gender || "";
    cityInput.value = d.city || "";
  }
});

// preview new image
dpFile.onchange = () => {
  const f = dpFile.files[0];
  if (!f) return;
  dpPreview.src = URL.createObjectURL(f);
};

saveBtn.onclick = async () => {
  if (!currentUid) return;
  saveBtn.innerText = "Saving...";
  profileMsg.innerText = "";

  const name = nameInput.value.trim();
  const age = ageInput.value.trim();
  const gender = genderInput.value;
  const city = cityInput.value.trim();

  let dpData = null;
  const file = dpFile.files[0];
  if (file) {
    dpData = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej("read error");
      r.readAsDataURL(file);
    });
  }

  const toUpdate = { name, age, gender, city };
  if (dpData) toUpdate.dp = dpData;

  try {
    await update(ref(db, "users/" + currentUid), toUpdate);
    profileMsg.style.color = "green";
    profileMsg.innerText = "Profile Saved!";
  } catch (err) {
    profileMsg.style.color = "red";
    profileMsg.innerText = err.message || "Save failed";
  } finally {
    saveBtn.innerText = "Save Profile";
    setTimeout(()=>profileMsg.innerText="", 2500);
  }
};
