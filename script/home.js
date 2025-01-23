const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler"); 
const menuToggler = document.querySelector(".menu-toggler");
const logoFull = document.getElementById("logo-full");
const logoCollapsed = document.getElementById("logo-collapsed");
let collapsedSidebarHeight = "56px";
let fullSidebarHeight = "calc(100vh - 32px)";


// Toggle sidebar's collapsed state
sidebarToggler.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  updateLogoVisibility(); 
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
    sidebar.classList.remove("collapsed"); 
    sidebar.style.height = fullSidebarHeight; 
    logoFull.style.display = "block";      
    sidebarToggler.style.display = "none";  
  } else {
    // Only collapse the sidebar on smaller screens (below 920px)
    sidebar.style.height = collapsedSidebarHeight;
    logoCollapsed.style.display = "block"; 
    sidebarToggler.style.display = "block"; 
  }
});

window.dispatchEvent(new Event("resize"));
