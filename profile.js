import { db } from './firebase_config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const profileDiv = document.getElementById('profileDetails');
const backBtn = document.getElementById('backBtn');

const profileUid = localStorage.getItem('profileView');
if (!profileUid) location.href = 'chat.html';

get(ref(db, `users/${profileUid}`)).then(snapshot => {
  const u = snapshot.val();
  profileDiv.innerHTML = `
    <img src="${u.dp || 'default_dp.png'}" class="dp">
    <p>Name: ${u.name}</p>
    <p>Age: ${u.age}</p>
    <p>Gender: ${u.gender}</p>
    <p>City: ${u.city}</p>
  `;
});

backBtn.addEventListener('click', () => {
  location.href = 'chat.html';
});
