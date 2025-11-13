import { db } from './firebase_config.js';
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const uid = localStorage.getItem('userUid');
if(!uid) location.href = 'login.html';

const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfile = document.getElementById('closeProfile');
const saveProfile = document.getElementById('saveProfile');

profileBtn.onclick = () => profileModal.style.display = 'block';
closeProfile.onclick = () => profileModal.style.display = 'none';

async function loadProfile() {
  const snapshot = await get(ref(db, 'users/' + uid));
  const data = snapshot.val();
  if(data){
    document.getElementById('name').value = data.name || '';
    document.getElementById('age').value = data.age || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('city').value = data.city || '';
    document.getElementById('dp').value = data.dp || '';
  }
}

saveProfile.onclick = async () => {
  await update(ref(db, 'users/' + uid), {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    city: document.getElementById('city').value,
    dp: document.getElementById('dp').value
  });
  profileModal.style.display = 'none';
}

loadProfile();
