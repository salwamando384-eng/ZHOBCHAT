// small helper if you use signup.html standalone
import { auth, db, storage } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const suName = document.getElementById("suName");
const suEmail = document.getElementById("suEmail");
const suPass = document.getElementById("suPass");
const suDp = document.getElementById("suDp");
const signupBtn = document.getElementById("signupBtn");
const suMsg = document.getElementById("suMsg");

signupBtn.onclick = async ()=>{
  suMsg.textContent = "";
  if(!suName.value || !suEmail.value || suPass.value.length<6){ suMsg.textContent="Please fill fields"; return; }
  try{
    const cred = await createUserWithEmailAndPassword(auth, suEmail.value, suPass.value);
    const uid = cred.user.uid;
    let dpURL = "default_dp.png";
    if(suDp.files.length>0){
      const sref = sRef(storage, `dp/${uid}.jpg`);
      await uploadBytes(sref, suDp.files[0]);
      dpURL = await getDownloadURL(sref);
    }
    await set(ref(db, `users/${uid}`), { name: suName.value, dp: dpURL, online: true, lastSeen: Date.now() });
    window.location.href = "chat.html";
  }catch(e){
    suMsg.textContent = e.message;
  }
}
