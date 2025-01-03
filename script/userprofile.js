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
        document.getElementById("profile-img").src = userDetails.profile || "../images/default-profile.png";
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

                postImg.addEventListener('click', () => {
                    openPostModal(post);
                });

                postDiv.appendChild(postImg);
            }

            postsSection.appendChild(postDiv);
        });
    }
}

/// Toggle Like functionality
async function toggleLikePost(postId, likes, likeIcon) {
    const loggedInUserUid = getLoggedInUserUid();
    const postRef = doc(db, "posts", postId);

    if (likes && likes.includes(loggedInUserUid)) {
        // User has already liked the post, so we remove the like
        await updateDoc(postRef, {
            likes: arrayRemove(loggedInUserUid)
        });
        likeIcon.style.color = "gray"; // Change like icon color to gray
    } else {
        // User hasn't liked the post, so we add the like
        await updateDoc(postRef, {
            likes: arrayUnion(loggedInUserUid)
        });
        likeIcon.style.color = "black"; // Change like icon color to black
    }
}

// Save Post functionality
async function savePost(postId, savedIcon) {
    const loggedInUserUid = getLoggedInUserUid();
    const userRef = doc(db, "users", loggedInUserUid);

    // Check if the post is already saved
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const savedPosts = userData.savedPosts || [];

    if (savedPosts.includes(postId)) {
        // If already saved, unsave the post
        await updateDoc(userRef, {
            savedPosts: arrayRemove(postId)
        });
        savedIcon.style.color = "gray"; // Change icon color to gray
    } else {
        // If not saved, save the post
        await updateDoc(userRef, {
            savedPosts: arrayUnion(postId)
        });
        savedIcon.style.color = "black"; // Change icon color to black
    }
}

// Function to open the post details modal
async function openPostModal(post) {
    const modal = document.createElement('div');
    modal.classList.add('post-modal');
    
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Post image
    const modalImg = document.createElement('img');
    modalImg.src = post.post;
    modalImg.style.width = '100%'; 
    modalImg.style.height = 'auto'; 
    modalContent.appendChild(modalImg);

    // Caption
    const modalCaption = document.createElement('p');
    modalCaption.textContent = post.caption || 'No caption';
    modalContent.appendChild(modalCaption);

    // Likes and Save Section (aligned side by side)
    const actionDiv = document.createElement('div');
    actionDiv.classList.add('action-div');
    actionDiv.classList.add('likes'); // Apply the flex layout to this section

    // Like Icon
    const likeIcon = document.createElement("span");
    likeIcon.classList.add("fa", post.likes && post.likes.includes(getLoggedInUserUid()) ? "fa-thumbs-up" : "fa-thumbs-up");
    likeIcon.style.color = post.likes && post.likes.includes(getLoggedInUserUid()) ? "black" : "gray";
    likeIcon.onclick = () => toggleLikePost(post.id, post.likes, likeIcon);

    const likeCount = document.createElement("span");
    likeCount.textContent = post.likes ? post.likes.length : 0;
    likeCount.classList.add("likeCount");
    actionDiv.appendChild(likeIcon);
    actionDiv.appendChild(likeCount);

    // Saved Icon
    const savedIcon = document.createElement("span");
    savedIcon.classList.add("fa", "fa-bookmark");
    savedIcon.style.color = post.savedPosts && post.savedPosts.includes(getLoggedInUserUid()) ? "black" : "gray";
    savedIcon.onclick = () => savePost(post.id, savedIcon);
    actionDiv.appendChild(savedIcon);

    modalContent.appendChild(actionDiv);

    // Comments Section
    const commentsDiv = document.createElement('div');
    commentsDiv.classList.add('comments');

    if (post.comments && post.comments.length > 0) {
        for (const commentObj of post.comments) {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');

            // Fetch the user data for the comment's userId
            try {
                const userDoc = await getDoc(doc(db, 'users', commentObj.userId));
                const userData = userDoc.data();

                // Displaying the comment author's name (bold)
                const commentUser = document.createElement('strong');
                commentUser.textContent = userData ? userData.username : 'Unknown User';
                commentDiv.appendChild(commentUser);

                // Adding some spacing between the username and comment
                const space = document.createElement('span');
                space.textContent = ': ';
                commentDiv.appendChild(space);

                // Displaying the comment text (smaller)
                const commentText = document.createElement('p');
                commentText.textContent = commentObj.comment; // Access the comment text
                commentText.style.fontSize = '14px'; // Smaller font size for comment text
                commentDiv.appendChild(commentText);

            } catch (error) {
                console.error('Error fetching user data for comment:', error);
            }

            commentsDiv.appendChild(commentDiv);
        }
    } else {
        const noComments = document.createElement('p');
        noComments.textContent = 'No comments yet.';
        commentsDiv.appendChild(noComments);
    }

    modalContent.appendChild(commentsDiv);

    // Comment Input Box
    const commentInputDiv = document.createElement('div');
    commentInputDiv.classList.add('comment-input');
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Add a comment...';
    commentInput.classList.add('comment-input-box');
    
    const commentSubmitBtn = document.createElement('button');
    commentSubmitBtn.textContent = 'Post';
    commentSubmitBtn.onclick = async () => {
        const commentText = commentInput.value;
        if (commentText.trim() !== '') {
            await postComment(post.id, commentText);
            commentInput.value = '';  // Clear the input field
        }
    };

    commentInputDiv.appendChild(commentInput);
    commentInputDiv.appendChild(commentSubmitBtn);

    modalContent.appendChild(commentInputDiv);

    // Append the modal content to the modal
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closePostModal(modal); 
        }
    });
}

// Function to post a comment
async function postComment(postId, commentText) {
    const loggedInUserUid = getLoggedInUserUid();
    const postRef = doc(db, "posts", postId);

    const commentObj = {
        userId: loggedInUserUid,
        comment: commentText,
        timestamp: new Date()
    };

    await updateDoc(postRef, {
        comments: arrayUnion(commentObj)
    });
    window.location.reload();  // Reload the page to show the new comment
}

// Close Post Modal
function closePostModal(modal) {
    document.body.removeChild(modal);
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
