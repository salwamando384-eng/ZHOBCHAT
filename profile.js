// profile.js
import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  uploadBytes,
  getDownloadURL,
  ref as storageRef
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const uid = auth.currentUser.uid;
const userRef = ref(db, "users/" + uid);

const profilePicInput = document.getElementById("profilePicInput");
const profilePicPreview = document.getElementById("profilePicPreview");

let dpFile = null;

// Preview DP
profilePicInput.onchange = (e) => {
  dpFile = e.target.files[0];

  let reader = new FileReader();
  reader.onload = () => {
    profilePicPreview.src = reader.result;
  };
  reader.readAsDataURL(dpFile);
};

// Load old data
onValue(userRef, snap => {
  let data = snap.val();
  if (!data) return;

  if (data.dp) profilePicPreview.src = data.dp;
  if (data.name) nameInput.value = data.name;
  if (data.age) ageInput.value = data.age;
  if (data.gender) genderInput.value = data.gender;
  if (data.city) cityInput.value = data.city;
  if (data.about) aboutInput.value = data.about;
});

// Save
saveProfileBtn.onclick = async () => {
  let dpURL = null;

  if (dpFile) {
    const dpRef = storageRef(storage, "dp/" + uid + ".jpg");
    await uploadBytes(dpRef, dpFile);
    dpURL = await getDownloadURL(dpRef);
  }

  update(userRef, {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    about: aboutInput.value,
    dp: dpURL || profilePicPreview.src
  });

  alert("Profile saved!");
};

// Back
backBtn.onclick = () => {
  location.href = "chat.html";
};
