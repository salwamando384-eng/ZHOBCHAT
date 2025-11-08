import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const usersList = document.getElementById("usersList");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location = "signup.html";
  } else {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      usersList.innerHTML = "";
      snapshot.forEach((child) => {
        const u = child.val();
        const uid = child.key;
        if (uid === user.uid) return; // خود کو hide کریں

        const div = document.createElement("div");
        div.classList.add("user");
        div.innerHTML = `
          <img src="${u.dp || 'default_dp.png'}" class="dp" />
          <div><b>${u.name}</b><br>${u.city}</div>
        `;
        div.addEventListener("click", () => {
          localStorage.setItem("chatWith", uid);
          window.location = "private_chat.html";
        });
        usersList.appendChild(div);
      });
    });
  }
});
