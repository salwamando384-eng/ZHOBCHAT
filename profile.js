import { auth, db, storage } from "./firebase_config.js";

import {
  ref,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


const dpInput = document.getElementById("dpInput");
const saveBtn = document.getElementById("saveBtn");
const profileImg = document.getElementById("profileImg");
const saveMsg = document.getElementById("saveMsg");


// Load current DP
auth.onAuthStateChanged(user => {
  if (!user) return;

  fetchCurrentDP(user.uid);
});


function fetchCurrentDP(uid) {
  const userRef = ref(db, "users/" + uid);

  fetch(`https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app/users/${uid}.json`)
    .then(res => res.json())
    .then(data => {
      if (data && data.dp) {
        profileImg.src = data.dp;
      }
    });
}


// Save Button → Upload New DP
saveBtn.onclick = async () => {

  const user = auth.currentUser;
  if (!user) return;

  const file = dpInput.files[0];

  if (!file) {
    alert("Please select an image.");
    return;
  }

  const dpStorePath = storageRef(storage, "dp/" + user.uid + ".jpg");

  await uploadBytes(dpStorePath, file);

  const downloadURL = await getDownloadURL(dpStorePath);

  await update(ref(db, "users/" + user.uid), {
    dp: downloadURL
  });

  profileImg.src = downloadURL;

  // ✔ Profile Saved message
  saveMsg.style.display = "block";
  setTimeout(() => {
    saveMsg.style.display = "none";
  }, 2500);
};
