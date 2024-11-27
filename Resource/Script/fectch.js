import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your Firebase config object
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

// Function to fetch user details from the users collection using userId
async function getUserDetails(userId) {
  if (!userId) {
    console.log("User ID is missing");
    return null;
  }

  const userRef = doc(db, "users", userId);  // Reference to the user document
  const userDoc = await getDoc(userRef);     // Get the user document

  if (userDoc.exists()) {
    return userDoc.data(); // Return user data (username and profile image)
  } else {
    console.log("User not found for ID:", userId);
    return null;
  }
}

// Fetch data from posts collection and display posts with user details
async function fetchPosts() {
  try {
    const postsCollectionRef = collection(db, "posts"); // Reference to the posts collection
    const querySnapshot = await getDocs(postsCollectionRef);

    querySnapshot.forEach(async (doc) => {
      const postData = doc.data();

      // Get the post data
      const { userId, post, comments, likes, date_of_post, caption } = postData;

      // Check if userId is missing
      if (!userId) {
        console.log("Skipping post with missing userId");
        return;
      }

      // Get user details using the userId
      const userDetails = await getUserDetails(userId);

      if (userDetails) {
        const { username, profile } = userDetails;

        // Create post container div
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        // Create cHead (Header) with user info
        const cHeadDiv = document.createElement("div");
        cHeadDiv.classList.add("cHead");

        const userImg = document.createElement("img");
        userImg.src = profile || '';  // Profile image URL
        userImg.alt = `${username}'s profile image`;
        userImg.classList.add("userPrf");

        const userNameDiv = document.createElement("div");
        userNameDiv.classList.add("userName");
        userNameDiv.textContent = username;

        cHeadDiv.appendChild(userImg);
        cHeadDiv.appendChild(userNameDiv);

        // Create visC (Visual Content) with media (image/video)
        const visCDiv = document.createElement("div");
        visCDiv.classList.add("visC");

        if (post) {
          const fileExtension = post.split('.').pop().toLowerCase();  // Get file extension

          if (fileExtension === 'mp4') {
            const videoElement = document.createElement("video");
            videoElement.classList.add("mediaContent");
            videoElement.src = post;  // Use the full URL for the video
            videoElement.controls = true;  // Enable controls for the video
            visCDiv.appendChild(videoElement);
          } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
            const imgElement = document.createElement("img");
            imgElement.classList.add("mediaContent");
            imgElement.src = post;  // Use the full URL for the image
            imgElement.alt = "Post Image";
            visCDiv.appendChild(imgElement);
          } else {
            console.log("Unsupported media type:", fileExtension);
          }
        }

        // Create the parent div with class 'cD'
        const cDDiv = document.createElement("div");
        cDDiv.classList.add("cD");

        // Create caption div
        const captionDiv = document.createElement("div");
        captionDiv.classList.add("caption");
        captionDiv.textContent = `${username}: ${caption}` || 'No caption available';

        // Create likes and post date div
        const postInfoDiv = document.createElement("div");
        postInfoDiv.classList.add("postInfo");
        postInfoDiv.textContent = `${likes} Likes | Posted on: ${new Date(date_of_post ).toLocaleDateString()}`;

        // Create comments section div
        const commentsDiv = document.createElement("div");
        commentsDiv.classList.add("comments");

        // If there are comments, fetch the username for each comment's userId
        if (comments && comments.length > 0) {
          for (const commentData of comments) {
            const { userId: commentUserId, comment } = commentData;
            const commentUserDetails = await getUserDetails(commentUserId);

            const commentDiv = document.createElement("div");
            const commentUserName = commentUserDetails ? commentUserDetails.username : "Unknown user";

            // Display comment with username
            commentDiv.textContent = `${commentUserName} :  ${comment}`;
            commentsDiv.appendChild(commentDiv);
          }
        } else {
          const noCommentsDiv = document.createElement("div");
          noCommentsDiv.textContent = "No comments yet.";
          noCommentsDiv.classList.add("noComments");  // Add class for styling
          commentsDiv.appendChild(noCommentsDiv);
        }

        // Append all created elements to the parent div 'cD'
        cDDiv.appendChild(captionDiv);
        cDDiv.appendChild(postInfoDiv);
        cDDiv.appendChild(commentsDiv);

        // Append the entire post to the main container
        postDiv.appendChild(cHeadDiv);
        postDiv.appendChild(visCDiv);
        postDiv.appendChild(cDDiv);

        // Append the entire post to the main container
        document.getElementById("postContainer").appendChild(postDiv);
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

// Call the function to fetch posts
fetchPosts();
