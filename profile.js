import { auth, db, storage } from "./firebase_config.js";

import {
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


// WAIT FOR USER (GitHub needs delay)
function waitForUser() {
  return new Promise(resolve => {
    const check = setInterval(() => {
      if (auth.currentUser) {
        clearInterval(check);
        resolve(auth.currentUser);
      }
    }, 300);
  });
}

(async () => {

const user = await waitForUser();
const uid = user.uid;

const name = document.getElementById("name");
const age = document.getElementById("age");
const gender = document.getElementById("gender");
const city = document.getElementById("city");
const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");

const userRef = ref(db, "users/" + uid);


// Load profile
const snap = await get(userRef);
if (snap.exists()) {
  const d = snap.val();
  name.value = d.name || "";
  age.value = d.age || "";
  gender.value = d.gender || "";
  city.value = d.city || "";
  profileImg.src = d.dp || "default_dp.png";
}


// Save Profile (Text only)
document.getElementById("saveBtn").onclick = async () => {
  await update(userRef, {
    name: name.value,
    age: age.value,
    gender: gender.value,
    city: city.value
  });

  alert("Saved Profile");
};


// BACK
document.getElementById("backBtn").onclick = () => {
  window.location.href = "chat.html";
};


// Change DP
dpInput.onchange = async () => {
  const file = dpInput.files[0];
  if (!file) return alert("Choose image");

  const dpRef = sRef(storage, "dp/" + uid + ".jpg");

  await uploadBytes(dpRef, file);
  const url = await getDownloadURL(dpRef);

  await update(userRef, { dp: url });

  profileImg.src = url;

  alert("Profile photo updated");
};

})();
