// Firebase Config (same as other files)
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const form = document.getElementById("loginForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) { alert("ای میل اور پاس ورڈ درج کریں"); return; }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location = "chat.html";
    })
    .catch(err => alert("Login error: " + err.message));
});
