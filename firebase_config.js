// Firebase Config
export const firebaseConfig = {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR",
    databaseURL: "YOUR",
    projectId: "YOUR",
    storageBucket: "YOUR",
    messagingSenderId: "YOUR",
    appId: "YOUR"
};

// ADD OWNER UID HERE
export const OWNER_UID = "RQkXyPpTbgW8J9oJH3vqBPhdv782";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
