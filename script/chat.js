// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

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

// Function to get the target user's UID from the URL
function getTargetUserDetailsFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get("uid");  // Retrieve the target user's UID
  return { targetUserId };
}

// Window onload event to ensure proper initialization
window.onload = () => {
  const { targetUserId } = getTargetUserDetailsFromURL();  // Get the target user's UID

  if (targetUserId) {
    console.log("Target User UID:", targetUserId);

    // Display target user's name in the chat header (you may need to retrieve user details)
    document.getElementById("targetUserName").innerText = `Chat with User ${targetUserId}`;

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
        const sortUser = [currentUserId, targetUserId].sort().join("_");
        const chatRef = ref(database, `dmedia/chats/${sortUser}`);
        push(chatRef, {
          sender: currentUserId,
          receiver: targetUserId,
          message: message,
          timestamp: Date.now()
        });
        messageInput.value = ""; // Clear the input field
      }
    });

    // Listen for new messages
    const sortUser = [currentUserId, targetUserId].sort().join("_");
    onValue(ref(database, `dmedia/chats/${sortUser}`), (snapshot) => {
      chatWindow.innerHTML = ""; // Clear the chat window
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        const messageElement = document.createElement("div");
        messageElement.textContent = `${messageData.sender}: ${messageData.message}`;
        chatWindow.appendChild(messageElement);
      });
    });
  } else {
    console.error("Target User UID is missing in the URL.");
  }
};
