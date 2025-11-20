import { auth, db, storage } from "./firebaseConfig.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const aboutInput = document.getElementById("about");

const saveBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const saveMsg = document.getElementById("saveMsg");

let uid, currentDP = "";

// Load user data
onAuthStateChanged(auth, async (user)=>{
  if(!user){ location.href="index.html"; return; }
  uid = user.uid;
  const snap = await get(ref(db,"users/"+uid));
  if(snap.exists()){
    const data = snap.val();
    nameInput.value = data.name || "";
    ageInput.value = data.age || "";
    genderInput.value = data.gender || "";
    cityInput.value = data.city || "";
    aboutInput.value = data.about || "";
    currentDP = data.dp || "default_dp.png";
    profileImg.src = currentDP;
  }
});

// Preview new DP
dpInput.onchange = ()=>{
  if(dpInput.files.length>0){
    profileImg.src = URL.createObjectURL(dpInput.files[0]);
  }
}

// Save profile
saveBtn.onclick = async ()=>{
  saveMsg.textContent = "Saving...";
  let dpURL = currentDP;

  if(dpInput.files.length>0){
    const file = dpInput.files[0];
    const storageRef = sRef(storage,"dp/"+uid+".jpg");
    await uploadBytes(storageRef,file);
    dpURL = await getDownloadURL(storageRef);
  }

  await set(ref(db,"users/"+uid),{
    name: nameInput.value,
    age: ageInput.value,
    gender: genderInput.value,
    city: cityInput.value,
    about: aboutInput.value,
    dp: dpURL,
    status: "online"
  });

  saveMsg.textContent = "✔ Profile Saved!";
  setTimeout(()=>saveMsg.textContent="",2000);
}

// Logout
logoutBtn.onclick = async ()=>{
  await signOut(auth);
  location.href="index.html";
}
