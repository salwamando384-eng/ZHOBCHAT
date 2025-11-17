import { auth, db, storage } from "./firebase_config.js";
import {
  ref,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


const dpInput = document.getElementById("dpInput");
const dpPreview = document.getElementById("dpPreview");
const saveBtn = document.getElementById("saveProfileBtn");

// ------------ Load Current Profile ------------
auth.onAuthStateChanged(user => {
  if (!user) return;

  const userRef = ref(db, "users/" + user.uid);

  onValue(userRef, snap => {
    const data = snap.val();
    if (!data) return;

    if (data.dp) dpPreview.src = data.dp;
  });
});


// ----------- Save Profile + Upload DP ------------
saveBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  let dpURL = null;

  // If user selected a new image
  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];

    // Storage path: users/UID/profile.jpg
    const sRef = storageRef(storage, "users/" + user.uid + "/profile.jpg");

    // Upload file
    await uploadBytes(sRef, file);

    // Get URL
    dpURL = await getDownloadURL(sRef);
  }

  // Save to database
  await update(ref(db, "users/" + user.uid), {
    dp: dpURL ? dpURL : dpPreview.src   // keep old one if not changed
  });

  alert("Profile Saved!");
};
