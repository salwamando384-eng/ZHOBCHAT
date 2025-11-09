const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const dp = document.getElementById("dp");
const nameEl = document.getElementById("name");
const ageEl = document.getElementById("age");
const genderEl = document.getElementById("gender");
const cityEl = document.getElementById("city");
const blockBtn = document.getElementById("blockBtn");

const profileId = localStorage.getItem("profileView");

auth.onAuthStateChanged(async user => {
  if (!user) return location.href="login.html";
  if (!profileId) { alert("No profile selected"); return location.href="users.html"; }

  const snap = await db.ref("users/" + profileId).once("value");
  const target = snap.val();
  if (!target) { alert("User not found"); return; }

  dp.src = target.dp || 'default_dp.png';
  nameEl.textContent = target.name || '';
  ageEl.textContent = "Age: " + (target.age || '');
  genderEl.textContent = "Gender: " + (target.gender || '');
  cityEl.textContent = "City: " + (target.city || '');

  const meSnap = await db.ref("users/" + user.uid).once("value");
  const me = meSnap.val() || {};
  const blocked = me.blockedUsers || [];
  let isBlocked = blocked.includes(profileId);
  blockBtn.textContent = isBlocked ? "Unblock User" : "Block User";

  blockBtn.onclick = async () => {
    let newBlocked;
    if (isBlocked) newBlocked = blocked.filter(id => id !== profileId);
    else newBlocked = [...blocked, profileId];
    await db.ref("users/" + user.uid).update({ blockedUsers: newBlocked });
    alert(isBlocked ? "User Unblocked" : "User Blocked");
    location.reload();
  };
});
