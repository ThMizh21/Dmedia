import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdxssptbJ3BYj-VgaRp7A8pe8TBD4ooq0",
  authDomain: "dmedia-2c144.firebaseapp.com",
  databaseURL: "https://dmedia-2c144-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "dmedia-2c144",
  storageBucket: "dmedia-2c144.appspot.com",
  messagingSenderId: "636638599757",
  appId: "1:636638599757:web:01c82ddff12b4d2ba45a04"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Function to get the target user's UID from the URL
function getTargetUserDetailsFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get("uid");  
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
const secretKey = "ThMizh@2116"; 

function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

function decryptMessage(encryptedMessage) {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

window.onload = async () => {
  const { targetUserId } = getTargetUserDetailsFromURL();  

  if (targetUserId) {
    console.log("Target User UID:", targetUserId);

    const userDetails = await getUserDetails(targetUserId);
    const targetUserName = userDetails ? userDetails.username : "Unknown User";
    const targetUserProfileImage = userDetails && userDetails.profile ? userDetails.profile : "https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg";

    const targetUserProfile = document.getElementById("targetUserProfile");
    if (targetUserProfile) {
      targetUserProfile.innerHTML = `
        <img src="${targetUserProfileImage}" alt="${targetUserName}'s profile image" class="profile-img">
        <span id="targetUserName"> ${targetUserName}</span>
      `;
    } else {
      console.error("Element with ID 'targetUserProfile' not found.");
    }

    // event listener to the header div for redirection
    const headerDiv = document.getElementById("header");
    if (headerDiv) {
      headerDiv.addEventListener("click", () => {
        window.location.href = `userprofile.html?uid=${encodeURIComponent(targetUserId)}`;
      });
    } else {
      console.error("Element with ID 'header' not found.");
    }

    const chatWindow = document.getElementById("chatWindow");
    const messageInput = document.getElementById("messageInput");
    const sendMessageButton = document.getElementById("sendMessageButton");

    const currentUserId = localStorage.getItem("uid");

    if (!currentUserId) {
      console.error("Current user not logged in.");
      return;
    }

    // Function to send a message
    sendMessageButton.addEventListener("click", () => {
      const message = messageInput.value.trim();
      if (message) {
        const encryptedMessage = encryptMessage(message);
        const sortUser = [currentUserId, targetUserId].sort().join("_");
        const chatRef = ref(database, `dmedia/chats/${sortUser}`);
        push(chatRef, {
          sender: currentUserId,
          receiver: targetUserId,
          message: encryptedMessage, 
          timestamp: Date.now()
        });
        messageInput.value = ""; 
      }
    });

    // Listen for new messages
    const sortUser = [currentUserId, targetUserId].sort().join("_");
    onValue(ref(database, `dmedia/chats/${sortUser}`), async (snapshot) => {
      chatWindow.innerHTML = ""; 

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const messageData = childSnapshot.val();
          const decryptedMessage = decryptMessage(messageData.message); 

          const messageElement = document.createElement("div");
          messageElement.classList.add("message");
          messageElement.classList.add(messageData.sender === currentUserId ? "by-me" : "by-others");
          messageElement.innerHTML = `
            <div class="message-body">
              <p>${decryptedMessage}</p>
            </div>
          `;
          chatWindow.appendChild(messageElement);
        });
      } else {
        console.log("No messages found.");
      }
    });

    // Enable/Disable sendMessageButton based on input field content
    messageInput.addEventListener("input", () => {
      if (messageInput.value.trim()) {
        sendMessageButton.disabled = false; 
      } else {
        sendMessageButton.disabled = true; 
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
        localStorage.removeItem("uid");
        window.location.href = "../../index.html"; 
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  });
}