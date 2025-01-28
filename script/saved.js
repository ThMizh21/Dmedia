import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

function handleAuthStateChange(user) {
  if (user) {
    displaySavedPosts();
  } else {
    console.log('No user is logged in.');
  }
}

auth.onAuthStateChanged(handleAuthStateChange);

function getCurrentUser() {
  const user = auth.currentUser;
  if (user) {
    return user.uid; 
  } else {
    console.error('No user is logged in.');
    return null;
  }
}

// Function to fetch and display saved posts for the logged-in user
async function displaySavedPosts() {
  try {
    const userId = getCurrentUser();
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const savedPostIds = userDoc.data().savedPosts || [];

      if (savedPostIds.length > 0) {
        const postsContainer = document.getElementById('saved-posts');

        const postsCollectionRef = collection(db, 'posts');
        
        for (let postId of savedPostIds) {
          const postDocRef = doc(postsCollectionRef, postId);  
          const postDoc = await getDoc(postDocRef);

          // Check if post exists
          if (postDoc.exists()) {
            const postData = postDoc.data();
            const postUrl = postData.post;  
            // Create a thumbnail div for each post
            const postElement = document.createElement('div');
            postElement.classList.add('post-thumbnail');
            postElement.setAttribute('data-post-id', postId); 

            if (postUrl && (postUrl.includes('.jpg') || postUrl.includes('.png'))) {
              postElement.innerHTML = `<img src="${postUrl}" alt="Post Thumbnail">`;
            }
            else if (postUrl && postUrl.includes('.mp4')) {
              postElement.innerHTML = `<video src="${postUrl}"></video>`;
            }

            postsContainer.appendChild(postElement);

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