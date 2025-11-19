import { auth, db, storage } from "./firebase_config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  ref,
  set,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  uploadBytes,
  getDownloadURL,
  ref as sRef
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const loading = document.getElementById("loading");
const profileImg = document.getElementById("profileImg");
const dpInput = document.getElementById("dpInput");
const saveDPBtn = document.getElementById("saveDPBtn");
const chatContainer = document.getElementById("chatContainer");
const msgBox = document.getElementById("msgBox");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

// USER LOGIN CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Login first!");
    window.location.href = "login.html";
    return;
  }

  loading.style.display = "block";

  const dpPath = ref(db, "users/" + user.uid + "/dp");

  onValue(dpPath, (snapshot) => {
    const dpURL = snapshot.val();
    profileImg.src = dpURL ? dpURL : "default_dp.png";
  });

  chatContainer.style.display = "block";
  loading.style.display = "none";
});

// SAVE NEW DP
saveDPBtn.onclick = async () => {
  const file = dpInput.files[0];
  if (!file) return alert("Select a picture!");

  loading.style.display = "block";

  const user = auth.currentUser;
  const storagePath = sRef(storage, "dp/" + user.uid);

  await uploadBytes(storagePath, file);

  const url = await getDownloadURL(storagePath);

  await set(ref(db, "users/" + user.uid + "/dp"), url);

  profileImg.src = url;

  loading.style.display = "none";
  alert("Profile Picture Updated!");
};

// SEND MESSAGE
sendBtn.onclick = async () => {
  const text = msgBox.value.trim();
  if (!text) return;

  const user = auth.currentUser;

  await push(ref(db, "messages"), {
    uid: user.uid,
    text,
    time: Date.now()
  });

  msgBox.value = "";
};

// LOAD MESSAGES
onValue(ref(db, "messages"), (snapshot) => {
  messagesDiv.innerHTML = "";
  snapshot.forEach((msg) => {
    const data = msg.val();
    messagesDiv.innerHTML += `<p><strong>${data.uid}:</strong> ${data.text}</p>`;
  });
});
