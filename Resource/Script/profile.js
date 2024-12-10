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
            // Check if there's a profile image, otherwise use default
            const profileImageUrl = userData.profile || 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg';
            profileImg.src = profileImageUrl;
            nameElement.textContent = userData.name || 'No Name';
            usernameElement.textContent = userData.username;
            bioElement.textContent = userData.bio || ''; 
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
                const postDiv = document.createElement('div');
                postDiv.classList.add('post-item');
                
                if (post.post) {
                    const postImg = document.createElement('img');
                    postImg.src = post.post; // Assuming the post has an image URL
                    postImg.style.width = '250px'; 
                    postImg.style.height = '250px'; 
                    postImg.style.objectFit = 'cover'; 

                    postImg.addEventListener('click', () => {
                        openPostModal(post);
                    });

                    postDiv.appendChild(postImg);
                }

                // Removed post description display (no text below the image)
                postsGrid.appendChild(postDiv); // Append the post to the grid
            });
        }
    } catch (error) {
        console.error('Error loading posts: ', error);
    }
}

// Function to open the post details modal
// Function to open the post details modal
async function openPostModal(post) {
    const modal = document.createElement('div');
    modal.classList.add('post-modal');
    
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Post image
    const modalImg = document.createElement('img');
    modalImg.src = post.post;
    modalImg.style.width = '100%'; 
    modalImg.style.height = 'auto'; 
    modalContent.appendChild(modalImg);

    // Caption
    const modalCaption = document.createElement('p');
    modalCaption.textContent = post.caption || 'No caption';
    modalContent.appendChild(modalCaption);

    // Comments Section
    const commentsDiv = document.createElement('div');
    commentsDiv.classList.add('comments');
    
    if (post.comments && post.comments.length > 0) {
        for (const commentObj of post.comments) {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');

            // Fetch the user data for the comment's userId
            try {
                const userDoc = await getDoc(doc(firestore, 'users', commentObj.userId));
                const userData = userDoc.data();

                // Displaying the comment author's name (bold)
                const commentUser = document.createElement('strong');
                commentUser.textContent = userData ? userData.username : 'Unknown User';
                commentDiv.appendChild(commentUser);

                // Adding some spacing between the username and comment
                const space = document.createElement('span');
                space.textContent = ': ';
                commentDiv.appendChild(space);

                // Displaying the comment text (smaller)
                const commentText = document.createElement('p');
                commentText.textContent = commentObj.comment; // Access the comment text
                commentText.style.fontSize = '14px'; // Smaller font size for comment text
                commentDiv.appendChild(commentText);

            } catch (error) {
                console.error('Error fetching user data for comment:', error);
            }

            commentsDiv.appendChild(commentDiv);
        }
    } else {
        const noComments = document.createElement('p');
        noComments.textContent = 'No comments yet.';
        commentsDiv.appendChild(noComments);
    }
    
    modalContent.appendChild(commentsDiv);

    // Likes Section (same as before)
    const likesDiv = document.createElement('div');
    likesDiv.classList.add('likes');
    const likesCount = post.likes ? post.likes.length : 0;
    likesDiv.textContent = `${likesCount} Like${likesCount !== 1 ? 's' : ''}`;
    modalContent.appendChild(likesDiv);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closePostModal(modal); 
        }
    });
}


function closePostModal(modal) {
    document.body.removeChild(modal);
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
// Save Edited Profile
saveProfileBtn.addEventListener('click', async () => {
    const newName = editNameInput.value;
    const newUsername = editUsernameInput.value;
    const newBio = editBioInput.value;
    const profileImgFile = editProfileImgInput.files[0];  // The uploaded image file

    try {
        let profileImageUrl = null;

        // Check if a file is selected
        if (profileImgFile) {
            console.log('Uploading file: ', profileImgFile);

            // Create FormData to send the file to Cloudinary
            const formData = new FormData();
            formData.append('file', profileImgFile);
            formData.append('upload_preset', 'ml_default');  // Your Cloudinary upload preset
            formData.append('cloud_name', 'dzyypiqod'); // Cloudinary cloud name (change if necessary)

            // Upload the file to Cloudinary
            const res = await fetch('https://api.cloudinary.com/v1_1/dzyypiqod/image/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();  // Parse the response from Cloudinary

            // Log the response for debugging
            console.log('Cloudinary response:', data);

            // If Cloudinary returns a secure_url, assign it to profileImageUrl
            if (data.secure_url) {
                profileImageUrl = data.secure_url;
            } else {
                throw new Error('Cloudinary upload failed. Response: ' + JSON.stringify(data));
            }
        } else {
            // If no new image is selected, use the default profile image URL
            profileImageUrl = 'https://res.cloudinary.com/dzyypiqod/image/upload/v1733319438/download_4_edqwjy.jpg';
        }

        // Ensure profileImageUrl is valid
        if (!profileImageUrl) {
            throw new Error('Profile image URL is undefined or invalid');
        }

        // Update Firestore with new profile data, including profile image URL
        await updateDoc(doc(firestore, 'users', currentUserUid), {
            name: newName,
            username: newUsername,
            bio: newBio,
            profile: profileImageUrl // Save the Cloudinary URL
        });

        loadUserProfile(currentUserUid); // Reload the profile to reflect changes
        editProfileModal.style.display = 'none'; // Close the modal
    } catch (error) {
        console.error('Error saving profile: ', error);
    }
});
