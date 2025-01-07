import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCdxssptbJ3BYj-VgaRp7A8pe8TBD4ooq0",
  authDomain: "dmedia-2c144.firebaseapp.com",
  projectId: "dmedia-2c144",
  storageBucket: "dmedia-2c144.appspot.com",
  messagingSenderId: "636638599757",
  appId: "1:636638599757:web:01c82ddff12b4d2ba45a04",
  measurementId: "G-WSJN8XVXWJ"
};

// Initialize Firebase and Firebase Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to get the postId from the URL
function getPostIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('postId'); // This will give you the postId from the URL
}

// Function to fetch user details
async function getUserDetails(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

// Function to fetch post details and display it
async function fetchPostDetails() {
  const postId = getPostIdFromURL();  // Get postId from URL
  if (!postId) return; // If no postId is provided in the URL, exit

  try {
    const postRef = doc(db, "posts", postId);  // Reference to the specific post in Firestore
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      console.log("Post not found!");
      return;
    }

    const postData = postSnap.data();
    const { userId, post, comments, likes, date_of_post, caption, hashtags } = postData;

    // Fetch user details (like username and profile picture)
    const userDetails = await getUserDetails(userId);
    if (!userDetails) {
      console.log("User not found!");
      return;
    }

    const { username, profile } = userDetails;

    // Create post container to display the post
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    // User information
    const userDiv = document.createElement("div");
    userDiv.classList.add("user-info");
    
    const userImg = document.createElement("img");
    userImg.src = profile || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg';
    userImg.alt = `${username}'s profile picture`;
    userImg.classList.add("user-profile");

    const userNameLink = document.createElement("a");
    userNameLink.textContent = username;
    userNameLink.classList.add( "user-name");
    userNameLink.href = `userprofile.html?username=${username}`;

    userDiv.appendChild(userImg);
    userDiv.appendChild(userNameLink);

    postDiv.appendChild(userDiv);

    // Post content (image or video)
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("post-content");
    
    const fileExtension = post.split('.').pop().toLowerCase();
    if (fileExtension === 'mp4' || fileExtension === 'mov' || fileExtension === 'avi') {
      const videoElement = document.createElement("video");
      videoElement.src = post;
      videoElement.controls = true;
      contentDiv.appendChild(videoElement);
    } else {
      const imageElement = document.createElement("img");
      imageElement.src = post;
      imageElement.alt = "Post image";
      contentDiv.appendChild(imageElement);
    }

    postDiv.appendChild(contentDiv);

    // Post caption and hashtags
    const captionDiv = document.createElement("div");
    captionDiv.classList.add("caption");
    captionDiv.textContent = caption || "No caption provided.";

    const hashtagsDiv = document.createElement("div");
    hashtagsDiv.classList.add("hashtags");
    if (hashtags && hashtags.length > 0) {
      hashtags.forEach((hashtag) => {
        const hashtagSpan = document.createElement("span");
        hashtagSpan.textContent = `#${hashtag} `;
        hashtagsDiv.appendChild(hashtagSpan);
      });
    }

    postDiv.appendChild(captionDiv);
    postDiv.appendChild(hashtagsDiv);

    // Post date
    const dateDiv = document.createElement("div");
    dateDiv.classList.add("post-date");
    if (date_of_post) {
      const postDate = new Date(date_of_post.seconds * 1000); // Firestore timestamp conversion
      const formattedDate = postDate.toLocaleString(); // Format as desired
      dateDiv.textContent = formattedDate;
    }
    postDiv.appendChild(dateDiv);

    // Post actions (like, comment, save)
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("actions");

    // Position actions in the top-right corner of the post
    actionsDiv.style.position = "relative";
    actionsDiv.style.top = "-668px";
    actionsDiv.style.left = "280px";
    actionsDiv.style.display = "flex";
    actionsDiv.style.gap = "10px";  // space between icons

    // Like icon
    const likeIcon = document.createElement("span");
    likeIcon.classList.add("fa", likes && likes.includes(auth.currentUser.uid) ? "fa-thumbs-up" : "fa-thumbs-up");
    likeIcon.style.color = likes && likes.includes(auth.currentUser.uid) ? "black" : "gray";
    likeIcon.onclick = () => toggleLikePost(postId, likes, likeIcon);

    const likeCount = document.createElement("span");
    likeCount.textContent = likes ? likes.length : 0;
    likeCount.classList.add("like-count");

    // Comment icon
    const commentIcon = document.createElement("span");
    commentIcon.classList.add("fa", "fa-comment");
    commentIcon.onclick = () => toggleComments(postId);

    // Bookmark icon
    const saveIcon = document.createElement("span");
    saveIcon.classList.add("fa", "fa-bookmark");
    saveIcon.onclick = () => toggleSavePost(postId, saveIcon);

    actionsDiv.appendChild(likeIcon);
    actionsDiv.appendChild(likeCount);
    actionsDiv.appendChild(commentIcon);
    actionsDiv.appendChild(saveIcon);

    postDiv.appendChild(actionsDiv);

    // Append the postDiv to the body or a specific container
    document.getElementById("post-details").appendChild(postDiv);
  } catch (error) {
    console.error("Error fetching post details:", error);
  }
}

