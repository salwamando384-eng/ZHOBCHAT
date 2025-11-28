import { auth, db } from "./firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const btnUsers = document.getElementById("btnUsers");
const usersPopup = document.getElementById("usersPopup");
const userList = document.getElementById("userList");

const detailPopup = document.getElementById("userDetailsPopup");
const detailDp = document.getElementById("detailDp");
const detailName = document.getElementById("detailName");
const detailAge = document.getElementById("detailAge");
const detailGender = document.getElementById("detailGender");
const detailCity = document.getElementById("detailCity");

btnUsers.onclick = () => {
    usersPopup.classList.toggle("hide");

    onValue(ref(db, "users"), (snap) => {
        userList.innerHTML = "";
        snap.forEach(u => {
            let data = u.val();
            userList.innerHTML += `
                <div data-uid="${u.key}">
                    <b>${data.name}</b>
                </div>
            `;
        });
    });
};

userList.onclick = (e) => {
    if (!e.target.dataset.uid) return;

    const uid = e.target.dataset.uid;

    onValue(ref(db, "users/" + uid), (snap) => {
        let d = snap.val();

        detailDp.src = d.dp;
        detailName.innerHTML = "Name: " + d.name;
        detailAge.innerHTML = "Age: " + d.age;
        detailGender.innerHTML = "Gender: " + d.gender;
        detailCity.innerHTML = "City: " + d.city;

        detailPopup.classList.remove("hide");
    });
};
