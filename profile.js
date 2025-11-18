import { auth, db, storage } from "./firebase_config.js";
import { ref as dbRef, update, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

let currentUser = null;

// Load current profile
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  currentUser = user;
  const userRef = dbRef(db, "users/" + user.uid);

  get(userRef).then((snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    profileImg.src = data.dp || "default_dp.png";
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
  });
});

// Save profile
saveBtn.onclick = async () => {
  if (!currentUser) return;

  let dpUrl = profileImg.src;

  if (dpInput.files.length > 0) {
    const file = dpInput.files[0];
    const storageReference = storageRef(storage, "users/" + currentUser.uid + "/dp.jpg");
    await uploadBytes(storageReference, file);
    dpUrl = await getDownloadURL(storageReference);
  }

  const userRef = dbRef(db, "users/" + currentUser.uid);
  update(userRef, {
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    dp: dpUrl
  }).then(() => {
    alert("Profile updated!");
    profileImg.src = dpUrl + "?t=" + Date.now(); // Force reload
  }).catch((err) => console.log(err));
};

// Back button
backBtn.onclick = () => {
  window.location.href = "chat.html";
};
