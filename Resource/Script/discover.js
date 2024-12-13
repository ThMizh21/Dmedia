import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-bar');
    const resultsContainer = document.getElementById('results-container');

    // Event listener for input change
    searchInput.addEventListener('input', searchUsersAndPosts);

    // Function to search users and posts based on input
    async function searchUsersAndPosts() {
        const queryValue = searchInput.value.trim(); // Get the value from the input
        if (queryValue === '') {
            resultsContainer.innerHTML = ''; // Clear results if input is empty
            return;
        }

        // Clear previous results
        resultsContainer.innerHTML = '';

        // Determine if the query is a username or a hashtag
        if (queryValue.startsWith('#')) {
            await searchPosts(queryValue); // Search for posts with the hashtag
        } else {
            await searchUsers(queryValue); // Search for users by username
        }
    }

    // Function to search for users by username
    async function searchUsers(queryValue) {
        const usersRef = collection(db, 'users'); // Reference to the 'users' collection
        const userQuery = query(usersRef, where('username', '==', queryValue)); // Query to match the username

        try {
            const snapshot = await getDocs(userQuery); // Execute query
            if (snapshot.empty) {
                resultsContainer.innerHTML += '<p>No users found.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const userElement = document.createElement('div');
                userElement.classList.add('user-item');
                userElement.innerHTML = `    
                    <div class="username">
                        <a href="./profile.html?username=${data.username}">${data.username}</a>
                    </div>
                    <div class="user-bio">${data.bio || 'No bio available.'}</div>
                `;
                resultsContainer.appendChild(userElement); // Append user result
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Function to search for posts with a specific hashtag
    async function searchPosts(queryValue) {
        const hashtag = queryValue.substring(1); // Remove '#' character
        const postsRef = collection(db, 'posts'); // Reference to the 'posts' collection
        const postQuery = query(postsRef, where('caption', 'array-contains', hashtag)); // Query to find posts with the hashtag

        try {
            const snapshot = await getDocs(postQuery); // Execute query
            if (snapshot.empty) {
                resultsContainer.innerHTML += '<p>No posts found with this hashtag.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const postElement = document.createElement('div');
                postElement.classList.add('post-item');
                postElement.innerHTML = `
                    <div class="username">
                        <a href="./profile.html?username=${data.username}">${data.username}</a>
                    </div>
                    <div class="post-caption">${data.caption}</div>
                    <div class="post-image">
                        <img src="${data.imageUrl}" alt="Post Image" />
                    </div>
                `;
                resultsContainer.appendChild(postElement); // Append post result
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }
});
