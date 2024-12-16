// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdxssptbJ3BYj-VgaRp7A8pe8TBD4ooq0",
    authDomain: "dmedia-2c144.firebaseapp.com",
    projectId: "dmedia-2c144",
    storageBucket: "dmedia-2c144.appspot.com",
    messagingSenderId: "636638599757",
    appId: "1:636638599757:web:01c82ddff12b4d2ba45a04",
    measurementId: "G-WSJN8XVXWJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch username from URL
function getUsernameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("username"); // Returns the username from the query parameter
}

// Fetch user details from Firestore
async function getUserDetails(username) {
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    let userDetails = null;

    querySnapshot.forEach((doc) => {
        if (doc.data().username === username) {
            userDetails = doc.data();
            userDetails.id = doc.id;  // Add user ID for reference
        }
    });

    return userDetails;
}

// Update the UI with the fetched user data
function displayUserProfile(userDetails) {
    if (userDetails) {
        document.getElementById("username").textContent = userDetails.username;
        document.getElementById("profile-img").src = userDetails.profile || "../images/default-profile.png";
        document.getElementById("bio").textContent = userDetails.bio || "No bio available.";

        // Display name if available
        document.getElementById("name").textContent = userDetails.name || "Anonymous";

        // Display follower and following count
        document.getElementById("followers-count").textContent = userDetails.followers || 0;
        document.getElementById("following-count").textContent = userDetails.following || 0;

        // Handle follow button behavior (you can add functionality here)
        const followButton = document.querySelector("#follow-info button");
        followButton.addEventListener("click", () => {
            alert("Follow functionality is not implemented yet.");
        });

        // Handle message button behavior (you can add functionality here)
        const messageButton = document.querySelector("#follow-info button:nth-of-type(2)");
        messageButton.addEventListener("click", () => {
            alert("Message functionality is not implemented yet.");
        });
    } else {
        console.error("User not found.");
    }
}

// Fetch posts for the user based on their userId
async function displayUserPosts(userId) {
    const postsSection = document.getElementById("posts-grid");

    // Create a query to filter posts by userId
    const postsCollectionRef = collection(db, "posts");
    const userPostsQuery = query(postsCollectionRef, where("userId", "==", userId));  // Query to fetch posts by the user's ID

    // Fetch posts from Firestore
    const querySnapshot = await getDocs(userPostsQuery);

    // Loop through the posts and display them
    querySnapshot.forEach((doc) => {
        const postData = doc.data();
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        // Assuming posts contain an image/video URL and caption
        const content = postData.post; // This should be the URL of the media (image or video)
        const fileExtension = content.split('.').pop().toLowerCase();

        const contentElement = document.createElement(fileExtension === 'mp4' || fileExtension === 'avi' ? 'video' : 'img');
        if (fileExtension === 'mp4' || fileExtension === 'avi') {
            contentElement.src = content;
            contentElement.controls = true;
            contentElement.classList.add("post-media");
        } else {
            contentElement.src = content;
            contentElement.classList.add("post-media");
        }

        const caption = document.createElement("p");
        caption.classList.add("post-caption");
        caption.textContent = postData.caption || "No caption";

        postDiv.appendChild(contentElement);
        postDiv.appendChild(caption);
        postsSection.appendChild(postDiv);
    });
}

// Main function to load the user profile
async function loadProfile() {
    const username = getUsernameFromURL();

    if (username) {
        const userDetails = await getUserDetails(username);
        if (userDetails) {
            displayUserProfile(userDetails); // Update UI with user details
            displayUserPosts(userDetails.id); // Fetch and display posts based on user ID
        } else {
            console.error("User not found");
        }
    } else {
        console.error("Username is not provided in URL");
    }
}

// Call the loadProfile function when the page is ready
window.onload = loadProfile;
