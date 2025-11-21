// FIXED DP Upload
const dpFile = document.getElementById("dpFile").files[0];
let dpUrl = "default_dp.png";

if(dpFile){
   const dpRef = storageRef(storage, "dp/" + uid + ".jpg");
   await uploadBytes(dpRef, dpFile);
   dpUrl = await getDownloadURL(dpRef);
}

await set(ref(db, "users/" + uid), {
   name, gender, age, city, about,
   dp: dpUrl,
   status: "online"
});
