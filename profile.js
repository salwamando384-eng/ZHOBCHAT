import { auth, db, storage } from "./firebase_config.js";
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderSelect = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");
const saveMsg = document.getElementById("saveMsg");

let currentUser = null;

// Load user data
onAuthStateChanged(auth, user => {
  if (!user) return;
  currentUser = user;
  const userRef = ref(db, "users/" + user.uid);

  onValue(userRef, snapshot => {
    const data = snapshot.val();
    if (!data) return;
    profileImg.src = data.dp || "default_dp.png";
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderSelect.value = data.gender || "";
    cityInput.value = data.city || "";
  });
});

// Save profile
saveBtn.onclick = async () => {
  if (!currentUser) return;
  let dpUrl = profileImg.src;

  // Upload new DP if selected
  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const storageRef = sRef(storage, "users/" + currentUser.uid + "/dp.jpg");
    await uploadBytes(storageRef, file);
    dpUrl = await getDownloadURL(storageRef);
  }

  set(ref(db, "users/" + currentUser.uid), {
    dp: dpUrl,
    name: nameInput.value,
    age: ageInput.value,
    gender: genderSelect.value,
    city: cityInput.value
  });

  saveMsg.innerText = "Profile information updated!";
  saveMsg.style.display = "block";
  profileImg.src = dpUrl + "?t=" + Date.now();
};

// Back to chat
backBtn.onclick = () => window.location.href = "chat.html";
