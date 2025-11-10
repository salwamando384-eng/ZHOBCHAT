// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Signup
document.getElementById("signup-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "Unknown";
  const nameColor = document.getElementById("name-color").value;
  const msgColor = document.getElementById("msg-color").value;

  const createBtn = document.getElementById("create-account-btn");
  createBtn.disabled = true;
  createBtn.textContent = "Creating account...";

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;

      return db.ref("users/" + uid).set({
        username,
        email,
        gender,
        nameColor,
        msgColor,
        photoURL: "https://i.postimg.cc/3Rwgjfyk/default.png", // default DP
        createdAt: new Date().toISOString()
      });
    })
    .then(() => {
      alert("Signup successful!");
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    })
    .finally(() => {
      createBtn.disabled = false;
      createBtn.textContent = "Signup";
    });
});

// Login
document.getElementById("login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
});
