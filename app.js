const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageBox = document.getElementById('messageBox');

sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (!message) return;

    firebase.database().ref('messages/').push({
        text: message,
        timestamp: Date.now()
    }).then(() => {
        messageInput.value = '';
    }).catch(err => console.error('Firebase push error:', err));
});

firebase.database().ref('messages/').on('child_added', snapshot => {
    const msg = snapshot.val();
    const p = document.createElement('p');
    p.textContent = msg.text;
    messageBox.appendChild(p);
    messageBox.scrollTop = messageBox.scrollHeight;
});
