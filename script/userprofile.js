// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase config and initialization
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

// Initialize Firebase Authentication
const auth = getAuth();

// Fetch username from URL
function getUsernameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("username");
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

// Fetch the logged-in user's UID
function getLoggedInUserUid() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

// Check if the logged-in user is following the target user
async function isFollowing(targetUserId) {
    const loggedInUserUid = getLoggedInUserUid();
    if (!loggedInUserUid) return false;

    const loggedInUserRef = doc(db, "users", loggedInUserUid);
    const loggedInUserDoc = await getDoc(loggedInUserRef);
    const loggedInUserData = loggedInUserDoc.data();

    // Check if the logged-in user is in the following list
    return loggedInUserData.following && loggedInUserData.following.includes(targetUserId);
}

// Handle follow/unfollow button click
async function handleFollowButtonClick(targetUserId, followButton) {
    const loggedInUserUid = getLoggedInUserUid();
    if (!loggedInUserUid) {
        console.error("User is not logged in.");
        return;
    }

    try {
        const loggedInUserRef = doc(db, "users", loggedInUserUid);
        const targetUserRef = doc(db, "users", targetUserId);

        const currentlyFollowing = await isFollowing(targetUserId);

        if (currentlyFollowing) {
            // Unfollow action: remove the logged-in user's ID from target's followers and target's ID from logged-in user's following
            await updateDoc(loggedInUserRef, {
                following: arrayRemove(targetUserId)
            });
            await updateDoc(targetUserRef, {
                followers: arrayRemove(loggedInUserUid)
            });

            // Change button text to "Follow"
            followButton.textContent = "Follow";
        } else {
            // Follow action: add the logged-in user's ID to target's followers and target's ID to logged-in user's following
            await updateDoc(loggedInUserRef, {
                following: arrayUnion(targetUserId)
            });
            await updateDoc(targetUserRef, {
                followers: arrayUnion(loggedInUserUid)
            });

            // Change button text to "Unfollow"
            followButton.textContent = "Unfollow";
        }

        // Reload the page to reflect the changes
        window.location.reload();

    } catch (error) {
        console.error("Error following/unfollowing user: ", error);
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
                followButton.textContent = "Unfollow";  // Change button text to "Unfollow"
            } else {
                followButton.textContent = "Follow";  // Change button text to "Follow"
            }

            // Add event listener for the follow/unfollow button
            followButton.addEventListener("click", () => {
                handleFollowButtonClick(userDetails.id, followButton);
            });
        });
    } else {
        console.error("User not found.");
    }
}

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

                // Add redirection on image click
                postImg.addEventListener('click', () => {
                    // Redirect to the post-details page with the post's UID
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
    const username = getUsernameFromURL();
    if (username) {
        const userDetails = await getUserDetails(username);
        displayUserProfile(userDetails);
        displayUserPosts(userDetails.id);
    }
};
