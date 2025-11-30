// profile.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const dpInput = document.getElementById("profilePicInput") || document.getElementById("dpFile");
const dpPreview = document.getElementById("profilePicPreview") || document.getElementById("dpPreview");
const nameInput = document.getElementById("nameInput") || document.getElementById("name");
const ageInput = document.getElementById("ageInput") || document.getElementById("age");
const genderInput = document.getElementById("genderInput") || document.getElementById("gender");
const cityInput = document.getElementById("cityInput") || document.getElementById("city");
const aboutInput = document.getElementById("aboutInput") || document.getElementById("about");
const saveBtn = document.getElementById("saveProfileBtn") || document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");
const msgEl = document.getElementById("profileMsg") || document.getElementById("msg");

let currentUid = null;
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUid = user.uid;
  // load DB profile
  const snap = await get(ref(db, "users/" + currentUid));
  if (snap.exists()) {
    const data = snap.val();
    if (dpPreview && data.dp) dpPreview.src = data.dp;
    if (nameInput && data.name) nameInput.value = data.name;
    if (ageInput && data.age) ageInput.value = data.age;
    if (genderInput && data.gender) genderInput.value = data.gender;
    if (cityInput && data.city) cityInput.value = data.city;
    if (aboutInput && data.about) aboutInput.value = data.about;
  }
});

// Preview chosen image
if (dpInput) {
  dpInput.addEventListener("change", () => {
    const f = dpInput.files?.[0];
    if (f && dpPreview) dpPreview.src = URL.createObjectURL(f);
  });
}

// Save handler
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    if (!currentUid) return alert("Not signed in");
    saveBtn.disabled = true;
    const origText = saveBtn.innerText;
    saveBtn.innerText = "Saving...";

    try {
      const updates = {};
      updates.name = (nameInput?.value || "").trim();
      updates.age = (ageInput?.value || "").trim();
      updates.gender = (genderInput?.value || "").trim();
      updates.city = (cityInput?.value || "").trim();
      updates.about = (aboutInput?.value || "").trim();

      const file = dpInput?.files?.[0];
      if (file) {
        // convert to base64
        updates.dp = await fileToDataURL(file);
      }

      await update(ref(db, "users/" + currentUid), updates);
      if (msgEl) msgEl.innerText = "Profile saved";
      else alert("Profile saved");
    } catch (err) {
      console.error(err);
      if (msgEl) msgEl.innerText = err.message;
      else alert(err.message || "Save failed");
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = origText;
    }
  });
}

// Back button
if (backBtn) backBtn.addEventListener("click", () => {
  window.location.href = "chat.html";
});

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej(new Error("File read error"));
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
}
