import { auth, db, storage } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, get, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("nameInput");
const genderInput = document.getElementById("genderInput");
const ageInput = document.getElementById("ageInput");
const cityInput = document.getElementById("cityInput");
const aboutInput = document.getElementById("aboutInput");
const saveBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const profileMsg = document.getElementById("profileMsg");

let uid, currentDP = "";

onAuthStateChanged(auth, async (user)=>{
  if(!user){ location.href="index.html"; return; }
  uid = user.uid;
  const snap = await get(dbRef(db, `users/${uid}`));
  if(snap.exists()){
    const d = snap.val();
    nameInput.value = d.name || "";
    genderInput.value = d.gender || "";
    ageInput.value = d.age || "";
    cityInput.value = d.city || "";
    aboutInput.value = d.about || "";
    currentDP = d.dp || "default_dp.png";
    profileImg.src = currentDP;
  }
});

dpInput.onchange = ()=>{
  if(dpInput.files.length>0) profileImg.src = URL.createObjectURL(dpInput.files[0]);
}

saveBtn.onclick = async ()=>{
  profileMsg.textContent = "Saving...";
  let dpURL = currentDP;
  if(dpInput.files.length>0){
    const sref = sRef(storage, `dp/${uid}.jpg`);
    await uploadBytes(sref, dpInput.files[0]);
    dpURL = await getDownloadURL(sref);
  }
  await set(dbRef(db, `users/${uid}`), {
    name: nameInput.value,
    gender: genderInput.value,
    age: ageInput.value,
    city: cityInput.value,
    about: aboutInput.value,
    dp: dpURL,
    online: true,
    lastSeen: Date.now()
  });
  profileMsg.textContent = "Saved!";
  setTimeout(()=> profileMsg.textContent = "", 2000);
}

logoutBtn.onclick = async ()=>{
  await set(dbRef(db, `users/${auth.currentUser.uid}/online`), false);
  await set(dbRef(db, `users/${auth.currentUser.uid}/lastSeen`), Date.now());
  await signOut(auth);
  location.href = "index.html";
}
