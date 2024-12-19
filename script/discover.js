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

// Event listener for input change
const searchInput = document.getElementById('search-bar');
const resultsContainer = document.getElementById('results-container');

searchInput.addEventListener('input', searchUsersAndPosts);

async function searchUsersAndPosts() {
    const queryValue = searchInput.value.trim();

    // Clear previous results
    resultsContainer.innerHTML = '';
    if (!queryValue) return;

    if (queryValue.startsWith('#')) {
        await searchPosts(queryValue);
    } else {
        await searchUsers(queryValue);
    }
}

// Function to search users by username or name
async function searchUsers(queryValue) {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef,
        where('username', '>=', queryValue),
        where('username', '<=', queryValue + '\uf8ff') // For partial matching
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

async function searchPosts(queryValue) {
    const hashtag = queryValue.trim(); // Make the query case-insensitive
    const postsRef = collection(db, 'posts');
    
    try {
        // Query posts where the hashtags field contains the hashtag
        const postQuery = query(postsRef, where("hashtags", "array-contains", `#${hashtag}`));
        const snapshot = await getDocs(postQuery);

        if (snapshot.empty) {
            resultsContainer.innerHTML += '<p>No posts found with this hashtag.</p>';
            return;
        }

        // Display matching posts
        snapshot.forEach(doc => {
            const data = doc.data();
            const postElement = document.createElement('div');
            postElement.classList.add('post-item');
            postElement.innerHTML = `
                <div class="post-box">
                    <img src="${data.post || 'default-image.jpg'}" alt="Post Image" class="post-image">
                    <div class="post-caption">${data.caption}</div>
                </div>
            `;
            resultsContainer.appendChild(postElement); // Append post result
        });
    } catch (error) {
        console.error('Error searching posts:', error);
    }
}
