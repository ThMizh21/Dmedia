// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, set, onChildAdded } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Firebase Configuration (Replace with your Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyCdxssptbJ3BYj-VgaRp7A8pe8TBD4ooq0",
    authDomain: "dmedia-2c144.firebaseapp.com",
    projectId: "dmedia-2c144",
    storageBucket: "dmedia-2c144.appspot.com",
    messagingSenderId: "636638599757",
    appId: "1:636638599757:web:01c82ddff12b4d2ba45a04",
    measurementId: "G-WSJN8XVXWJ"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Authenticate a test user (for demonstration)
signInAnonymously(auth).catch((error) => {
    console.error("Error signing in:", error);
});

// Listen for changes in authentication state (to get the logged-in user's UID)
let loggedUserUID = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        loggedUserUID = user.uid; // Get the logged-in user's UID
        console.log("Logged in as:", loggedUserUID);
    } else {
        console.log("No user is logged in.");
    }
});

// Get the target user UID from the URL (profile page)
const urlParams = new URLSearchParams(window.location.search);
const targetedUserUID = urlParams.get("uid");  // Get the 'uid' query parameter from the URL

// If no UID is provided in the URL, we can either show an error or prompt the user
if (!targetedUserUID) {
    console.error("No target UID found in URL.");
}

// Send message function
document.getElementById("sendMessageButton").addEventListener("click", function () {
    const message = document.getElementById("messageInput").value;

    // Ensure the logged user and message are valid
    if (loggedUserUID && targetedUserUID && message.trim()) {
        const messageId = generateMessageId(loggedUserUID, targetedUserUID); // Generate unique message ID
        const messageData = {
            from: loggedUserUID,
            to: targetedUserUID,
            message: message, // No encryption
            timestamp: Date.now(),
        };

        sendMessageToFirebase(messageId, messageData)
            .then(() => {
                console.log("Message sent successfully!");
                document.getElementById("messageInput").value = ""; // Clear the input field
            })
            .catch((error) => {
                console.error("Error sending message:", error);
            });
    } else {
        console.log("Message or user data is invalid.");
    }
});

// Generate a unique message ID based on user UIDs
function generateMessageId(uid1, uid2) {
    return uid1 < uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1;
}

// Firebase function to send a message with promise-based error handling
function sendMessageToFirebase(messageId, messageData) {
    return new Promise((resolve, reject) => {
        const messageRef = ref(db, 'messages/' + messageId);
        set(messageRef, messageData)
            .then(() => {
                resolve(); // Successfully written to Firebase
            })
            .catch((error) => {
                reject("Error sending message to Firebase: " + error.message);
            });
    });
}

// Firebase function to listen for new messages (Real-time listener)
function listenForMessages() {
    const messagesRef = ref(db, 'messages');

    onChildAdded(messagesRef, (snapshot) => {
        const messageData = snapshot.val();
        if (messageData) {
            displayMessage(messageData);
        }
    }, (error) => {
        console.error("Error listening for messages: " + error.message);
    });
}

// Function to display messages
function displayMessage(messageData) {
    const messageElement = document.createElement("div");
    messageElement.textContent = `From: ${messageData.from}, Message: ${messageData.message}`;
    document.getElementById("messagesContainer").appendChild(messageElement);
}

// Start listening for new messages when the page loads
window.onload = function () {
    listenForMessages();
};


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