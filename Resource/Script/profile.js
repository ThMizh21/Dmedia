// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Your Firebase configuration
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
const firestore = getFirestore(app);
const storage = getStorage(app);

// Get references to the DOM elements
const profileImg = document.getElementById('profile-img');
const nameElement = document.getElementById('name');
const usernameElement = document.getElementById('username');
const bioElement = document.getElementById('bio');
const followersCount = document.getElementById('followers-count');
const followingCount = document.getElementById('following-count');
const postsGrid = document.getElementById('posts-grid');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editNameInput = document.getElementById('edit-name');
const editUsernameInput = document.getElementById('edit-username');
const editBioInput = document.getElementById('edit-bio');
const editProfileImgInput = document.getElementById('edit-profile-img');

// Current User's UID
let currentUserUid = null;

// Get the current logged-in user
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserUid = user.uid;
        loadUserProfile(currentUserUid);
    } else {
        window.location.href = 'login.html'; // Redirect to login if not authenticated
    }
});

// Load User Profile
async function loadUserProfile(uid) {
    try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            profileImg.src = userData.profile || 'default-profile-pic.jpg';
            nameElement.textContent = userData.name || 'No Name'; 
            usernameElement.textContent = userData.username;
            bioElement.textContent = userData.bio || ''; // Display bio text with line breaks
            followersCount.textContent = userData.followersCount || 0;
            followingCount.textContent = userData.followingCount || 0;

            // Load user posts
            loadUserPosts(uid);
        }
    } catch (error) {
        console.error('Error loading user profile: ', error);
    }
}

// Load User Posts
async function loadUserPosts(uid) {
    try {
        const postsQuery = query(collection(firestore, 'posts'), where('uid', '==', uid)); // query posts by the user's UID
        const querySnapshot = await getDocs(postsQuery);
        postsGrid.innerHTML = ''; // Clear previous posts before adding new ones

        querySnapshot.forEach(doc => {
            const post = doc.data();
            const postImg = document.createElement('img');
            postImg.src = post.imageUrl; // Assuming the post has an image URL
            postsGrid.appendChild(postImg); // Append the post to the grid
        });
    } catch (error) {
        console.error('Error loading posts: ', error);
    }
}

// Open Edit Profile Modal
editProfileBtn.addEventListener('click', async () => {
    try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUserUid));
        const userData = userDoc.data();
        editNameInput.value = userData.name;
        editUsernameInput.value = userData.username;
        editBioInput.value = userData.bio;
        editProfileModal.style.display = 'flex';
    } catch (error) {
        console.error('Error opening edit profile modal: ', error);
    }
});

// Save Edited Profile
saveProfileBtn.addEventListener('click', async () => {
    const newName = editNameInput.value;
    const newUsername = editUsernameInput.value;
    const newBio = editBioInput.value;
    const profileImgFile = editProfileImgInput.files[0];

    try {
        let profileImageUrl = null;

        // If the user has selected a new profile image
        if (profileImgFile) {
            const profileImageRef = ref(storage, `profileImages/${currentUserUid}`);
            await uploadBytes(profileImageRef, profileImgFile);
            profileImageUrl = await getDownloadURL(profileImageRef);
        } else {
            // If no new image is selected, we keep the existing profile image URL
            const userDoc = await getDoc(doc(firestore, 'users', currentUserUid));
            const userData = userDoc.data();
            profileImageUrl = userData.profile; // Keep existing profile image URL
        }

        // Update user data in Firestore
        await updateDoc(doc(firestore, 'users', currentUserUid), {
            name: newName,
            username: newUsername,
            bio: newBio,
            profile: profileImageUrl // Keep the updated or existing profile image URL
        });

        loadUserProfile(currentUserUid); // Reload the profile to reflect changes
        editProfileModal.style.display = 'none'; // Close the modal
    } catch (error) {
        console.error('Error saving profile: ', error);
    }
});

// Cancel Edit Profile
cancelEditBtn.addEventListener('click', () => {
    editProfileModal.style.display = 'none';
});
