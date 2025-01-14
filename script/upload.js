import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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

// Get the form elements
const postForm = document.getElementById('postForm');
const fileInput = document.getElementById('file');
const captionInput = document.getElementById('caption');
const hashtagInput = document.getElementById("hashtags");

// Get the post button
const postButton = document.getElementById('postButton');  // Assuming the button has an id of "postButton"

// Submit the post form
postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = fileInput.files[0];
    const caption = captionInput.value;
    const hashtagsInput = hashtagInput.value;  // Get the hashtag input
    const user = auth.currentUser; // Get the logged-in user

    // Validate inputs
    if (!file) {
        alert('You must upload a file to create a post!');
        return;
    }

    if (!caption || !user || !hashtagsInput) {
        alert('All fields are required!');
        return;
    }

    // Check if the caption length is greater than 60 characters
    if (caption.length >= 60) {
        alert('Caption must be more than 60 characters.');
        return;
    }

    // Extract and validate hashtags
    const hashtags = hashtagsInput
        .split(/\s+/)  // Split by spaces to get individual hashtag-like words
        .map(tag => tag.trim())  // Trim spaces around the tags
        .filter(tag => tag.startsWith('#'))  // Only keep hashtags that start with #
        .map(tag => tag.slice(1));  // Remove the "#" symbol from each hashtag

    // Check if there is at least one hashtag
    if (hashtags.length === 0) {
        alert('You must include at least one hashtag.');
        return;
    }

    // Check if any hashtag is longer than 18 characters
    if (hashtags.some(tag => tag.length > 18)) {
        alert('Each hashtag must be no longer than 18 characters.');
        return;
    }

    // Check if the total length of all hashtags combined exceeds 180 characters
    const totalHashtagsLength = hashtags.reduce((total, tag) => total + tag.length, 0);
    if (totalHashtagsLength > 160) {
        alert('The total length of all hashtags combined must not exceed 160 characters.');
        return;
    }

    // Proceed with the rest of the code if all validations pass

    // Disable the post button to prevent double submission
    postButton.disabled = true;

    try {
        // 1. Upload file to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default'); // Cloudinary upload preset
        formData.append('cloud_name', 'dzyypiqod'); // Cloudinary cloud name

        // Upload file to Cloudinary
        const res = await fetch('https://api.cloudinary.com/v1_1/dzyypiqod/image/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (!data.secure_url) {
            throw new Error('Failed to upload image/video to Cloudinary');
        }

        // 3. Get current timestamp for date_of_post (using Firestore's Timestamp)
        const date_of_post = Timestamp.now();  // Firestore Timestamp

        // 4. Save post data to Firestore
        const postData = {
            userId: user.uid,
            caption,
            post: data.secure_url, // Cloudinary URL of the uploaded file
            timestamp: serverTimestamp(), // Firestore server timestamp
            likes: [],
            hashtags: hashtags,  // Store the cleaned hashtags in the array (without '#')
            date_of_post: date_of_post // Store Firestore timestamp for the post
        };

        // Add post to Firestore
        const postRef = await addDoc(collection(firestore, 'posts'), postData);
        alert('Post created successfully!');
        postForm.reset(); // Reset the form fields

        // Re-enable the post button after the form is reset
        postButton.disabled = false;

    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');

        // Re-enable the post button in case of an error
        postButton.disabled = false;
    }
});

// Enable or disable the post button based on input fields
postForm.addEventListener('input', () => {
    const file = fileInput.files[0];
    const caption = captionInput.value;
    const hashtagsInput = hashtagInput.value;

    // Enable the button only if all fields are filled
    if (file && caption.length > 60 && hashtagsInput.split(/\s+/).filter(tag => tag.startsWith('#')).length > 0) {
        postButton.disabled = true;
    } else {
        postButton.disabled = false;
    }
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