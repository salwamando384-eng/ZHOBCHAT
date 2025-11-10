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

const usernameElem = document.getElementById("username");
const profilePicElem = document.getElementById("profile-pic");

// Check user login
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    db.ref("users/" + uid).once("value").then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        usernameElem.textContent = data.username || "User";
        profilePicElem.src = data.photoURL || "https://i.postimg.cc/3Rwgjfyk/default.png";
      }
    });
  } else {
    alert("Please login first!");
    window.location.href = "index.html";
  }
});

// Upload new profile picture
document.getElementById("upload-btn").addEventListener("click", () => {
  const file = document.getElementById("new-pic").files[0];
  const user = auth.currentUser;

  if (!file) {
    alert("Please select an image first!");
    return;
  }

  if (user) {
    const uid = user.uid;
    const ref = storage.ref("profilePics/" + uid);

    ref.put(file).then(() => {
      return ref.getDownloadURL();
    }).then((url) => {
      profilePicElem.src = url;
      return db.ref("users/" + uid + "/photoURL").set(url);
    }).then(() => {
      alert("Profile picture updated successfully!");
    }).catch((error) => {
      alert("Error: " + error.message);
    });
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});
