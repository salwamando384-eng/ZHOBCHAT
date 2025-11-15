import { auth } from "./firebase_config.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

loginBtn.onclick = () => {
  const email = email.value;
  const pass = password.value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      window.location.href = "chat.html";
    })
    .catch((e) => alert(e.message));
};
