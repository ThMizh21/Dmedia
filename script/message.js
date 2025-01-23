import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { getAuth ,signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
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
    chatContainer.innerHTML = "";

    const chatPromises = [];

    snapshot.forEach((chatSnapshot) => {
      const chatId = chatSnapshot.key; 
      const [uid1, uid2] = chatId.split("_");

      
      if (uid1 === loggedInUserId || uid2 === loggedInUserId) {
        
        const otherUserId = uid1 === loggedInUserId ? uid2 : uid1;

       
        chatPromises.push(
          getUserDetails(otherUserId).then((userData) => {
            const otherUserName = userData ? userData.username : "Unknown User"; 
            const profileImage = userData && userData.profile ? userData.profile : "https://res.cloudinary.com/dzyypiqod/image/upload/v1733321879/download_5_m3yb4o.jpg"; // Default profile image

            const chatItem = document.createElement("div");
            chatItem.classList.add("chat");
            chatItem.innerHTML = `
              <img src="${profileImage}" alt="${otherUserName}'s profile image" class="profile-img" >
              <span class="chat-user">${otherUserName}</span>
            `;

            chatItem.addEventListener("click", () => {
              window.location.href = `chat.html?uid=${encodeURIComponent(otherUserId)}`;
            });

            chatContainer.appendChild(chatItem);
          })
        );
      }
    });

    // Wait for all promises to resolve before finishing
    await Promise.all(chatPromises);
  });
}

window.onload = () => {
  displayUserChats(); 
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