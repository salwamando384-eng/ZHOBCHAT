// profile.js
import { auth, db } from "./firebase_config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const dpFile = document.getElementById("dpFile");
const dpPreview = document.getElementById("dpPreview");
const nameEl = document.getElementById("p_name");
const ageEl = document.getElementById("p_age");
const genderEl = document.getElementById("p_gender");
const cityEl = document.getElementById("p_city");
const saveBtn = document.getElementById("saveProfileBtn");
const saveMsg = document.getElementById("saveMsg");

let currentUid = null;

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  currentUid = user.uid;
  const snap = await get(ref(db, "users/" + currentUid));
  if (snap.exists()) {
    const d = snap.val();
    dpPreview.src = d.dp || "default_dp.png";
    nameEl.value = d.name || "";
    ageEl.value = d.age || "";
    genderEl.value = d.gender || "";
    cityEl.value = d.city || "";
  }
});

dpFile.onchange = () => {
  const f = dpFile.files[0];
  if (!f) return;
  const fr = new FileReader();
  fr.onload = () => dpPreview.src = fr.result;
  fr.readAsDataURL(f);
};

saveBtn.onclick = async () => {
  if (!currentUid) return;
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const toUpdate = {
    name: nameEl.value.trim(),
    age: ageEl.value.trim(),
    gender: genderEl.value,
    city: cityEl.value.trim()
  };

  if (dpFile.files[0]) {
    const base64 = await readFileAsDataURL(dpFile.files[0]);
    toUpdate.dp = base64;
  }

  try {
    await update(ref(db, "users/" + currentUid), toUpdate);
    saveMsg.style.color = "green";
    saveMsg.textContent = "Profile saved!";
  } catch (err) {
    saveMsg.style.color = "red";
    saveMsg.textContent = "Save error: " + err.message;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Profile";
    setTimeout(()=> saveMsg.textContent = "", 2000);
  }
};

function readFileAsDataURL(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}
