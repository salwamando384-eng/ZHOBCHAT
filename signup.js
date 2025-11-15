import { auth, db } from "./firebase_config.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

signupBtn.onclick = () => {
  const email = email.value;
  const pass = password.value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then((userCred) => {
      const uid = userCred.user.uid;

      set(ref(db, "users/" + uid), {
        dp: "default_dp.png",
        name: "",
        age: "",
        gender: "",
        city: "",
        about: ""
      });

      window.location.href = "chat.html";
    })
    .catch((e) => alert(e.message));
};
