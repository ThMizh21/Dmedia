import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCdxssptbJ3BYj-VgaRp7A8pe8TBD4ooq0",
    authDomain: "dmedia-2c144.firebaseapp.com",
    projectId: "dmedia-2c144",
    storageBucket: "dmedia-2c144.appspot.com",
    messagingSenderId: "636638599757",
    appId: "1:636638599757:web:01c82ddff12b4d2ba45a04",
    measurementId: "G-WSJN8XVXWJ"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const urlParams = new URLSearchParams(window.location.search);
const targetUserId = urlParams.get("uid");
const targetUserName = urlParams.get("username");

// Fetch user details from Firestore using the username
async function getUserDetailsByUsername(username) {
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
        // Assuming usernames are unique, we can get the first match
        const userDoc = querySnapshot.docs[0];
        const userDetails = userDoc.data();
        userDetails.id = userDoc.id;  
        console.log("User details:", userDetails.id);
        return userDetails;
    } else {
        console.error("User not found.");
        return null;
    }
}

// Get the logged-in user UID
function getLoggedInUserUid() {
    const uid = localStorage.getItem("uid");
    if (!uid) {
        console.error("User is not logged in.");
        document.body.innerHTML = '<p>User is not logged in. Please log in and try again.</p>';
        return null;
    }
    return uid;
}

// Fetch and display the user profile
async function fetchAndDisplayUserProfile() {
    const loggedInUserUid = getLoggedInUserUid();
    if (!loggedInUserUid) {
        return;
    }

    if (!targetUserName) {
        console.error("Username not found in URL.");
        document.body.innerHTML = '<p>Username not found. Please check the URL and try again.</p>';
        return;
    }

    const userDetails = await getUserDetailsByUsername(targetUserName);
    if (userDetails) {
        displayUserProfile(userDetails);
    }
}

// Update the UI with the fetched user data
function displayUserProfile(userDetails) {
    if (userDetails) {
        document.getElementById("username").textContent = userDetails.username;
        document.getElementById("profile-img").src = userDetails.profile || "https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg";
        document.getElementById("bio").textContent = userDetails.bio || "No bio available.";
        document.getElementById("name").textContent = userDetails.name || "Anonymous";

        // Safely handle the followers and following counts
        const followersCount = Array.isArray(userDetails.followers) ? userDetails.followers.length : 0;
        const followingCount = Array.isArray(userDetails.following) ? userDetails.following.length : 0;

        document.getElementById("followers-count").textContent = followersCount;
        document.getElementById("following-count").textContent = followingCount;

        // Handle follow button behavior
        const followButton = document.querySelector("#follow-info button");

        // Check if the logged-in user is already following this user
        isFollowing(userDetails.id).then(isFollowingUser => {
            if (isFollowingUser) {
                followButton.textContent = "Unfollow";  
            } else {
                followButton.textContent = "Follow";  
            }

            // Add event listener for the follow/unfollow button
            followButton.addEventListener("click", () => {
                handleFollowButtonClick(userDetails.id, followButton);
            });
        });

        // Set up the "Message" button to redirect to chat page with target user UID and username
        const messageButton = document.getElementById("messageButton");
        messageButton.addEventListener("click", () => {
            window.location.href = `chat.html?uid=${userDetails.id}&username=${userDetails.username}`;
        });
    }
}

// Function to check if the logged-in user is following the specified user
async function isFollowing(userId) {
    const loggedInUserUid = getLoggedInUserUid();
    if (!loggedInUserUid) {
        return false;
    }

    const userDoc = await getDoc(doc(db, "users", loggedInUserUid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.following && userData.following.includes(userId);
    }
    return false;
}

// Function to handle follow/unfollow button click
async function handleFollowButtonClick(targetUserId, followButton) {
    const loggedInUserUid = getLoggedInUserUid();
    if (!loggedInUserUid) {
        return;
    }

    const loggedInUserRef = doc(db, "users", loggedInUserUid);
    const targetUserRef = doc(db, "users", targetUserId);

    try {
        if (followButton.textContent === "Unfollow") {
            await updateDoc(loggedInUserRef, {
                following: arrayRemove(targetUserId)
            });
            await updateDoc(targetUserRef, {
                followers: arrayRemove(loggedInUserUid)
            });

            // Change button text to "Follow"
            followButton.textContent = "Follow";
        } else {
            await updateDoc(loggedInUserRef, {
                following: arrayUnion(targetUserId)
            });
            await updateDoc(targetUserRef, {
                followers: arrayUnion(loggedInUserUid)
            });

            // Change button text to "Unfollow"
            followButton.textContent = "Unfollow";
        }

        window.location.reload();

    } catch (error) {
        console.error("Error following/unfollowing user: ", error);
    }
}

// Fetch and display the user profile when the page loads
window.onload = fetchAndDisplayUserProfile;

// Fetch posts for the user based on their userId
async function displayUserPosts(userId) {
    const postsSection = document.getElementById("posts-grid");

    const postsCollectionRef = collection(db, "posts");
    const userPostsQuery = query(postsCollectionRef, where("userId", "==", userId));

    const querySnapshot = await getDocs(userPostsQuery);

    if (querySnapshot.empty) {
        const noPostsMessage = document.createElement('p');
        noPostsMessage.textContent = 'No post yet';
        postsSection.appendChild(noPostsMessage);
    } else {
        querySnapshot.forEach(doc => {
            const post = doc.data();
            const postDiv = document.createElement('div');
            postDiv.classList.add('post-item');

            if (post.post) {
                const postImg = document.createElement('img');
                postImg.src = post.post;
                postImg.style.width = '250px';
                postImg.style.height = '250px';
                postImg.style.objectFit = 'cover';

                postImg.addEventListener('click', () => {
                    window.location.href = `post-details.html?postId=${doc.id}`;
                });

                postDiv.appendChild(postImg);
            }

            postsSection.appendChild(postDiv);
        });
    }
}

// Handle document ready and loading profile and posts
window.onload = async () => {
    if (targetUserName) {
        const userDetails = await getUserDetailsByUsername(targetUserName);
        if (userDetails) {
            displayUserProfile(userDetails);
            displayUserPosts(userDetails.id);
        }
    } else {
        console.error("Username not found in URL.");
    }
};

// Logout Functionality
const logoutButton = document.getElementById("signOut");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                console.log("User signed out successfully.");
                localStorage.removeItem("uid");  
                window.location.href = "../../index.html"; 
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    });
};
