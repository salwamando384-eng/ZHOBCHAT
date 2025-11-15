import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { set, ref } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

document.getElementById("signupBtn").onclick = () => {
  let email = email.value;
  let pass = password.value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(user => {
      set(ref(db, "users/" + user.user.uid), {
        dp: "default_dp.png",
        name: "",
        city: "",
        about: ""
      });
      window.location = "profile.html";
    });
};
