const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler"); // Collapse button
const menuToggler = document.querySelector(".menu-toggler");
const logoFull = document.getElementById("logo-full");
const logoCollapsed = document.getElementById("logo-collapsed");

// Ensure these heights match the CSS sidebar height values
let collapsedSidebarHeight = "56px";
let fullSidebarHeight = "calc(100vh - 32px)";

// // Function to update logo visibility based on sidebar state
// const updateLogoVisibility = () => {
//   if (sidebar.classList.contains("collapsed")) {
//     logoFull.style.display = "none";         // Hide full logo
//     logoCollapsed.style.display = "block";    // Show collapsed logo
//   } else {
//     logoFull.style.display = "block";         // Show full logo
//     logoCollapsed.style.display = "none";     // Hide collapsed logo
//   }
// }

// Toggle sidebar's collapsed state
sidebarToggler.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  updateLogoVisibility(); // Update logo visibility based on the new state
});

// Update sidebar height and menu toggle text
const toggleMenu = (isMenuActive) => {
  sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` : collapsedSidebarHeight;
  menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
}

// Toggle menu-active class and adjust height
menuToggler.addEventListener("click", () => {
  toggleMenu(sidebar.classList.toggle("menu-active"));
});

// Adjust sidebar height, logo visibility, and collapse button visibility on window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 920) {
    sidebar.classList.remove("collapsed");  // Ensure sidebar is open on larger screens
    sidebar.style.height = fullSidebarHeight; // Set height to full
    logoFull.style.display = "block";       // Show full logo
    // logoCollapsed.style.display = "none";   // Hide collapsed logo
    sidebarToggler.style.display = "none";  // Hide collapse button on larger screens
  } else {
    // Only collapse the sidebar on smaller screens (below 920px)
    sidebar.style.height = collapsedSidebarHeight;
    // logoFull.style.display = "";        // Hide full logo
    logoCollapsed.style.display = "block";  // Show collapsed logo
    sidebarToggler.style.display = "block"; // Show collapse button on smaller screens
  }
});

// Call the resize function initially to set the correct visibility based on current window width
window.dispatchEvent(new Event("resize"));
