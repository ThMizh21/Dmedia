import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove ,query,where , orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
const auth = getAuth(app);
let currentUserId = null;  

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid; 
    console.log("User logged in with UID:", currentUserId);

    
    fetchPosts();
    fetchUserProfile();
    fetchAppStats();
  } else {
    currentUserId = null; 
    console.log("No user logged in");
    window.location.href = "../../index.html"; 
  }
});

// Function to get user details based on userId
async function getUserDetails(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
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

      // Create a box for each comment
      const commentBox = document.createElement("div");
      commentBox.style.border = "1px solid #ddd"; 
      commentBox.style.borderRadius = "8px";
      commentBox.style.padding = "10px";
      commentBox.style.marginBottom = "10px"; 
      commentBox.style.backgroundColor = "#f9f9f9"; 

      const commentText = document.createElement("p");

      // Create an anchor tag to link to the user's profile
      const commentUserLink = document.createElement("a");
      commentUserLink.href = `userprofile.html?username=${commentUserName}`;  
      commentUserLink.textContent = `${commentUserName}: `;
      commentUserLink.classList.add("user-link"); 

      commentText.appendChild(commentUserLink);
      commentText.appendChild(document.createTextNode(comment));

      commentBox.appendChild(commentText);

      commentsContainer.appendChild(commentBox);
    });
  } else {
    const noCommentsDiv = document.createElement("div");
    noCommentsDiv.textContent = "No comments yet.";
    commentsContainer.appendChild(noCommentsDiv);
  }

  modalContent.appendChild(commentsContainer);

  // Add comment input and submit button
  const commentInput = document.createElement("textarea");
  commentInput.placeholder = "Write a comment...";
  commentInput.classList.add("comment-input");
  modalContent.appendChild(commentInput);

  const submitCommentButton = document.createElement("button");
  submitCommentButton.textContent = "Post Comment";
  submitCommentButton.classList.add("submit-comment-button");
  submitCommentButton.onclick = async () => {
    const comment = commentInput.value.trim();
    if (comment) {
      
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId: currentUserId,
          comment: comment
        })
      });
      commentInput.value = ''; 
      fetchPosts(); 
    }
  };
  modalContent.appendChild(submitCommentButton);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

// Function to fetch posts
async function fetchPosts() {
  if (!currentUserId) return; 

  try {
    const postsCollectionRef = collection(db, "posts");
    const q = query(postsCollectionRef, orderBy("date_of_post", "desc")); 
    const querySnapshot = await getDocs(q);

    const postContainer = document.getElementById("postContainer");
    postContainer.innerHTML = '';

    // Fetch the user's saved posts to check if any post is saved
    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);
    const savedPosts = userSnap.exists() ? userSnap.data().savedPosts || [] : [];

    querySnapshot.forEach(async (doc) => {
      const postData = doc.data();
      const { userId, post, comments, likes, date_of_post, caption, hashtags } = postData;

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
        userImg.src = profile || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg';
        userImg.alt = `${username}'s profile image`;
        userImg.classList.add("userPrf");

        const userNameDiv = document.createElement("a");
        userNameDiv.classList.add("userName");
        userNameDiv.textContent = username;

        const storedUid = localStorage.getItem("uid");

        if (userId === storedUid) {
            userNameDiv.href = `profile.html`;
        } else {
            userNameDiv.href = `userprofile.html?username=${encodeURIComponent(username)}&uid=${encodeURIComponent(userId)}`;
        }

        userNameDiv.style.textDecoration = "none"

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

        // Display hashtags if present
        const hashtagDiv = document.createElement("div");
        hashtagDiv.classList.add("hashtags");
        if (hashtags && hashtags.length > 0) {
          hashtags.forEach((hashtag) => {
            const hashtagSpan = document.createElement("span");
            hashtagSpan.classList.add("hashtag");
            hashtagSpan.textContent = `#${hashtag} `;
            hashtagDiv.appendChild(hashtagSpan);
            hashtagDiv.style.fontSize ="16px"
            hashtagDiv.style.paddingBottom ="10px"
          });
        }

        // Format and display the date of the post
        const dateDiv = document.createElement("div");
        dateDiv.classList.add("post-date");
        if (date_of_post) {
          const postDate = new Date(date_of_post.seconds * 1000); 
          const formattedDate = timeAgo(postDate); 
          dateDiv.textContent = formattedDate;
          dateDiv.style.color = "grey";
        }

        cDDiv.appendChild(captionDiv);
        cDDiv.appendChild(hashtagDiv);
        cDDiv.appendChild(dateDiv);  

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

// Function to calculate relative time
function timeAgo(date) {
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${Math.floor(secondsPast)} seconds ago`;
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)} minutes ago`;
  }
  if (secondsPast < 86400) {
    return `${Math.floor(secondsPast / 3600)} hours ago`;
  }
  if (secondsPast < 2592000) {
    return `${Math.floor(secondsPast / 86400)} days ago`;
  }
  if (secondsPast < 31536000) {
    return `${Math.floor(secondsPast / 2592000)} months ago`;
  }
  return `${Math.floor(secondsPast / 31536000)} years ago`;
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
    likeIcon.style.color = "gray";  
    console.log("Like removed from post:", postId);
    
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(currentUserId),
    });
    likeIcon.style.color = "black";  
    console.log("Like added to post:", postId);
  }

  // Re-fetch posts to update the like count
  fetchPosts();
  fetchUserProfile();
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
      savedIcon.style.color = "gray";
    } else {
      await updateDoc(userRef, {
        savedPosts: arrayUnion(postId),
      });
      savedIcon.style.color = "black"; 
    }
  }
}

