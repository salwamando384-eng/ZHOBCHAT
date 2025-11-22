import { auth } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("loginBtn").onclick = async () => {
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let msg = document.getElementById("msg");

    msg.innerText = "Logging in...";

    try {
        await signInWithEmailAndPassword(auth, email, password);
        msg.innerText = "Success!";
        window.location.href = "chat.html"; // ← Main page
    } catch (error) {
        msg.innerText = error.message;
    }
};
