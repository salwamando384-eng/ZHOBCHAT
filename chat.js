// ========== ZHOBCHAT CHAT.JS ==========
document.addEventListener("DOMContentLoaded", () => {
  const userList = document.getElementById("userList");
  const messageBox = document.getElementById("messageBox");
  const form = document.getElementById("messageForm");
  const input = document.getElementById("messageInput");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- Sample Users (Robots) ---
  const robots = [
    { name: "Abid", dp: "https://i.pravatar.cc/150?img=5" },
    { name: "Hina", dp: "https://i.pravatar.cc/150?img=32" },
    { name: "Akbar Khan", dp: "https://i.pravatar.cc/150?img=15" },
    { name: "Junaid", dp: "https://i.pravatar.cc/150?img=24" },
    { name: "Shaista", dp: "https://i.pravatar.cc/150?img=45" }
  ];

  // --- Display User List ---
  function renderUserList() {
    userList.innerHTML = "";
    robots.forEach(user => {
      const li = document.createElement("li");
      li.classList.add("user-item");
      li.innerHTML = `
        <img class="user-dp" src="${user.dp}" alt="${user.name}">
        <span>${user.name}</span>
      `;
      userList.appendChild(li);
    });
  }

  renderUserList();

  // --- Display Messages ---
  function addMessage(sender, text, color = "#000") {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<strong style="color:${color}">${sender}:</strong> ${text}`;
    messageBox.appendChild(div);
    messageBox.scrollTop = messageBox.scrollHeight;
  }

  // --- Auto Robot Greeting ---
  robots.forEach((bot, index) => {
    setTimeout(() => {
      addMessage(bot.name, "Hi everyone 👋 I'm here!");
    }, 1500 * (index + 1));
  });

  // --- Send Message ---
  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (text !== "") {
      addMessage("You", text, "#0084ff");
      input.value = "";
    }
  });

  // --- Logout Button ---
  logoutBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
