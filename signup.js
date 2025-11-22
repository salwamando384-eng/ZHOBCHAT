import { auth, db, storage } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { set, ref } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { uploadBytes, getDownloadURL, ref as sRef } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

document.getElementById("signupBtn").addEventListener("click", async () => {
    let name = document.getElementById("name").value.trim();
    let age = document.getElementById("age").value.trim();
    let gender = document.getElementById("gender").value;
    let city = document.getElementById("city").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let dpFile = document.getElementById("dpFile").files[0];
    let msg = document.getElementById("msg");

    msg.innerText = "Creating account...";

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        let dpUrl = "default_dp.png";

        if (dpFile) {
            const dpRef = sRef(storage, "dp/" + uid + ".jpg");
            await uploadBytes(dpRef, dpFile);
            dpUrl = await getDownloadURL(dpRef);
        }

        await set(ref(db, "users/" + uid), {
            name,
            age,
            city,
            gender,
            email,
            dp: dpUrl
        });

        msg.innerText = "Signup Successful! Redirecting...";
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        msg.innerText = error.message;
    }
});
