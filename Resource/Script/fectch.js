import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Reference to your Firestore collection
const collectionRef = collection(db, "images");

// Fetch data using getDocs (modular API)
getDocs(collectionRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Get data from each document
      const userName = data.userName;  // User's name
      const profileImg = data.profileImg;  // Profile image URL
      const mediaUrl = data.imgUrl;  // Image or video URL
      const comments = data.comments || [];  // Array of comments (if any)

      // Create post container div
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");

      // Create cHead (Header) with user info
      const cHeadDiv = document.createElement("div");
      cHeadDiv.classList.add("cHead");

      const userImg = document.createElement("img");
      userImg.src = profileImg;  // Profile image URL
      userImg.alt = `${userName}'s profile image`;

      const userNameDiv = document.createElement("div");
      userNameDiv.classList.add("userName");
      userNameDiv.textContent = userName;

      cHeadDiv.appendChild(userImg);
      cHeadDiv.appendChild(userNameDiv);

      // Create visC (Visual Content) with media (image/video)
      const visCDiv = document.createElement("div");
      visCDiv.classList.add("visC");

      if (mediaUrl) {
        // Check if the media URL is an image or video
        const fileIdMatch = mediaUrl.match(/file\/d\/(.*?)\//); // Extract the FILE_ID from Google Drive URL
        if (fileIdMatch) {
          const fileId = fileIdMatch[1];
          const googleDriveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

          if (mediaUrl.includes('.mp4')) {
            // For videos, create a <video> tag
            const videoElement = document.createElement("video");
            videoElement.classList.add("mediaContent");
            videoElement.src = googleDriveUrl;
            videoElement.controls = true;  // Enable controls for the video
            visCDiv.appendChild(videoElement);
          } else {
            // For images, create an <img> tag
            const imgElement = document.createElement("img");
            imgElement.classList.add("mediaContent");
            imgElement.src = googleDriveUrl;
            imgElement.alt = "Post Image";  // Optional: Add alt text
            visCDiv.appendChild(imgElement);
          }
        }
      }

      // Append cHead and visC to the post div
      postDiv.appendChild(cHeadDiv);
      postDiv.appendChild(visCDiv);

      // Create comments section
      const commentsDiv = document.createElement("div");
      commentsDiv.classList.add("comments");

      comments.forEach(comment => {
        const commentPara = document.createElement("p");
        commentPara.textContent = comment;
        commentsDiv.appendChild(commentPara);
      });

      // Append comments to the post div
      postDiv.appendChild(commentsDiv);

      // Append the entire post to the main container
      document.getElementById("postContainer").appendChild(postDiv);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
