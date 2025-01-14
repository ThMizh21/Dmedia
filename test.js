// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, get,onValue } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoSKc0-O0CB-6DsQHW74dSW41Hnk6lQJs",
  authDomain: "social-media-10a7a.firebaseapp.com",
  projectId: "social-media-10a7a",
  storageBucket: "social-media-10a7a.appspot.com",
  messagingSenderId: "770987768855",
  appId: "1:770987768855:web:6dc441a7491249c8cf3052",
  measurementId: "G-61L75JPTKG"
};
// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = urlParams.get("uid");
document.getElementById("messageButton").addEventListener("click", () => {
  const targetUserName = document.getElementById("profileName").innerText; // Assuming username is displayed here
  window.location.href = `../html/message.html?uid=${encodeURIComponent(targetUserId)}&username=${encodeURIComponent(targetUserName)}`;
});
// Fetch UID from URL
function getUidFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  console.log("URL UID:", urlParams.get("uid"));
  return urlParams.get("uid");
}
const followButton = document.getElementById("followButton")
async function getUserDetails(uid) {
  const querySnapshot = await getDocs(query(collection(db, "followers"), where("user", "==", localStorage.getItem("uid"))));
  querySnapshot.forEach((data) => {
    console.log(data);
    if (data.data().follower == uid) {
      followButton.textContent = "Unfollow"
      followButton.style.backgroundColor = "#EFEFEF";
      followButton.style.color = "black"
    }
  })
  if (uid == localStorage.getItem("uid")) {
    followButton.style.display = "none"
  }
  const userDocRef = doc(db, "users", uid); // Reference to the specific user document
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const userData = userDoc.data();
    userData.uid = uid; // Include the UID for reference
    return userData;
  }
  return null; // User not found
}
// Update the UI with the fetched user data
async function displayUserProfile(userData) {
  if (userData) {
    console.log(userData)
    followButton.setAttribute("uid", userData.uid);
    document.getElementById("profileName").textContent = userData.name;
    document.getElementById("profileUsername").textContent = `@${userData.userName}`;
    document.getElementById("aboutMe").textContent = userData.about;
    document.getElementById("profilePhoto").src = userData.profileimg;
    document.getElementById("coverPhoto").src = userData.coverPhoto;
  } else {
    console.error("User not found.");
  }
}
// Fetch posts for the target user from Realtime Database and display them
async function displayUserPosts(targetUserId) {
  console.log(`Fetching posts for user: ${targetUserId}`);
  if (!postsContainer) {
    console.error("postsContainer element not found in the DOM.");
    return;
  }
  try {
    const postRef=ref(database, `socify/posts`)
    onValue(postRef, (snapshot)=>{
      console.log(snapshot.val())
      const postsContainer=document.getElementById("postsContainer")
      postsContainer.innerHTML = "";
      if(snapshot.exists()){
        const posts= snapshot.val()
        console.log(posts);
        Object.keys(posts).forEach((postID)=>{
          const post=posts[postID];
          if(post.uid=== targetUserId){
            const postElement = `
            <div class="post bg-white shadow-lg border rounded-lg p-4 mb-4 relative">
               ${post.postType==="Image"?   `<img src="${post.postLink}" alt="Post Image" class="rounded-lg shadow userPost"></img>`
          :`<video src="${post.postLink} "class="rounded-lg shadow userPost" controls></video>`
          }
              <p class="text-gray-700">${post.caption}</p>
            </div>
          `;
            postsContainer.innerHTML+= postElement;
          }
        })
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    postsContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.classList.add("grid", "grid-cols-4", "sm:grid-cols-2", "lg:grid-cols-3", "gap-10"); // Tailwind grid classes
});
// Main function to load the user profile
async function loadProfile() {
  const targetUserId = getUidFromURL(); // Get the target user ID from URL
  if (targetUserId) {
    const userData = await getUserDetails(targetUserId);
    if (userData) {
      displayUserProfile(userData); // Update UI with user details
      displayUserPosts(targetUserId); // Fetch and display target user posts
    } else {
      console.error("User not found");
    }
  } else {
    console.error("UID is not provided in the URL");
  }
}
// Call the loadProfile function when the page is ready
window.onload = loadProfile;
followButton.addEventListener("click", async () => {
  console.log(followButton.textContent);
  if (followButton.textContent == "Follow") {
    console.log("check 1");
    const userId = followButton.getAttribute("uid")
    const data = {    //Object for userid and follower id
      user: localStorage.getItem("uid"),
      follower: userId
    };
    const docRef = await addDoc(collection(db, "followers"), data);
    followButton.textContent = "Unfollow";
    followButton.style.backgroundColor = "#EFEFEF";
    followButton.style.color = "black"
    let followerCount=Number(document.getElementById("followersCount").innerText)
    document.getElementById("followersCount").innerText=followerCount+1;
  }
  else {
    const userId = followButton.getAttribute("uid")
    followButton.textContent = "Follow";
    followButton.style.backgroundColor = "#007BFF";
    followButton.style.color = "white"
    const UnfollowUser = query(
      collection(db, "followers"),
      where("user", "==", localStorage.getItem("uid")),
      where("follower", "==", uid)
    );
    const querySnapshot = await getDocs(UnfollowUser);
    let followerCount=Number(document.getElementById("followersCount").innerText)
    document.getElementById("followersCount").innerText=followerCount-1;
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
      console.log("Deleted document:", doc.id);
    });
  }
});
const uid = getUidFromURL();
const querySnapshot = await getDocs(query(collection(db, "followers"), where("follower", "==", uid)));
let countFollowers = 0
querySnapshot.forEach((data) => {
  countFollowers++
})
const followersCount = document.getElementById("followersCount")
followersCount.textContent = countFollowers
const querySnapshotForFollowing = await getDocs(query(collection(db, "followers"), where("user", "==", uid)));
let countFollowing = 0
querySnapshotForFollowing.forEach((data) => {
  countFollowing++
})
const followingCount = document.getElementById("followingCount")
followingCount.textContent = countFollowing;
const params = new URLSearchParams(window.location.search);
const userId = params.get("uid");
if (userId) {
  const userRef = doc(db, "users", userId);
  getDoc(userRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById("profileName").textContent = userData.name || "Unknown";
        document.getElementById("profileUsername").textContent = `@${userData.userName || "unknown"}`;
        document.getElementById("aboutMe").textContent = userData.about || "No information available";
        document.getElementById("profilePhoto").src = userData.profileimg || "default-profile-photo-url.jpg";
        document.getElementById("homeProfilePhoto").src = userData.profileimg || "default-profile-photo-url.jpg";
        document.getElementById("coverPhoto").src= userData.coverPhoto;
        document.getElementById("homeUsername").textContent = `@${userData.userName || "unknown"}`;
      } else {
        console.error("No such user!");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
} else {
  console.error("No userId found in URL");
}