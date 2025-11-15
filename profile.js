import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  set,
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

// Load profile
onValue(userRef, snap => {
  let data = snap.val();
  document.getElementById("profilePicPreview").src = data.dp;
});

// Upload DP
document.getElementById("profilePicInput").onchange = e => {
  let file = e.target.files[0];
  let storageRef = sRef(storage, "dp/" + uid);

  uploadBytes(storageRef, file).then(() => {
    getDownloadURL(storageRef).then(url => {
      update(userRef, { dp: url });
    });
  });
};

saveProfileBtn.onclick = () => {
  update(userRef, {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    about: aboutInput.value
  });
};

backBtn.onclick = () => window.location = "chat.html";
