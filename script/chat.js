// Firebase initialization code (make sure it's executed before any Firebase calls)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { getAuth,signOut  } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdxssptbJ3BYj-VgaRp7A8pe8TBD4ooq0",
  authDomain: "dmedia-2c144.firebaseapp.com",
  databaseURL: "https://dmedia-2c144-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "dmedia-2c144",
  storageBucket: "dmedia-2c144.appspot.com",
  messagingSenderId: "636638599757",
  appId: "1:636638599757:web:01c82ddff12b4d2ba45a04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Function to get the target user's UID from the URL
function getTargetUserDetailsFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get("uid");  // Retrieve the target user's UID from URL
  return { targetUserId };
}

// Function to fetch user details from Firestore
async function getUserDetails(uid) {
  const userRef = doc(firestore, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    console.error("User not found in Firestore.");
    return null;
  }
}

// Encryption and Decryption functions
const secretKey = "ThMizh@2116"; // Replace with your own secret key

function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

function decryptMessage(encryptedMessage) {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

window.onload = async () => {
  const { targetUserId } = getTargetUserDetailsFromURL();  // Get the target user's UID

  if (targetUserId) {
    console.log("Target User UID:", targetUserId);

    // Fetch target user's details from Firestore
    const userDetails = await getUserDetails(targetUserId);
    const targetUserName = userDetails ? userDetails.username : "Unknown User";

    // Display target user's name in the chat header
    document.getElementById("targetUserName").innerText = `Chat with ${targetUserName}`;

    // DOM elements
    const chatWindow = document.getElementById("chatWindow");
    const messageInput = document.getElementById("messageInput");
    const sendMessageButton = document.getElementById("sendMessageButton");

    // Current user ID (assume it's stored in localStorage or session)
    const currentUserId = localStorage.getItem("uid");

    if (!currentUserId) {
      console.error("Current user not logged in.");
      return;
    }

    // Function to send a message
    sendMessageButton.addEventListener("click", () => {
      const message = messageInput.value.trim();
      if (message) {
        const encryptedMessage = encryptMessage(message); // Encrypt the message
        const sortUser = [currentUserId, targetUserId].sort().join("_");
        const chatRef = ref(database, `dmedia/chats/${sortUser}`);
        push(chatRef, {
          sender: currentUserId,
          receiver: targetUserId,
          message: encryptedMessage, // Store the encrypted message
          timestamp: Date.now()
        });
        messageInput.value = ""; // Clear the input field
        sendMessageButton.disabled = true; // Disable the button again after sending
      }
    });

    // Listen for new messages
    const sortUser = [currentUserId, targetUserId].sort().join("_");
    onValue(ref(database, `dmedia/chats/${sortUser}`), (snapshot) => {
      chatWindow.innerHTML = ""; // Clear the chat window
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        const decryptedMessage = decryptMessage(messageData.message); // Decrypt the message

        const messageElement = document.createElement("div");

        // Check if the sender is the current user or the target user
        if (messageData.sender === currentUserId) {
          messageElement.classList.add("by-me"); // Add class 'by-me' for current user
        } else {
          messageElement.classList.add("by-others"); // Add class 'by-others' for others
        }

        messageElement.textContent = decryptedMessage; // Display the message text
        chatWindow.appendChild(messageElement);
      });
    });

    // Enable/Disable sendMessageButton based on input field content
    messageInput.addEventListener("input", () => {
      if (messageInput.value.trim()) {
        sendMessageButton.disabled = false; // Enable the button if there is text
      } else {
        sendMessageButton.disabled = true; // Disable the button if input is empty
      }
    });

  } else {
    console.error("Target User UID is missing in the URL.");
  }
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
