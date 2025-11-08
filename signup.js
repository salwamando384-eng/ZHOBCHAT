// Import Firebase modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

// Firebase config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const dpFile = document.getElementById("dp").files[0];

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    let dpUrl = "";
    if (dpFile) {
      const storageRef = sRef(storage, `users/${userId}/dp.jpg`);
      await uploadBytes(storageRef, dpFile);
      dpUrl = await getDownloadURL(storageRef);
    }

    await set(ref(database, `users/${userId}`), {
      name: name,
      age: age,
      gender: gender,
      city: city,
      dp: dpUrl,
      blockedUsers: []
    });

    alert("Signup successful!");
    window.location = "chat.html"; // Redirect to chat page

  } catch (error) {
    alert(error.message);
  }
});
