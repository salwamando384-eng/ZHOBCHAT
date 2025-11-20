import { auth, db, storage } from "./firebaseConfig.js";
import { ref, onChildAdded, push, get, set, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const myDp = document.getElementById("myDp");
const myName = document.getElementById("myName");
const userListDiv = document.getElementById("userList");

let uid, myData = {}, currentChatUser = null;
let isAdmin = false; // Change to true for owner/admin

// Load user info
onAuthStateChanged(auth, async (user)=>{
  if(!user){ location.href="index.html"; return; }
  uid = user.uid;

  const snap = await get(ref(db,"users/"+uid));
  if(snap.exists()){
    myData = snap.val();
    myName.textContent = myData.name || "Unknown";
    myDp.src = myData.dp || "default_dp.png";
    isAdmin = myData.isAdmin || false;

    // Set online
    await set(ref(db,"users/"+uid+"/status"),"online");
  }

  // Load user list
  onValue(ref(db,"users/"), snapshot=>{
    userListDiv.innerHTML="";
    snapshot.forEach(child=>{
      const u = child.val();
      const div = document.createElement("div");
      div.className="user-item";
      div.innerHTML=`<span class="status ${u.status==='online'?'online':'offline'}"></span>${u.name}`;
      div.onclick=()=>{ openUserChat(child.key, u); }
      userListDiv.appendChild(div);
    });
  });

  // Load global messages
  onChildAdded(ref(db,"messages/"), snapshot=>{
    const msg = snapshot.val();
    appendMessage(msg);
  });
});

// Send message
sendBtn.onclick = async ()=>{
  if(!msgInput.value.trim()) return;
  const message = {
    text: msgInput.value,
    time: Date.now(),
    uid: uid,
    name: myData.name,
    dp: myData.dp
  };

  if(currentChatUser){
    await push(ref(db,"private/"+uid+"/"+currentChatUser), message);
    await push(ref(db,"private/"+currentChatUser+"/"+uid), message); // Mirror for receiver
  } else {
    await push(ref(db,"messages/"), message);
  }
  msgInput.value="";
};

// Append message
function appendMessage(msg){
  const div = document.createElement("div");
  div.className="msg "+(msg.uid===uid?"self":"");
  div.innerHTML=`<img src="${msg.dp||'default_dp.png'}"><div class="msg-content">${msg.name||'Unknown'}<br>${msg.text}<div class="msg-time">${new Date(msg.time).toLocaleTimeString()}</div></div>`;
  messagesBox.appendChild(div);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Open private chat with a user
function openUserChat(otherUid, otherUser){
  currentChatUser = otherUid;
  messagesBox.innerHTML="";
  // Load private messages
  onChildAdded(ref(db,"private/"+uid+"/"+otherUid), snapshot=>{
    appendMessage(snapshot.val());
  });

  // Admin options: delete messages
  if(isAdmin){
    // Optionally, add delete message functionality
    console.log("Admin can delete messages");
  }

  // Display friend request or private message option (extend as needed)
  alert(`پرائیوٹ چیٹ کھولی گئی: ${otherUser.name}`);
}

// Optional: Logout on close
window.addEventListener("beforeunload", async ()=>{
  if(uid) await set(ref(db,"users/"+uid+"/status"),"offline");
});
