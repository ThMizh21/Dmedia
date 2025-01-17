// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { getAuth ,signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
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

// Function to get the logged-in user's UID from local storage
function getLoggedInUserId() {
  return localStorage.getItem("uid");
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

// Function to fetch all chat records for the logged-in user
async function displayUserChats() {
  const loggedInUserId = getLoggedInUserId();
  if (!loggedInUserId) {
    console.error("User is not logged in.");
    return;
  }

  const chatContainer = document.getElementById("chat-container");

  // Reference to the chats node
  const chatsRef = ref(database, "dmedia/chats");

  onValue(chatsRef, async (snapshot) => {
    chatContainer.innerHTML = ""; // Clear the container before displaying new chats

    const chatPromises = []; // Create an array to hold all the promises for fetching user details

    snapshot.forEach((chatSnapshot) => {
      const chatId = chatSnapshot.key; // This will be something like uid1_uid2
      const [uid1, uid2] = chatId.split("_");

      // Check if either UID matches the logged-in user's UID
      if (uid1 === loggedInUserId || uid2 === loggedInUserId) {
        // Fetch the other user's UID
        const otherUserId = uid1 === loggedInUserId ? uid2 : uid1;

        // Push the promise of fetching user details for the other user
        chatPromises.push(
          getUserDetails(otherUserId).then((userData) => {
            const otherUserName = userData ? userData.username : "Unknown User"; // Use a default name if user doesn't exist
            const profileImage = userData && userData.profile ? userData.profile : "https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg"; // Default profile image

            // Create a chat entry in the UI
            const chatItem = document.createElement("div");
            chatItem.classList.add("chat");
            chatItem.innerHTML = `
              <img src="${profileImage}" alt="${otherUserName}'s profile image" class="profile-img" >
              <span class="chat-user">${otherUserName}</span>
            `;

            // Add event listener to the chat item to open the chat
            chatItem.addEventListener("click", () => {
              window.location.href = `chat.html?uid=${encodeURIComponent(otherUserId)}`;
            });

            chatContainer.appendChild(chatItem); // Append the chat item to the container
          })
        );
      }
    });

    // Wait for all promises to resolve before finishing
    await Promise.all(chatPromises);
  });
}

// Run the function on page load
window.onload = () => {
  displayUserChats(); // Display all chats for the logged-in user
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