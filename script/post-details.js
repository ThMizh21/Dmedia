import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Store the referring page URL in sessionStorage (for back button functionality)
if (!sessionStorage.getItem("previousPage")) {
  sessionStorage.setItem("previousPage", document.referrer);  // Store the referrer URL
}

// Function to get the postId from the URL
function getPostIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('postId'); // This will give you the postId from the URL
}

// Function to fetch and display post details
async function displayPostDetails(postId) {
  try {
    if (!postId) {
      console.error("No post ID found.");
      return;
    }

    // Reference to the post document
    const postDocRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postDocRef);

    if (postDoc.exists()) {
      const postData = postDoc.data();
      const postTitle = postData.title || 'Untitled';
      const postImage = postData.post;
      const postDescription = postData.caption || 'No caption available.';
      const likes = postData.likes || [];
      const comments = postData.comments || [];
      const userId = postData.userId || 'Unknown';  // Get userId associated with the post
      const postDate = postData.date || new Date().toISOString();  // Get post date

      // Injecting post header content (user name and post date)
      const postHeader = document.getElementById('post-header');
      const userInfo = document.createElement('div');
      userInfo.classList.add('user-info');
      userInfo.innerHTML = `
        <img src="https://via.placeholder.com/40" alt="User Profile"> <!-- Replace with actual profile image -->
        <a href="userprofile.html?userId=${userId}">${userId}</a>
      `;
      const postDateElement = document.createElement('span');
      postDateElement.innerText = new Date(postDate).toLocaleString();
      postHeader.appendChild(userInfo);
      postHeader.appendChild(postDateElement);

      // Injecting post content (image or video)
      const postContent = document.getElementById('post-content');
      if (postImage && (postImage.includes('.jpg') || postImage.includes('.png'))) {
        postContent.innerHTML = `<img src="${postImage}" alt="Post Image">`;
      } else if (postImage && postImage.includes('.mp4')) {
        postContent.innerHTML = `<video src="${postImage}" controls></video>`;
      }

      // Injecting post caption and hashtags
      const captionElement = document.createElement('p');
      captionElement.classList.add('caption');
      captionElement.innerText = postDescription;
      postContent.appendChild(captionElement);

      // Add Like, Comment, Save buttons
      addPostActions(postId, likes, comments);
    } else {
      console.error("Post not found!");
    }
  } catch (error) {
    console.error("Error fetching post details:", error);
  }
}

// Function to add Like, Comment, Save buttons to the post
function addPostActions(postId, likes, comments) {
  const actionsContainer = document.getElementById('post-actions');
  
  // Like Button
  const likeIcon = document.createElement("span");
  likeIcon.classList.add("fa", likes.includes(currentUserId) ? "fa-thumbs-up" : "fa-thumbs-o-up");
  likeIcon.style.color = likes.includes(currentUserId) ? "black" : "gray";
  likeIcon.onclick = () => toggleLikePost(postId, likes, likeIcon);

  // Comment Button
  const commentIcon = document.createElement("span");
  commentIcon.classList.add("fa", "fa-comment");
  commentIcon.onclick = () => toggleComments(postId);

  // Save Button
  const savedIcon = document.createElement("span");
  savedIcon.classList.add("fa", "fa-bookmark");
  savedIcon.style.color = savedPosts.includes(postId) ? "black" : "gray";
  savedIcon.onclick = () => savePost(postId, savedIcon);

  actionsContainer.appendChild(likeIcon);
  actionsContainer.appendChild(commentIcon);
  actionsContainer.appendChild(savedIcon);
}

// Toggle the like status of a post and update the icon
async function toggleLikePost(postId, likes, likeIcon) {
  if (!currentUserId) {
    console.log("No user logged in");
    return;
  }

  const postRef = doc(db, "posts", postId);
  const userHasLiked = likes && likes.includes(currentUserId);

  if (userHasLiked) {
    await updateDoc(postRef, {
      likes: arrayRemove(currentUserId),
    });
    likeIcon.style.color = "gray";  // Change icon to gray (unliked)
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(currentUserId),
    });
    likeIcon.style.color = "black";  // Change icon to black (liked)
  }
}

// Save or unsave the post by updating the user's savedPosts array
async function savePost(postId, savedIcon) {
  if (!currentUserId) {
    console.log("No user logged in");
    return;
  }

  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const savedPosts = userSnap.data().savedPosts || [];
    const isPostSaved = savedPosts.includes(postId);

    if (isPostSaved) {
      await updateDoc(userRef, {
        savedPosts: arrayRemove(postId),
      });
      savedIcon.style.color = "gray"; // Change icon color to gray (unsaved)
    } else {
      await updateDoc(userRef, {
        savedPosts: arrayUnion(postId),
      });
      savedIcon.style.color = "black"; // Change icon color to black (saved)
    }
  }
}

// Function to handle comment icon click
function toggleComments(postId) {
  console.log("Toggling comments for postId:", postId);
  const postRef = doc(db, "posts", postId);
  getDoc(postRef).then((docSnap) => {
    if (docSnap.exists()) {
      const postData = docSnap.data();
      const comments = postData.comments || [];
      createCommentModal(postId, comments);
    } else {
      console.log("Post not found!");
    }
  });
}

// Function to create a comment modal
function createCommentModal(postId, comments) {
  const modal = document.createElement("div");
  modal.classList.add("comment-modal");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  modal.style.zIndex = "1000";
  modal.style.display = "flex";
  modal.style.flexDirection = "column";
  modal.style.padding = "20px";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `
    <h3>Comments</h3>
    <div class="comments-container"></div>
    <div class="add-comment-container">
      <textarea placeholder="Add a comment..."></textarea>
      <button onclick="addComment(postId)">Post</button>
    </div>
  `;
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

// Function to add a comment
async function addComment(postId) {
  const commentText = document.querySelector(".add-comment-container textarea").value;
  if (commentText.trim() === "") return;

  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    comments: arrayUnion(commentText),
  });
  alert("Comment added!");
}

const currentUserId = "user123";  // Example user ID, replace with actual logged-in user ID

const postId = getPostIdFromURL();  // Get postId from URL
displayPostDetails(postId);
