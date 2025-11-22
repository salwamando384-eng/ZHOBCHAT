import { auth, db, storage } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { uploadBytes, getDownloadURL, ref as sRef } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

let uid = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    uid = user.uid;

    const snap = await get(ref(db, "users/" + uid));
    if (snap.exists()) {
        const data = snap.val();

        document.getElementById("name").value = data.name || "";
        document.getElementById("age").value = data.age || "";
        document.getElementById("gender").value = data.gender || "";
        document.getElementById("city").value = data.city || "";
        document.getElementById("dpPreview").src = data.dp || "default_dp.png";
    }
});

document.getElementById("saveBtn").addEventListener("click", async () => {
    let msg = document.getElementById("msg");
    msg.innerText = "Saving...";

    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;
    const city = document.getElementById("city").value.trim();
    const dpFile = document.getElementById("dpFile").files[0];

    let updatedData = { name, age, gender, city };

    try {
        if (dpFile) {
            const dpRef = sRef(storage, "dp/" + uid + ".jpg");
            await uploadBytes(dpRef, dpFile);
            const dpUrl = await getDownloadURL(dpRef);
            updatedData.dp = dpUrl;
            document.getElementById("dpPreview").src = dpUrl;
        }

        await update(ref(db, "users/" + uid), updatedData);

        msg.innerText = "Profile Updated!";
    } catch (error) {
        msg.innerText = error.message;
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});
