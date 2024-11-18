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
const collectionRef = collection(db, "userData");

// Fetch data using getDocs (modular API)
getDocs(collectionRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Get data from each document
      const userName = data.username;  // User's name
      const profileImg = data.profile;  // Profile image URL
      const mediaUrl = data.post;  // Image or video URL
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
        // Check if the media URL ends with .mp4 (video) or .jpg, .png (image)
        const fileExtension = mediaUrl.split('.').pop().toLowerCase();  // Get file extension (mp4, jpg, png, etc.)
        
        // If the media URL is a video
        if (fileExtension === 'mp4') {
            const videoElement = document.createElement("video");
            videoElement.classList.add("mediaContent");
            videoElement.src = mediaUrl;  // Use the full URL for the video
            videoElement.controls = true;  // Enable controls for the video
            visCDiv.appendChild(videoElement);
        } 
        // If the media URL is an image (jpg, png, jpeg)
        else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
            const imgElement = document.createElement("img");
            imgElement.classList.add("mediaContent");
            imgElement.src = mediaUrl;  // Use the full URL for the image
            imgElement.alt = "Post Image";  // Optional: Add alt text for image
            visCDiv.appendChild(imgElement);
        }
        // Optionally, handle other media types (e.g., audio, PDF)
        else {
            console.log("Unsupported media type:", fileExtension);
        }
    }
    

      // Append cHead and visC to the post div
      postDiv.appendChild(cHeadDiv);
      postDiv.appendChild(visCDiv);

      // Create comments section
      const commentsDiv = document.createElement("div");
      commentsDiv.classList.add("comments");

     

      // Append comments to the post div
      postDiv.appendChild(commentsDiv);

      // Append the entire post to the main container
      document.getElementById("postContainer").appendChild(postDiv);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