// Function to handle like toggle
// Function to handle like toggle
async function toggleLikePost(postId, likes, likeIcon) {
  const currentUserId = auth.currentUser?.uid; // Ensure the user is logged in
  if (!currentUserId) {
    console.log("No user logged in");
    return;
  }

  const postRef = doc(db, "posts", postId);
  const userHasLiked = likes && likes.includes(currentUserId);

  try {
    if (userHasLiked) {
      // User has already liked the post, so remove the like
      await updateDoc(postRef, {
        likes: arrayRemove(currentUserId),  // Remove the userId from likes array
      });
      likeIcon.style.color = "gray";  // Change icon to gray (unliked)
      likeIcon.classList.replace("fa-thumbs-up", "fa-thumbs-o-up"); // Update icon style to unliked
      console.log("Like removed from post:", postId);
    } else {
      // User has not liked the post, so add the like
      await updateDoc(postRef, {
        likes: arrayUnion(currentUserId),  // Add the userId to likes array
      });
      likeIcon.style.color = "black";  // Change icon to black (liked)
      likeIcon.classList.replace("fa-thumbs-o-up", "fa-thumbs-up"); // Update icon style to liked
      console.log("Like added to post:", postId);
    }

    // Optionally update the like count dynamically
    await updateLikeCount(postId);  // Re-fetch the updated like count

  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

// Function to update the like count dynamically
async function updateLikeCount(postId) {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);

  if (postSnap.exists()) {
    const postData = postSnap.data();
    const likeCount = postData.likes ? postData.likes.length : 0;
    const likeCountElement = document.querySelector(".like-count");
    
    if (likeCountElement) {
      likeCountElement.textContent = likeCount;  // Update the displayed like count
    }
  }
}



// Function to handle comment icon toggle (opens the comment modal)
function toggleComments(postId) {
  const commentModal = document.getElementById("comment-modal");
  const closeModal = document.getElementById("close-modal");
  const commentInput = document.getElementById("comment-input");
  const submitCommentBtn = document.getElementById("submit-comment");
  const commentsContainer = document.getElementById("comments-container");

  // Open the modal
  commentModal.style.display = "block";

  // Fetch and display comments for this post
  fetchComments(postId);

  // Close modal when clicking the close button
  closeModal.addEventListener("click", () => {
    commentModal.style.display = "none";
  });

  // Close the modal if clicking outside
  window.onclick = function(event) {
    if (event.target === commentModal) {
      commentModal.style.display = "none";
    }
  };

  // Submit comment
  submitCommentBtn.addEventListener("click", () => {
    const newComment = commentInput.value.trim();
    if (newComment) {
      addComment(postId, newComment);
    }
  });
}

async function fetchComments(postId) {
  const commentsContainer = document.getElementById("comments-container");
  if (!commentsContainer) {
    console.error("Comments container not found!");
    return;
  }
  
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      const comments = postData.comments || [];
  
      // Clear existing comments in the modal
      commentsContainer.innerHTML = "";
  
      // Add each comment to the modal
      if (comments.length > 0) {
        for (const commentData of comments) {
          const { userId, comment } = commentData;
          const userDetails = await getUserDetails(userId);  // Fetch user details
          const commentUserName = userDetails ? userDetails.username : "Unknown user";
  
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment-box");
  
          const commentText = document.createElement("p");
  
          // Create an anchor tag to link to the user's profile
          const commentUserLink = document.createElement("a");
          commentUserLink.href = `userprofile.html?username=${commentUserName}`;  // Correct URL format for profile
          commentUserLink.textContent = `${commentUserName}: `;
          commentUserLink.classList.add("user-link");
  
          commentText.appendChild(commentUserLink);
          commentText.appendChild(document.createTextNode(comment));
  
          commentDiv.appendChild(commentText);
          commentsContainer.appendChild(commentDiv);
        }
      } else {
        const noCommentsDiv = document.createElement("div");
        noCommentsDiv.textContent = "No comments yet.";
        commentsContainer.appendChild(noCommentsDiv);
      }
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
  
}

// Function to add a new comment
async function addComment(postId, newComment) {
  const commentInput = document.getElementById("comment-input");
  const errorMessage = document.getElementById("comment-error-message");

  // Check if the comment is empty or contains only spaces
  if (!newComment.trim()) {
    // Display error message for empty comment
    if (!errorMessage) {
      const errorDiv = document.createElement("div");
      errorDiv.id = "comment-error-message";
      errorDiv.textContent = "Can't post an empty comment.";
      errorDiv.style.color = "red";
      commentInput.insertAdjacentElement("afterend", errorDiv);
    }
    return; // Exit the function if comment is empty
  }

  // Check if the comment exceeds 80 characters
  if (newComment.length > 80) {
    // Display error message for comment length
    if (!errorMessage) {
      const errorDiv = document.createElement("div");
      errorDiv.id = "comment-error-message";
      errorDiv.textContent = "Comment can't exceed 80 characters.";
      errorDiv.style.color = "red";
      commentInput.insertAdjacentElement("afterend", errorDiv);
    }
    return; // Exit the function if comment is too long
  }

  // If validation passes, remove the error message (if any)
  if (errorMessage) {
    errorMessage.remove();
  }

  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion({ comment: newComment, userId: auth.currentUser.uid })
    });

    // Clear the comment input field and refresh the comments
    commentInput.value = "";
    fetchComments(postId); // Re-fetch comments to display the updated list
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}



// Function to handle save post toggle (save/unsave functionality)
async function toggleSavePost(postId, saveIcon) {
  const currentUserId = auth.currentUser.uid;
  const userRef = doc(db, "users", currentUserId);

  try {
    // Get the current user's data
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const savedPosts = userData.savedPosts || [];

      if (savedPosts.includes(postId)) {
        // Remove from saved posts
        await updateDoc(userRef, {
          savedPosts: arrayRemove(postId)
        });
        saveIcon.style.color = "gray";
      } else {
        // Add to saved posts
        await updateDoc(userRef, {
          savedPosts: arrayUnion(postId)
        });
        saveIcon.style.color = "black";
      }
    }
  } catch (error) {
    console.error("Error saving post:", error);
  }
}

// Fetch and display the post details on page load
window.onload = fetchPostDetails;

// Back button event listener
document.getElementById("back-button").addEventListener("click", function() {
  if (document.referrer) {
    // If there is a referrer (previous page), navigate to that
    window.location.href = document.referrer;
  } else {
    // If no referrer (direct access), redirect to a default page, such as the homepage
    window.location.href = "index.html";  // Change this to your desired default page
  }
});
