// Firebase authentication check
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("User is logged in:", user.email);
    } else {
        console.log("User is logged out");
    }
});

// Get DOM elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageBox = document.getElementById('messageBox');
const onlineBox = document.getElementById('onlineBox'); // div for online users

// Send message
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (!message) return;

    const user = firebase.auth().currentUser;
    const username = user ? user.email : 'Guest';

    firebase.database().ref('messages/').push({
        text: message,
        timestamp: Date.now(),
        user: username
    }).then(() => {
        messageInput.value = '';
    }).catch(err => console.error('Firebase push error:', err));
});

// Display messages
firebase.database().ref('messages/').on('child_added', snapshot => {
    const msg = snapshot.val();
    const p = document.createElement('p');
    p.textContent = (msg.user || 'Guest') + ": " + msg.text;
    messageBox.appendChild(p);
    messageBox.scrollTop = messageBox.scrollHeight;
});

// Track online users
firebase.database().ref('.info/connected').on('value', snapshot => {
    if (snapshot.val() === false) return;

    const user = firebase.auth().currentUser;
    if (user) {
        const userStatusRef = firebase.database().ref('online/' + user.uid);
        userStatusRef.set(user.email);
        userStatusRef.onDisconnect().remove();
    }
});

// Display online users
firebase.database().ref('online/').on('value', snapshot => {
    onlineBox.innerHTML = '';
    snapshot.forEach(childSnapshot => {
        const p = document.createElement('p');
        p.textContent = childSnapshot.val();
        onlineBox.appendChild(p);
    });
});
