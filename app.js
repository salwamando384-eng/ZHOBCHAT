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
