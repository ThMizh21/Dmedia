import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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

// Submit the post form
postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = fileInput.files[0];
    const caption = captionInput.value;
    const user = auth.currentUser; // Get the logged-in user

    if (!file || !caption || !user) {
        alert('All fields are required!');
        return;
    }

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

        // 2. Save post data to Firestore
        const postData = {
            userId: user.uid,
            caption,
            post: data.secure_url, // Cloudinary URL of the uploaded file
            timestamp: serverTimestamp(), // Firestore server timestamp
            likes: [],
        };

        // Add post to Firestore
        const postRef = await addDoc(collection(firestore, 'posts'), postData);
        alert('Post created successfully!');
        postForm.reset(); // Reset the form fields

    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    }
});
