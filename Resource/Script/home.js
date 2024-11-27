const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler");
const menuToggler = document.querySelector(".menu-toggler");
const logoFull = document.getElementById("logo-full");
const logoCollapsed = document.getElementById("logo-collapsed");

// Ensure these heights match the CSS sidebar height values
let collapsedSidebarHeight = "56px";
let fullSidebarHeight = "calc(100vh - 32px)";

// Function to update logo visibility based on sidebar state
const updateLogoVisibility = () => {
  if (sidebar.classList.contains("collapsed")) {
    logoFull.style.display = "none"; // Hide full logo
    logoCollapsed.style.display = "block"; // Show collapsed logo
  } else {
    logoFull.style.display = "block"; // Show full logo
    logoCollapsed.style.display = "none"; // Hide collapsed logo
  }
};

// Initialize sidebar and logo visibility on page load
const initializeSidebar = () => {
  // Assume sidebar is not collapsed initially
  if (window.innerWidth >= 1024) {
    sidebar.style.height = fullSidebarHeight;
    sidebar.classList.remove("collapsed"); // Ensure full sidebar for larger screens
  } else {
    sidebar.classList.remove("collapsed"); // Ensure no collapse for smaller screens by default
    sidebar.style.height = "auto";
  }
  updateLogoVisibility(); // Ensure correct logo is displayed
};

// Toggle sidebar's collapsed state
sidebarToggler.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  updateLogoVisibility(); // Update logo visibility based on the new state
});

// Update sidebar height and menu toggle text
const toggleMenu = (isMenuActive) => {
  sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` : collapsedSidebarHeight;
  menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
};

// Toggle menu-active class and adjust height
menuToggler.addEventListener("click", () => {
  toggleMenu(sidebar.classList.toggle("menu-active"));
});

// Adjust sidebar height and logo visibility on window resize
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    sidebar.style.height = fullSidebarHeight;
    sidebar.classList.remove("collapsed"); // Ensure sidebar is fully open on larger screens
    logoFull.style.display = "block"; // Show full logo
    logoCollapsed.style.display = "none"; // Hide collapsed logo
  } else {
    sidebar.classList.remove("collapsed");
    sidebar.style.height = "auto";
    toggleMenu(sidebar.classList.contains("menu-active"));
    updateLogoVisibility(); // Update logo visibility based on sidebar state
  }
});

// Initialize sidebar and logo visibility on page load
document.addEventListener("DOMContentLoaded", initializeSidebar);


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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

function logout() {
    signOut(auth).then(() => {
        console.log("User logged out");
        window.location.href = "../../index.html"; // Adjust the path to your login page
        localStorage.removeItem('uid');
        localStorage.clear();
    }).catch((error) => {
        console.error("Logout error:", error);
    });
}

window.logout = logout;