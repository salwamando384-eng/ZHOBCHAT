import { auth, db } from "./firebase_config.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const backBtn = document.getElementById("backBtn");
const dpUpload = document.getElementById("dpUpload");
const profileImage = document.getElementById("profileImage");
const nameInput = document.getElementById("nameInput");
const aboutInput = document.getElementById("aboutInput");
const saveBtn = document.getElementById("saveBtn");

const storage = getStorage();

let currentUser = null;

// Load current user
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  currentUser = user;

  const dbRef = ref(db);
  const snap = await get(child(dbRef, "users/" + user.uid));

  if (snap.exists()) {
    const data = snap.val();
    nameInput.value = data.name || "";
    aboutInput.value = data.about || "";
    profileImage.src = data.dp || "default_dp.png";
  }
});

// DP Upload
dpUpload.addEventListener("change", async () => {
  if (dpUpload.files.length === 0) return;

  const file = dpUpload.files[0];
  const storagePath = sRef(storage, "dp/" + currentUser.uid + ".jpg");

  await uploadBytes(storagePath, file);
  const url = await getDownloadURL(storagePath);

  profileImage.src = url;

  await set(ref(db, "users/" + currentUser.uid + "/dp"), url);
});

// SAVE PROFILE
saveBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  await set(ref(db, "users/" + currentUser.uid), {
    name: nameInput.value.trim(),
    about: aboutInput.value.trim(),
    dp: profileImage.src
  });

  alert("Profile Updated!");
});

// Back Button
backBtn.addEventListener("click", () => {
  location.href = "chat.html";
});
