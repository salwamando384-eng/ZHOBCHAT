import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const uid = auth.currentUser.uid;
const userRef = ref(db, "users/" + uid);

// Load old profile data
onValue(userRef, snap => {
  let data = snap.val();
  if (!data) return;

  document.getElementById("profilePicPreview").src = data.dp;
  document.getElementById("nameInput").value = data.name || "";
  document.getElementById("ageInput").value = data.age || "";
  document.getElementById("genderInput").value = data.gender || "";
  document.getElementById("cityInput").value = data.city || "";
  document.getElementById("aboutInput").value = data.about || "";
});

// Image preview
const profilePicInput = document.getElementById("profilePicInput");
profilePicInput.onchange = () => {
  const file = profilePicInput.files[0];
  if (!file) return;

  document.getElementById("profilePicPreview").src = URL.createObjectURL(file);
};

// Save Profile
document.getElementById("saveProfileBtn").onclick = async () => {
  const file = profilePicInput.files[0];

  let dpURL;

  if (file) {
    const imgRef = sRef(storage, "dp/" + uid + ".jpg");

    await uploadBytes(imgRef, file);
    dpURL = await getDownloadURL(imgRef);
  }

  update(userRef, {
    dp: dpURL || document.getElementById("profilePicPreview").src,
    name: document.getElementById("nameInput").value,
    age: document.getElementById("ageInput").value,
    gender: document.getElementById("genderInput").value,
    city: document.getElementById("cityInput").value,
    about: document.getElementById("aboutInput").value
  });

  alert("Profile Updated!");
};

// Back Button
document.getElementById("backBtn").onclick = () => {
  location.href = "chat.html";
};
