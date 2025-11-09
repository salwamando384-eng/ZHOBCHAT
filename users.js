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
const db = firebase.database();

const usersList = document.getElementById("usersList");

auth.onAuthStateChanged(user => {
  if (!user) return location.href = "login.html";
  db.ref("users").on("value", snap => {
    usersList.innerHTML = "";
    snap.forEach(child => {
      const uid = child.key;
      const u = child.val();
      if (uid === user.uid) return;
      const div = document.createElement("div");
      div.className = 'user';
      div.innerHTML = `<img src="${u.dp || 'default_dp.png'}" class="dp"/><div><b>${u.name||''}</b><br/>${u.city||''}</div>`;
      const chatBtn = document.createElement("button");
      chatBtn.textContent = "Chat";
      chatBtn.onclick = () => {
        // store who to chat with
        localStorage.setItem("chatWith", uid);
        location.href = "private_chat.html";
      };
      const profileBtn = document.createElement("button");
      profileBtn.textContent = "Profile";
      profileBtn.onclick = () => {
        localStorage.setItem("profileView", uid);
        location.href = "profile.html";
      };
      div.appendChild(chatBtn);
      div.appendChild(profileBtn);
      usersList.appendChild(div);
    });
  });
});