const userProfileImg = document.getElementById("userProfileImg");  
const userName = document.getElementById("userName");  
const userPostsCount = document.getElementById("userPostsCount");
const totalUsersCount = document.getElementById("totalUsersCount");
const totalPostsCount = document.getElementById("totalPostsCount");
const popularHashtags = document.getElementById("popularHashtags");
const popularHashtagsList = document.getElementById("popularHashtagsList");
const postsLiked = document.getElementById("postsLiked");
const postsCommented = document.getElementById("postsCommented");

// Fetch user profile details
async function fetchUserProfile() {
  try {
    if (!currentUserId) {
      console.error("User is not logged in.");
      return; 
    }

    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const { username, profile } = userSnap.data();

      // Set the username and profile image
      if (userName && userProfileImg) {
        userName.textContent = username;
        userProfileImg.src = profile || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg';
      }

      // Fetch the number of posts the user has made
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, where("userId", "==", currentUserId));
      const postsSnap = await getDocs(postsQuery);

      // Store all post IDs in a temporary array (can be used if needed)
      const userPosts = postsSnap.docs.map(doc => doc.id);

      // Display the number of posts (assuming you have an element with id `userPostsCount`)
      if (userPostsCount) {
        userPostsCount.textContent = `Number of posts: ${userPosts.length}`;
      }

      // Initialize counters
      let totalLikedPosts = 0;
      let totalCommentedPosts = 0;

      // Fetch all posts to check for likes and comments by the user
      const allPostsSnap = await getDocs(collection(db, "posts"));
      allPostsSnap.forEach((doc) => {
        const postData = doc.data();
        const { likes, comments } = postData;

        // Check if the logged-in user's UID is in the likes array
        if (likes && likes.includes(currentUserId)) {
          totalLikedPosts++;
        }

        // Check if the logged-in user's UID is in the comments array
        if (comments && comments.some(comment => comment.userId === currentUserId)) {
          totalCommentedPosts++;
        }
      });

      // Display the posts liked by the user
      if (postsLiked) {
        postsLiked.textContent = `Posts Liked: ${totalLikedPosts}`;
      } else {
        console.error("Element with id 'postsLiked' not found.");
      }

      // Display the posts commented by the user
      if (postsCommented) {
        postsCommented.textContent = `Posts Commented: ${totalCommentedPosts}`;
      } else {
        console.error("Element with id 'postsCommented' not found.");
      }
    } else {
      console.error("User profile does not exist.");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("An error occurred while fetching your profile. Please try again later.");
  }
}

// To fetch the App Stats , user Stats and display them
async function fetchAppStats() {
  try {
    const usersCollectionRef = collection(db, "users");
    const usersQuerySnapshot = await getDocs(usersCollectionRef);
    const totalUsers = usersQuerySnapshot.size;

    if (totalUsersCount) {
      totalUsersCount.textContent = `Total Users: ${totalUsers}`;
    }

    const postsCollectionRef = collection(db, "posts");
    const postsQuerySnapshot = await getDocs(postsCollectionRef);
    const totalPosts = postsQuerySnapshot.size;

    if (totalPostsCount) {
      totalPostsCount.textContent = `Total Posts: ${totalPosts}`;
    }

    // Fetch the most popular hashtags
    const hashtagsMap = new Map(); 

    postsQuerySnapshot.forEach((doc) => {
      const postData = doc.data();
      const { hashtags } = postData;

      if (hashtags && hashtags.length > 0) {
        hashtags.forEach((hashtag) => {
          const count = hashtagsMap.get(hashtag) || 0;
          hashtagsMap.set(hashtag, count + 1);
        });
      }
    });

    const sortedHashtags = new Map([...hashtagsMap.entries()].sort((a, b) => b[1] - a[1]));

    if (popularHashtagsList) {
      let count = 0;
      sortedHashtags.forEach((value, key) => {
        if (count < 5) {
          const hashtagItem = document.createElement("li");
          const discoverPageUrl = `./discover.html?hashtag=${encodeURIComponent(key)}`;
          hashtagItem.innerHTML = `<a href="${discoverPageUrl}">#${key}</a>`;
          popularHashtagsList.appendChild(hashtagItem);
          count++;
        }
      });
    }
  } catch (error) {
    console.error("Error fetching app stats:", error);
    alert("An error occurred while fetching app stats. Please try again later.");
  }
}


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
}