// profile.js
import { auth, db, storage } from "./firebase_config.js";
import { ref as dbRef, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// DOM elements
const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const saveDpBtn = document.getElementById("saveDpBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const backBtn = document.getElementById("backBtn");
const saveMsg = document.getElementById("saveMsg");

const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");

// Back to chatroom button
backBtn.onclick = () => {
  window.location.href = "chat.html";
};

// Auth state
auth.onAuthStateChanged(user => {
  if (!user) return window.location.href = "login.html";
  const uid = user.uid;
  const userRef = dbRef(db, "users/" + uid);

  // Real-time listener for profile data
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Add timestamp to prevent cache
    profileImg.src = (data.dp || "default_dp.png") + "?t=" + new Date().getTime();
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
  });

  // Upload / change DP
  saveDpBtn.onclick = async () => {
    const file = dpInput.files[0];
    if (!file) return alert("Please select an image.");

    try {
      const dpStorePath = storageRef(storage, "dp/" + uid + ".jpg");
      await uploadBytes(dpStorePath, file);
      const downloadURL = await getDownloadURL(dpStorePath);

      await update(userRef, { dp: downloadURL });

      // Force reload to prevent cached image
      profileImg.src = downloadURL + "?t=" + new Date().getTime();

      showSaveMessage("Profile picture updated!");
    } catch (err) {
      alert("Error updating profile picture: " + err.message);
    }
  };

  // Save profile info
  saveProfileBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const age = ageInput.value.trim();
    const gender = genderInput.value.trim();
    const city = cityInput.value.trim();

    try {
      await update(userRef, { name, age, gender, city });
      showSaveMessage("Profile information updated!");
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };
});

// Helper function to show save message
function showSaveMessage(msg) {
  saveMsg.textContent = msg;
  saveMsg.style.display = "block";
  setTimeout(() => {
    saveMsg.style.display = "none";
  }, 2500);
}
