document.addEventListener("DOMContentLoaded", () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        window.location.href = "resource/pages/home.html";
    }
});
