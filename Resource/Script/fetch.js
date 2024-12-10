import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
let currentUserId = null;  // To store the current user's ID

// Listen for authentication state changes (log in or log out)
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid; // Set the currentUserId to the logged-in user's UID
    console.log("User logged in with UID:", currentUserId);

    // Fetch posts after the user is authenticated
    fetchPosts();
  } else {
    currentUserId = null; // No user logged in
    console.log("No user logged in");
    window.location.href = "login.html";  // Redirect to login page if not authenticated
  }
});

// Function to get user details based on userId
async function getUserDetails(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data(); // { username, profile }
  } else {
    console.log("User not found!");
    return null;
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
  modal.style.overflowY = "auto";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.style.backgroundColor = "white";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "10px";
  modalContent.style.width = "80%";
  modalContent.style.maxWidth = "600px";

  const modalHeader = document.createElement("div");
  modalHeader.classList.add("modal-header");
  modalHeader.style.display = "flex";
  modalHeader.style.justifyContent = "space-between";
  modalHeader.style.alignItems = "center";

  const headerTitle = document.createElement("h3");
  headerTitle.textContent = "Comments";
  modalHeader.appendChild(headerTitle);

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.onclick = () => {
    modal.style.display = "none";
  };
  modalHeader.appendChild(closeButton);

  modalContent.appendChild(modalHeader);

  const commentsContainer = document.createElement("div");
  commentsContainer.classList.add("comments-container");

  if (comments && comments.length > 0) {
    comments.forEach(async (commentData) => {
      const { userId, comment } = commentData;
      const userDetails = await getUserDetails(userId);
      const commentUserName = userDetails ? userDetails.username : "Unknown user";

      const commentDiv = document.createElement("div");
      commentDiv.classList.add("comment");

      const commentText = document.createElement("p");
      commentText.textContent = `${commentUserName}: ${comment}`;
      commentDiv.appendChild(commentText);

      commentsContainer.appendChild(commentDiv);
    });
  } else {
    const noCommentsDiv = document.createElement("div");
    noCommentsDiv.textContent = "No comments yet.";
    commentsContainer.appendChild(noCommentsDiv);
  }

  modalContent.appendChild(commentsContainer);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

// Function to fetch posts
async function fetchPosts() {
  if (!currentUserId) return; // Ensure user is logged in before fetching posts

  try {
    const postsCollectionRef = collection(db, "posts");
    const querySnapshot = await getDocs(postsCollectionRef);

    // Clear the current posts before re-rendering the updated posts
    const postContainer = document.getElementById("postContainer");
    postContainer.innerHTML = ''; // Clear the container to prevent duplication

    // Fetch the user's saved posts to check if any post is saved
    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);
    const savedPosts = userSnap.exists() ? userSnap.data().savedPosts || [] : [];

    querySnapshot.forEach(async (doc) => {
      const postData = doc.data();
      const { userId, post, comments, likes, date_of_post, caption } = postData;

      if (!userId) {
        console.log("Skipping post with missing userId");
        return;
      }

      const userDetails = await getUserDetails(userId);

      if (userDetails) {
        const { username, profile } = userDetails;

        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.style.position = 'relative';

        const cHeadDiv = document.createElement("div");
        cHeadDiv.classList.add("cHead");

        const userImg = document.createElement("img");
        userImg.src = profile || '';
        userImg.alt = `${username}'s profile image`;
        userImg.classList.add("userPrf");

        const userNameDiv = document.createElement("div");
        userNameDiv.classList.add("userName");
        userNameDiv.textContent = username;

        cHeadDiv.appendChild(userImg);
        cHeadDiv.appendChild(userNameDiv);

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("actions");

        // Like Icon
        const likeIcon = document.createElement("span");
        likeIcon.classList.add("fa", likes && likes.includes(currentUserId) ? "fa-thumbs-up" : "fa-thumbs-up");
        likeIcon.style.color = likes && likes.includes(currentUserId) ? "black" : "gray";
        likeIcon.onclick = () => toggleLikePost(doc.id, likes, likeIcon);

        const likeCount = document.createElement("span");
        likeCount.textContent = likes ? likes.length : 0;
        likeCount.classList.add("likeCount");

        // Comment Icon
        const commentIcon = document.createElement("span");
        commentIcon.classList.add("fa", "fa-comment");
        commentIcon.onclick = () => toggleComments(doc.id);

        // Saved Icon
        const savedIcon = document.createElement("span");
        savedIcon.classList.add("fa", "fa-bookmark");

        // Change saved icon color based on whether the post is saved or not
        savedIcon.style.color = savedPosts.includes(doc.id) ? "black" : "gray"; 

        // Add functionality to save/unsave the post
        savedIcon.onclick = () => savePost(doc.id, savedIcon);

        actionsDiv.appendChild(likeIcon);
        actionsDiv.appendChild(likeCount);
        actionsDiv.appendChild(commentIcon);
        actionsDiv.appendChild(savedIcon);

        actionsDiv.style.position = 'absolute';
        actionsDiv.style.top = '10px';
        actionsDiv.style.right = '10px';
        actionsDiv.style.display = 'flex';
        actionsDiv.style.flexDirection = 'row';
        actionsDiv.style.gap = '10px';

        postDiv.appendChild(actionsDiv);

        const visCDiv = document.createElement("div");
        visCDiv.classList.add("visC");

        if (post) {
          const fileExtension = post.split('.').pop().toLowerCase();

          if (fileExtension === 'mp4' || fileExtension === 'mov' || fileExtension === 'avi') {
            const videoElement = document.createElement("video");
            videoElement.src = post;
            videoElement.controls = true;
            videoElement.classList.add("video");
            visCDiv.appendChild(videoElement);
          } else {
            const imageElement = document.createElement("img");
            imageElement.src = post;
            imageElement.alt = "Post image";
            imageElement.classList.add("image");
            visCDiv.appendChild(imageElement);
          }
        }

        const cDDiv = document.createElement("div");
        cDDiv.classList.add("cD");
        const captionDiv = document.createElement("div");
        captionDiv.classList.add("caption");
        captionDiv.textContent = caption;

        const commentsDiv = document.createElement("div");
        commentsDiv.classList.add("comments");
        if (comments && comments.length > 0) {
          comments.forEach(async (commentData) => {
            const userDetails = await getUserDetails(commentData.userId);
            const commentUserName = userDetails ? userDetails.username : "Unknown user";
            const commentDiv = document.createElement("div");
            commentDiv.textContent = `${commentUserName}: ${commentData.comment}`;
            commentsDiv.appendChild(commentDiv);
          });
        } else {
          const noCommentsDiv = document.createElement("div");
          noCommentsDiv.textContent = "No comments yet.";
          commentsDiv.appendChild(noCommentsDiv);
        }

        cDDiv.appendChild(captionDiv);
        cDDiv.appendChild(commentsDiv);

        postDiv.appendChild(cHeadDiv);
        postDiv.appendChild(visCDiv);
        postDiv.appendChild(cDDiv);

        document.getElementById("postContainer").appendChild(postDiv);
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
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
    console.log("Like removed from post:", postId);
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(currentUserId),
    });
    likeIcon.style.color = "black";  // Change icon to black (liked)
    console.log("Like added to post:", postId);
  }

  // Re-fetch posts to update the like count
  fetchPosts();
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
      // Unsave the post
      await updateDoc(userRef, {
        savedPosts: arrayRemove(postId)
      });
      savedIcon.style.color = "gray"; // Change icon to gray (unsaved)
      console.log("Post unsaved:", postId);
    } else {
      // Save the post
      await updateDoc(userRef, {
        savedPosts: arrayUnion(postId)
      });
      savedIcon.style.color = "black"; // Change icon to black (saved)
      console.log("Post saved:", postId);
    }
  }

  // Re-fetch posts to update the saved status
  fetchPosts();
}
