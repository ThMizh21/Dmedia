// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Firebase initialization
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
const storage = getStorage(app);

// DOM references
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

// Button for messaging (targeting this user's UID)
const messageButton = document.getElementById('messageButton');  // Assume this is the button in your profile page

// Current User's UID
let currentUserUid = null;

// Get the current logged-in user
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserUid = user.uid;
        loadUserProfile(currentUserUid);
    } else {
        window.location.href = '../../index.html'; // Redirect to login if not authenticated
    }
});

// Load User Profile
async function loadUserProfile(uid) {
    try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const profileImageUrl = userData.profile || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg';
            profileImg.src = profileImageUrl;
            nameElement.textContent = userData.name || 'No Name';
            usernameElement.textContent = userData.username;
            bioElement.textContent = userData.bio || ''; 
            followersCount.textContent = userData.followersCount || 0;
            followingCount.textContent = userData.followingCount || 0;

            // Dynamically add a message button
            // Assuming the "messageButton" is dynamically added to the profile page:
            if (messageButton) {
                // Set message button to redirect to message.html with this user's UID
                messageButton.addEventListener('click', () => {
                    // Redirect to message page with targeted user UID
                    window.location.href = `message.html?uid=${uid}`;
                });
            }

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
        const postsQuery = query(collection(firestore, 'posts'), where('userId', '==', uid)); 
        const querySnapshot = await getDocs(postsQuery);
        
        postsGrid.innerHTML = ''; // Clear previous posts before adding new ones

        if (querySnapshot.empty) {
            // Display a message if no posts are found
            const noPostsMessage = document.createElement('p');
            noPostsMessage.textContent = 'No post yet';
            postsGrid.appendChild(noPostsMessage);
        } else {
            // If posts are found, display them
            querySnapshot.forEach(doc => {
                const post = doc.data();
                const postId = doc.id;  // Get the post's unique ID from Firestore
                const postDiv = document.createElement('a');
                
                // Set the link to post-details.html with the postId as a query parameter
                postDiv.href = `post-details.html?postId=${postId}`;
                postDiv.classList.add('post-item');
                
                if (post.post) {
                    const postImg = document.createElement('img');
                    postImg.src = post.post; // Assuming the post has an image URL
                    postImg.style.width = '250px'; 
                    postImg.style.height = '250px'; 
                    postImg.style.objectFit = 'cover'; 

                    // Append the image to the post div
                    postDiv.appendChild(postImg);
                }

                postsGrid.appendChild(postDiv); // Append the post to the grid
            });
        }
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
    const profileImgFile = editProfileImgInput.files[0];  // The uploaded image file

    // Clear previous error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((msg) => msg.remove());

    let isValid = true;

    // Validate Name
    if (newName.trim() === '') {
        isValid = false;
        showError(editNameInput, 'Name cannot be empty.');
    } else if (newName.length > 20) {
        isValid = false;
        showError(editNameInput, 'Name cannot be more than 20 characters.');
    } else if (/[^a-zA-Z\s]/.test(newName)) { // Check for special characters
        isValid = false;
        showError(editNameInput, 'Name cannot contain special characters.');
    }

    // Validate Username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,12}$/;
    if (!usernameRegex.test(newUsername.trim())) {
        isValid = false;
        showError(editUsernameInput, 'Username must be between 3 and 12 characters and can only contain letters, numbers, underscores (_), and hyphens (-).');
    }

    // Validate Bio
    if (newBio.length > 160) {
        isValid = false;
        showError(editBioInput, 'Bio cannot be more than 160 characters.');
    }

    // If all validations passed, proceed with saving the profile
    if (isValid) {
        try {
            let profileImageUrl = null;

            // Check if a file is selected
            if (profileImgFile) {
                console.log('Uploading file: ', profileImgFile);

                // Create FormData to send the file to Cloudinary
                const formData = new FormData();
                formData.append('file', profileImgFile);
                formData.append('upload_preset', 'ml_default');  // Your Cloudinary upload preset
                formData.append('cloud_name', 'dzyypiqod'); // Cloudinary account name

                // Upload the file to Cloudinary (adjust this code to use your Cloudinary API)
                const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dzyypiqod/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await uploadResponse.json();
                profileImageUrl = data.secure_url;
            } else {
                // If no file is selected, do not change the profile image
                const userDoc = await getDoc(doc(firestore, 'users', currentUserUid));
                const existingUserData = userDoc.data();
                profileImageUrl = existingUserData.profile || null; // Retain existing profile image
            }

            // Update user document in Firestore with new profile information (no image change if no file uploaded)
            await updateDoc(doc(firestore, 'users', currentUserUid), {
                name: newName,
                username: newUsername,
                bio: newBio,
                profile: profileImageUrl, // This will either be the new URL or the existing one
            });

            // Update UI with new profile data
            profileImg.src = profileImageUrl || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg';
            nameElement.textContent = newName;
            usernameElement.textContent = newUsername;
            bioElement.textContent = newBio;

            // Close the modal
            editProfileModal.style.display = 'none';

            // Show success alert
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile changes:', error);
        }
    }
});

// Show error message for invalid fields
function showError(inputField, errorMessage) {
    const errorSpan = document.createElement('span');
    errorSpan.classList.add('error-message');
    errorSpan.textContent = errorMessage;
    errorSpan.style.color = 'red';
    inputField.parentElement.appendChild(errorSpan);
}

// Cancel Edit Profile
cancelEditBtn.addEventListener('click', () => {
    editProfileModal.style.display = 'none';
});


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