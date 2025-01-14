import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration and initialization
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

// Get DOM elements
const searchInput = document.getElementById('search-bar');
const resultsContainer = document.getElementById('results-container');

// Event listener for input change
searchInput.addEventListener('input', searchUsersAndPosts);

// Function to search users and posts based on input
async function searchUsersAndPosts() {
    const queryValue = searchInput.value.trim();

    // Clear previous results
    resultsContainer.innerHTML = '';

    // If the query is empty, return early
    if (!queryValue) return;

    try {
        // If the query starts with '#', search for posts (hashtags)
        if (queryValue.startsWith('#')) {
            console.log('Searching for posts with hashtag:', queryValue);
            await searchPosts(queryValue); // Search posts by hashtag
        } else {
            console.log('Searching for users with query:', queryValue);
            await searchUsers(queryValue); // Search users by username or name
        }
    } catch (error) {
        console.error('Error during search:', error);
        resultsContainer.innerHTML = '<p>An error occurred while searching. Please try again later.</p>';
    }
}

// Function to search users by username or name
async function searchUsers(queryValue) {
    const usersRef = collection(db, 'users');

    // Search for users where username or name contains the query (case-insensitive)
    const userQuery = query(usersRef,
        where('username', '>=', queryValue),
        where('username', '<=', queryValue + '\uf8ff') // Partial match for username
    );

    try {
        const snapshot = await getDocs(userQuery);
        if (snapshot.empty) {
            resultsContainer.innerHTML += '<p>No users found.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const userElement = document.createElement('div');
            userElement.classList.add('user-item');
            userElement.innerHTML = `
                <a href="./userprofile.html?username=${data.username}">
                    <div class="user-box">
                        <img src="${data.profile || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg'}" alt="Profile Image" class="profile-image">
                        <div class="user-info">
                            <p class="username">${data.username}</p>
                            <p class="name">${data.name}</p>
                        </div>
                    </div>
                </a>
            `;
            resultsContainer.appendChild(userElement); // Append user result
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to render post data
function renderPost(postData, postId) {
    const postElement = document.createElement('div');
    postElement.classList.add('post-item');

    // Create a post container
    const postBox = document.createElement('div');
    postBox.classList.add('post-box');
    postBox.setAttribute('data-post-id', postId); // Store postId as a data attribute
    console.log('Rendering post with ID:', postId); // Log the post ID

    // Check if the post contains video or image
    const mediaUrl = postData.post;
    const fileExtension = mediaUrl ? mediaUrl.split('.').pop().toLowerCase() : null;
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'ogg'];

    // Render the media (image/video)
    if (mediaUrl && supportedExtensions.includes(fileExtension)) {
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            const postImage = document.createElement('img');
            postImage.src = mediaUrl;
            postImage.style.height = '250px';
            postImage.alt = 'Post Image';
            postImage.classList.add('post-image');
            postBox.appendChild(postImage);

            // Add event listener to the image to redirect to post details page
            postImage.addEventListener('click', function () {
                window.location.href = `post-details.html?postId=${postId}`;
            });
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
            const postVideo = document.createElement('video');
            postVideo.src = mediaUrl;
            postVideo.style.width = '100%';
            postVideo.style.height = '250px';
            postVideo.removeAttribute('controls'); // Remove video controls
            postBox.appendChild(postVideo);

            // Add event listener to the video to redirect to post details page
            postVideo.addEventListener('click', function () {
                window.location.href = `post-details.html?postId=${postId}`;
            });
        }
    }

    // Append the postBox to the postElement
    postElement.appendChild(postBox);

    // Append the post to the results container
    resultsContainer.appendChild(postElement);
}

// Function to search posts by hashtag
async function searchPosts(queryValue) {
    const hashtag = queryValue.trim().replace(/^#/, ''); // Remove leading '#'

    if (!hashtag) {
        return;
    }

    const postsRef = collection(db, 'posts');

    try {
        const postQuery = query(postsRef, where("hashtags", "array-contains", hashtag));

        const snapshot = await getDocs(postQuery);

        if (snapshot.empty) {
            console.log(`No posts found with the hashtag: #${hashtag}`);
            return;
        }

        snapshot.forEach(doc => {
            const postData = doc.data();
            const postId = doc.id;  // Get the document ID (postId)
            console.log('Found post:', postData); // Log post data
            renderPost(postData, postId); // Render the post and pass the postId
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        resultsContainer.innerHTML += '<p>An error occurred while searching for posts. Please try again.</p>';
    }
}


// Logout Functionality
const logoutButton = document.getElementById("signOut");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully.");
        localStorage.removeItem("uid");  // Optionally clear local storage if used
        window.location.href = "../../index.html"; // Redirect to login page
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  });
}