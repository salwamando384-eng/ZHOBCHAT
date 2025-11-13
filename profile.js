import { auth, db, storage } from './firebase_config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, get, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const nameInput = document.getElementById('name');
const cityInput = document.getElementById('city');
const ageInput = document.getElementById('age');
const dpImg = document.getElementById('dpImg');
const dpUpload = document.getElementById('dpUpload');
const saveBtn = document.getElementById('saveProfileBtn');
const statusDiv = document.getElementById('status');

let currentUser = null;
let uploadedDPUrl = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) location.href = 'index.html';
  currentUser = user;

  const snapshot = await get(dbRef(db, 'users/' + user.uid));
  if (snapshot.exists()) {
    const data = snapshot.val();
    nameInput.value = data.name || '';
    cityInput.value = data.city || '';
    ageInput.value = data.age || '';
    dpImg.src = data.dp || 'default_dp.png';
    uploadedDPUrl = data.dp || 'default_dp.png';
  }
});

dpUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const storageReference = storageRef(storage, `profile_pics/${currentUser.uid}`);
  await uploadBytes(storageReference, file);
  uploadedDPUrl = await getDownloadURL(storageReference);
  dpImg.src = uploadedDPUrl;
});

saveBtn.addEventListener('click', async () => {
  if (!currentUser) return;

  await set(dbRef(db, 'users/' + currentUser.uid), {
    name: nameInput.value,
    city: cityInput.value,
    age: ageInput.value,
    dp: uploadedDPUrl || 'default_dp.png'
  });
  statusDiv.textContent = '✅ Profile Saved!';
});
