// Firebase Config
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value.trim();
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const dpFile = document.getElementById("dp").files[0];

  if (!name || !email || !password) {
    alert("براہ کرم نام، ای میل اور پاس ورڈ ضرور بھریں");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // DP optional
      if (dpFile) {
        const reader = new FileReader();
        reader.onload = function() {
          saveUser(user.uid, reader.result);
        }
        reader.readAsDataURL(dpFile);
      } else {
        saveUser(user.uid, "default_dp.png");
      }

      function saveUser(uid, dpURL) {
        db.ref("users/" + uid).set({
          name,
          age,
          gender,
          city,
          email,
          dp: dpURL,
          blockedUsers: []
        })
        .then(() => {
          alert("Signup کامیاب 🎉");
          window.location = "chat.html";
        })
        .catch((err) => alert("Database error: " + err.message));
      }
    })
    .catch((error) => {
      alert("Signup Error: " + error.message);
    });
});
