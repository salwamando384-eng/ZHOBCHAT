import { auth, db } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const aboutInput = document.getElementById("about");

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

// Signup
signupBtn.onclick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if(!email || !password || !nameInput.value) {
    msg.textContent = "تمام فیلڈز پر کریں!";
    return;
  }

  try{
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await set(ref(db, "users/" + uid), {
      name: nameInput.value,
      age: ageInput.value,
      gender: genderInput.value,
      city: cityInput.value,
      about: aboutInput.value,
      dp: "default_dp.png",
      status: "online",
      isAdmin: false
    });

    msg.style.color="green";
    msg.textContent = "Signup Successful! Redirecting...";
    setTimeout(()=>{ location.href="chat.html"; }, 1000);
  }catch(err){
    msg.textContent = err.message;
  }
};

// Login
loginBtn.onclick = async ()=>{
  const email = emailInput.value;
  const password = passwordInput.value;
  if(!email || !password){
    msg.textContent="ایمیل اور پاسورڈ درج کریں";
    return;
  }

  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    await set(ref(db, "users/" + uid + "/status"), "online");
    msg.style.color="green";
    msg.textContent="Login Successful! Redirecting...";
    setTimeout(()=>{ location.href="chat.html"; }, 1000);
  }catch(err){
    msg.textContent=err.message;
  }
};
