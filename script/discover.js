import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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
const firestore = getFirestore(app);

const searchInput = document.getElementById('search-bar');
const resultsContainer = document.getElementById('results-container');

searchInput.addEventListener('input', searchUsersAndPosts);

// Function to get the hashtag from the URL (if it exists)
function getHashtagFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('hashtag');  
}

// Function to handle search on page load if there's a hashtag in the URL
function handleHashtagSearchOnLoad() {
    const hashtagFromURL = getHashtagFromURL();

    if (hashtagFromURL) {
        searchInput.value = `#${hashtagFromURL}`;

        searchPosts(`#${hashtagFromURL}`);
    } else {
        fetchAndDisplayPosts();
    }
}

// Call this function when the page loads
window.onload = handleHashtagSearchOnLoad;

async function searchUsersAndPosts() {
    const queryValue = searchInput.value.trim();

    resultsContainer.innerHTML = '';

    // If the query is empty, fetch and display all posts
    if (!queryValue) {
        fetchAndDisplayPosts();  
        return;
    }

    try {
        // If the query starts with '#', search for posts (hashtags)
        if (queryValue.startsWith('#')) {
            console.log('Searching for posts with hashtag:', queryValue);
            await searchPosts(queryValue); 
        } else {
            console.log('Searching for users with query:', queryValue);
            await searchUsers(queryValue); 
        }
    } catch (error) {
        console.error('Error during search:', error);
        resultsContainer.innerHTML = '<p>An error occurred while searching. Please try again later.</p>';
    }
}

// Fetch and display all posts in a random order
async function fetchAndDisplayPosts() {
    const postsRef = collection(firestore, 'posts');

    try {
        const snapshot = await getDocs(postsRef);

        if (snapshot.empty) {
            resultsContainer.innerHTML = '<p>No posts found.</p>';
            return;
        }

        // Convert snapshot to an array of posts and shuffle it
        const postsArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const shuffledPosts = postsArray.sort(() => Math.random() - 0.5);

        shuffledPosts.forEach(post => {
            renderPost(post, post.id); 
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        resultsContainer.innerHTML = '<p>An error occurred while fetching posts. Please try again later.</p>';
    }
}

// Function to search users by username or name
async function searchUsers(queryValue) {
    const usersRef = collection(firestore, 'users');

    // Search for users where username or name contains the query (case-insensitive)
    const userQuery = query(usersRef,
        where('username', '>=', queryValue),
        where('username', '<=', queryValue + '\uf8ff') 
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
                <a href="./userprofile.html?username=${data.username}&uid=${doc.id}">
                    <div class="user-box">
                        <img src="${data.profile || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg'}" alt="Profile Image" class="profile-image">
                        <div class="user-info">
                            <p class="username">${data.username}</p>
                            <p class="name">${data.name}</p>
                        </div>
                    </div>
                </a>
            `;
            resultsContainer.appendChild(userElement); 
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to render post data
function renderPost(postData, postId) {
    const postElement = document.createElement('div');
    postElement.classList.add('post-item');

    const postBox = document.createElement('div');
    postBox.classList.add('post-box');
    postBox.setAttribute('data-post-id', postId); 
    console.log('Rendering post with ID:', postId); 

    const mediaUrl = postData.post;
    const fileExtension = mediaUrl ? mediaUrl.split('.').pop().toLowerCase() : null;
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'ogg'];

    if (mediaUrl && supportedExtensions.includes(fileExtension)) {
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            const postImage = document.createElement('img');
            postImage.src = mediaUrl;
            postImage.style.height = '250px';
            postImage.alt = 'Post Image';
            postImage.classList.add('post-image');
            postBox.appendChild(postImage);

            postImage.addEventListener('click', function () {
                window.location.href = `post-details.html?postId=${postId}`;
            });
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
            const postVideo = document.createElement('video');
            postVideo.src = mediaUrl;
            postVideo.style.width = '100%';
            postVideo.style.height = '250px';
            postVideo.removeAttribute('controls'); 
            postBox.appendChild(postVideo);

            postVideo.addEventListener('click', function () {
                window.location.href = `post-details.html?postId=${postId}`;
            });
        }
    }

    postElement.appendChild(postBox);

    resultsContainer.appendChild(postElement);
}

async function searchPosts(queryValue) {
    const hashtag = queryValue.trim().replace(/^#/, ''); 

    if (!hashtag) {
        return;
    }

    const postsRef = collection(firestore, 'posts');

    try {
        const postQuery = query(postsRef, where("hashtags", "array-contains", hashtag));

        const snapshot = await getDocs(postQuery);

        if (snapshot.empty) {
            console.log(`No posts found with the hashtag: #${hashtag}`);
            return;
        }

        snapshot.forEach(doc => {
            const postData = doc.data();
            const postId = doc.id;  
            console.log('Found post:', postData); 
            renderPost(postData, postId); 
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
        localStorage.removeItem("uid"); 
        window.location.href = "../../index.html"; 
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  });
}