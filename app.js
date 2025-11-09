// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.firebaseio.com",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
  const profilePic = document.getElementById("profile-pic").files[0];
  const nameColor = document.getElementById("name-color").value || "#000000";
  const msgColor = document.getElementById("msg-color").value || "#000000";

  const createBtn = document.getElementById("create-account-btn");
  createBtn.disabled = true;
  createBtn.textContent = "Creating account...";

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;
      const uploadPromise = profilePic 
        ? storage.ref(`profilePics/${uid}`).put(profilePic).then(() => storage.ref(`profilePics/${uid}`).getDownloadURL())
        : Promise.resolve("https://i.postimg.cc/3Rwgjfyk/default.png");

      uploadPromise.then((photoURL) => {
        return db.ref("users/" + uid).set({
          username,
          email,
          gender,
          photoURL,
          nameColor,
          msgColor,
          createdAt: new Date().toISOString()
        });
      }).then(() => {
        alert("Signup successful!");
        window.location.href = "https://salwamando384-eng.github.io/ZHOBCHAT/";
      });
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

// Logout
document.getElementById("logout-btn")?.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "https://salwamando384-eng.github.io/ZHOBCHAT/";
  });
});
