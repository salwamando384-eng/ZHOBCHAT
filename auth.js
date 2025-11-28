import { auth, db, OWNER_UID } from "./firebase_config.js";
import { set, ref } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const signupBtn = document.getElementById("btnSignup");
const signupDp = document.getElementById("signupDp");

function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

signupBtn.onclick = async () => {
    try {
        document.getElementById("authError").innerHTML = "Signing up...";

        let dpBase64 = "";
        if (signupDp.files[0]) {
            dpBase64 = await fileToBase64(signupDp.files[0]);
        }

        const email = signupEmail.value;
        const pass = signupPass.value;

        const userCred = await createUserWithEmailAndPassword(auth, email, pass);
        const uid = userCred.user.uid;

        await set(ref(db, "users/" + uid), {
            name: signupName.value,
            age: signupAge.value,
            gender: signupGender.value,
            city: signupCity.value,
            dp: dpBase64
        });

        document.getElementById("authSection").classList.add("hide");
        document.getElementById("mainChat").classList.remove("hide");
    }
    catch (e) {
        document.getElementById("authError").innerHTML = "Signup error";
    }
};
