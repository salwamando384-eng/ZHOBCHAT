<!DOCTYPE html>
<html lang="ur">
<head>
  <meta charset="UTF-8">
  <title>ZhobChat - Chat Room</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #121212;
      color: #fff;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    header {
      background-color: #1e1e1e;
      padding: 10px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid #333;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    .msg {
      background: #2a2a2a;
      margin: 5px 0;
      padding: 8px 10px;
      border-radius: 8px;
    }
    .sender {
      font-weight: bold;
      color: #1db954;
    }
    footer {
      display: flex;
      padding: 10px;
      background-color: #1e1e1e;
      border-top: 1px solid #333;
    }
    input {
      flex: 1;
      padding: 10px;
      border-radius: 5px;
      border: none;
      outline: none;
      background: #2a2a2a;
      color: white;
    }
    button {
      background: #1db954;
      border: none;
      color: white;
      padding: 10px 15px;
      margin-left: 5px;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <header>ZHOBCHAT 💬</header>
  <div id="messages"></div>
  <footer>
    <input type="text" id="messageInput" placeholder="اپنا پیغام لکھیں...">
    <button id="sendBtn">Send</button>
  </footer>

  <script type="module" src="chat.js"></script>
</body>
</html>
