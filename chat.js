import { auth, db, OWNER_UID } from "./firebase_config.js";
import { ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const msgBox = document.getElementById("msgBox");
const btnSend = document.getElementById("btnSend");
const messages = document.getElementById("messages");
const btnDeleteAll = document.getElementById("btnDeleteAll");

btnSend.onclick = () => {
    push(ref(db, "messages"), {
        uid: auth.currentUser.uid,
        text: msgBox.value,
        time: Date.now()
    });
    msgBox.value = "";
};

onValue(ref(db, "messages"), (snap) => {
    messages.innerHTML = "";
    snap.forEach(m => {
        messages.innerHTML += `<p>${m.val().text}</p>`;
    });
});

// OWNER FEATURE
auth.onAuthStateChanged(() => {
    if (!auth.currentUser) return;

    if (auth.currentUser.uid === OWNER_UID) {
        btnDeleteAll.classList.remove("hide");
    }
});

btnDeleteAll.onclick = () => {
    remove(ref(db, "messages"));
};
