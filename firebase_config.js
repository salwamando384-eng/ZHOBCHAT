/* Body styling */
body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #f5f5f5;
}

/* Main container */
.container {
    width: 90%;
    max-width: 400px;
    background: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0px 2px 10px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* DP image */
.dp {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 10px;
}

/* Chat heading */
h1 {
    font-size: 20px;
    margin: 5px 0 15px 0;
    text-align: center;
}

/* Messages box */
.message-box {
    width: 100%;
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    background: #fafafa;
    margin-bottom: 10px;
}

/* Input area */
.input-area {
    display: flex;
    width: 100%;
    gap: 5px;
}

.input-area input[type="text"] {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

/* Send button */
#sendBtn {
    padding: 8px 12px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.2s;
}

#sendBtn:hover {
    background-color: #0056b3;
}

/* Message paragraph */
#messages p {
    margin: 5px 0;
}