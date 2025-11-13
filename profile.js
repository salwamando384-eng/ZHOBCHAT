import { auth, db } from './firebase_config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const nameInput = document.getElementById('name');
const cityInput = document.getElementById('city');
const ageInput = document.getElementById('age');
const dpInput = document.getElementById('dpInput');
const dpPreview = document.getElementById('dpPreview');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');
const backBtn = document.getElementById('backBtn');

let currentUser = null;
let dpDataUrl = 'default_dp.png';

// Load user data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = 'index.html';
    return;
  }
  currentUser = user;
  const userRef = ref(db, 'users/' + user.uid);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    nameInput.value = data.name || '';
    cityInput.value = data.city || '';
    ageInput.value = data.age || '';
    dpDataUrl = data.dp || 'default_dp.png';
    dpPreview.src = dpDataUrl;
  }
});

// Preview selected DP
dpInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    dpDataUrl = event.target.result;
    dpPreview.src = dpDataUrl;
  };
  reader.readAsDataURL(file);
});

// Save profile
saveBtn.addEventListener('click', async () => {
  if (!currentUser) return;

  const profileData = {
    name: nameInput.value.trim(),
    city: cityInput.value.trim(),
    age: ageInput.value.trim(),
    dp: dpDataUrl
  };

  await set(ref(db, 'users/' + currentUser.uid), profileData);
  statusDiv.textContent = '✅ Profile saved successfully!';
});

// Back to Chat
backBtn.addEventListener('click', () => {
  location.href = 'chat.html';
});
