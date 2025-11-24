// signup.js
import { auth, db, storage } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { set, ref as dbRef } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { uploadBytes, getDownloadURL, ref as sRef } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const signupBtn = document.getElementById("signupBtn");
const msg = document.getElementById("msg");

signupBtn.onclick = async () => {
  msg.style.color = "green";
  msg.textContent = "Creating account...";
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const dpFile = document.getElementById("dpFile").files[0];

  if (!email || !password) { msg.style.color = "red"; msg.textContent = "Enter email & password"; return; }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    let dpUrl = "default_dp.png";
    if (dpFile) {
      const dpRef = sRef(storage, "dp/" + uid + ".jpg");
      await uploadBytes(dpRef, dpFile);
      dpUrl = await getDownloadURL(dpRef);
    }

    await set(dbRef(db, "users/" + uid), {
      name: name || email.split("@")[0],
      age: age || "",
      city: city || "",
      gender: gender || "",
      email,
      dp: dpUrl
    });

    msg.style.color = "green";
    msg.textContent = "Signup Successful! Redirecting...";
    setTimeout(() => { window.location.href = "login.html"; }, 1200);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = error.message;
  }
};
