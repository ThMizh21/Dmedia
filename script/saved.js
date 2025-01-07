import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle user state changes
function handleAuthStateChange(user) {
  if (user) {
    // User is logged in, proceed to fetch saved posts
    displaySavedPosts();
  } else {
    console.log('No user is logged in.');
  }
}

// Listen for authentication state changes
auth.onAuthStateChanged(handleAuthStateChange);

// Function to get the currently logged-in user's UID
function getCurrentUser() {
  const user = auth.currentUser;
  if (user) {
    return user.uid;  // Return the logged-in user's UID
  } else {
    console.error('No user is logged in.');
    return null;
  }
}

// Function to fetch and display saved posts for the logged-in user
// Function to fetch and display saved posts for the logged-in user
async function displaySavedPosts() {
  try {
    const userId = getCurrentUser();
    if (!userId) return;

    // Get the user's document from the 'users' collection
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Get the 'savedPosts' array from the user's document
      const savedPostIds = userDoc.data().savedPosts || [];

      if (savedPostIds.length > 0) {
        // Get the posts corresponding to the saved postIds
        const postsContainer = document.getElementById('saved-posts');

        // Fetch posts using savedPostIds, query directly using doc.id
        const postsCollectionRef = collection(db, 'posts');
        
        // Loop through savedPostIds and fetch posts
        for (let postId of savedPostIds) {
          const postDocRef = doc(postsCollectionRef, postId);  // Get document by ID
          const postDoc = await getDoc(postDocRef);

          // Check if post exists
          if (postDoc.exists()) {
            const postData = postDoc.data();
            const postUrl = postData.post;  // This is the URL of the image or video

            // Create a thumbnail div for each post
            const postElement = document.createElement('div');
            postElement.classList.add('post-thumbnail');
            postElement.setAttribute('data-post-id', postId); // Store the post ID for redirection

            // If the post URL is an image (jpg, png)
            if (postUrl && (postUrl.includes('.jpg') || postUrl.includes('.png'))) {
              postElement.innerHTML = `<img src="${postUrl}" alt="Post Thumbnail">`;
            }
            // If the post URL is a video (mp4)
            else if (postUrl && postUrl.includes('.mp4')) {
              postElement.innerHTML = `<video src="${postUrl}"></video>`;
            }

            // Add the post thumbnail to the grid container
            postsContainer.appendChild(postElement);

            // Add event listener for redirection on click
            postElement.addEventListener('click', () => {
              window.location.href = `post-details.html?postId=${postId}`;
            });
          }
        }
      } else {
        console.log('No saved posts in the user\'s list.');
      }
    } else {
      console.log('User document not found.');
    }
  } catch (error) {
    console.error('Error fetching saved posts:', error);
  }
}
