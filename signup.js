// Firebase config (آپ کا اپنا config یہاں لگائیں)
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
const database = firebase.database();
const storage = firebase.storage();

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const dpFile = document.getElementById("dp").files[0];

  // Firebase Auth
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;

      // DP upload
      if (dpFile) {
        const storageRef = storage.ref("users/" + userId + "/dp.jpg");
        storageRef.put(dpFile).then(() => {
          storageRef.getDownloadURL().then((url) => {
            saveUserProfile(userId, name, age, gender, city, url);
          });
        });
      } else {
        saveUserProfile(userId, name, age, gender, city, "");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Function to save profile in database
function saveUserProfile(userId, name, age, gender, city, dpUrl) {
  database.ref("users/" + userId).set({
    name: name,
    age: age,
    gender: gender,
    city: city,
    dp: dpUrl,
    blockedUsers: []
  }).then(() => {
    alert("Signup successful!");
    window.location = "chat.html"; // Redirect to chat page
  });
}
