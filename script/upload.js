import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

const postForm = document.getElementById('postForm');
const fileInput = document.getElementById('file');
const captionInput = document.getElementById('caption');
const hashtagInput = document.getElementById("hashtags");

const postButton = document.getElementById('postButton'); 

// Submit the post form
postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = fileInput.files[0];
    const caption = captionInput.value;
    const hashtagsInput = hashtagInput.value;  
    const user = auth.currentUser; 
    // Validate inputs
    if (!file) {
        alert('You must upload a file to create a post!');
        return;
    }

    if (!caption || !user || !hashtagsInput) {
        alert('All fields are required!');
        return;
    }

    if (caption.length >= 60) {
        alert('Caption must be more than 60 characters.');
        return;
    }

    const hashtags = hashtagsInput
        .split(/\s+/)  
        .map(tag => tag.trim()) 
        .filter(tag => tag.startsWith('#'))  
        .map(tag => tag.slice(1)); 

    if (hashtags.length === 0) {
        alert('You must include at least one hashtag.');
        return;
    }

    if (hashtags.some(tag => tag.length > 18)) {
        alert('Each hashtag must be no longer than 18 characters.');
        return;
    }

    const totalHashtagsLength = hashtags.reduce((total, tag) => total + tag.length, 0);
    if (totalHashtagsLength > 160) {
        alert('The total length of all hashtags combined must not exceed 160 characters.');
        return;
    }

    // Disable the post button to prevent double submission
    postButton.disabled = true;

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default'); 
        formData.append('cloud_name', 'dzyypiqod'); 

        // Upload file to Cloudinary
        const res = await fetch('https://api.cloudinary.com/v1_1/dzyypiqod/image/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (!data.secure_url) {
            throw new Error('Failed to upload image/video to Cloudinary');
        }

        const date_of_post = Timestamp.now();  

        const postData = {
            userId: user.uid,
            caption,
            post: data.secure_url,
            timestamp: serverTimestamp(), 
            likes: [],
            hashtags: hashtags,  
            date_of_post: date_of_post
        };

        // Add post to Firestore
        const postRef = await addDoc(collection(firestore, 'posts'), postData);
        alert('Post created successfully!');
        postForm.reset(); 

        // Re-enable the post button after the form is reset
        postButton.disabled = false;

    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');

        postButton.disabled = false;
    }
});

// Enable or disable the post button based on input fields
postForm.addEventListener('input', () => {
    const file = fileInput.files[0];
    const caption = captionInput.value;
    const hashtagsInput = hashtagInput.value;

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
        localStorage.removeItem("uid");  
        window.location.href = "../../index.html";
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  });
}