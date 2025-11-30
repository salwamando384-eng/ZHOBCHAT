// app.js
// Optional: Put generic UI wiring here.

import { auth } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

onAuthStateChanged(auth, (u) => {
  // e.g. show user's name in header if element exists
  const headerName = document.getElementById("headerName");
  if (u && headerName) headerName.innerText = u.email.split("@")[0];
});
