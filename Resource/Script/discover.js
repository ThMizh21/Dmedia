 // Firebase configuration and initialization
 const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Search posts and users
function searchPosts() {
    const query = document.getElementById('search-bar').value.trim();

    // Only proceed if the query starts with #
    if (query.startsWith('#')) {
        const hashtag = query.substring(1);  // Remove the '#' character

        // Clear previous results
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';

        // Fetch users with the hashtag in their posts
        db.collection('posts')
            .where('caption', 'array-contains', hashtag)
            .get()
            .then(snapshot => {
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
                    resultsContainer.appendChild(postElement);
                });
            })
            .catch(error => console.error("Error fetching posts: ", error));
    }
}
