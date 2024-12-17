// Redirect if already logged in
if (localStorage.getItem("uid")) {
    window.location.href = "./resource/pages/home.html"; // Redirect to home page
}

const form = document.getElementById("signupForm");
const name = document.getElementById("name");
const username = document.getElementById("username");
const email = document.getElementById("rEmail");
const password = document.getElementById("rPassword");
const confirmPassword = document.getElementById("confirmPassword");

const nameError = document.getElementById("nameError");
const usernameError = document.getElementById("usernameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCdxssptbJ3BYj-VgaRp7A8pe8TBD4ooq0",
    authDomain: "dmedia-2c144.firebaseapp.com",
    projectId: "dmedia-2c144",
    storageBucket: "dmedia-2c144.appspot.com",
    messagingSenderId: "636638599757",
    appId: "1:636638599757:web:01c82ddff12b4d2ba45a04",
    measurementId: "G-WSJN8XVXWJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Show message function for success/error feedback
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Sign up form submission handler
form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Clear previous error messages
    nameError.textContent = "";
    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";

    let formIsValid = true;

    // Validate name
    if (name.value.trim() === "") {
        formIsValid = false;
        nameError.textContent = "Name is required!";
    }

    // Validate username (should not contain spaces)
    if (/\s/.test(username.value)) {
        formIsValid = false;
        usernameError.textContent = "Username should not contain spaces!";
    }
    if (username.value.length < 3) {
        formIsValid = false;
        usernameError.textContent = "Username should be more than 3 characters.";
    }

    // Validate email
    const emailPattern = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;  // Regex for basic email validation
    if (!emailPattern.test(email.value)) {
        formIsValid = false;
        emailError.textContent = "Please enter a valid email address!";
    }

    // Validate password (length, number, special character, uppercase)
    const passwordPattern = /^(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,12}$/;
    if (!passwordPattern.test(password.value)) {
        formIsValid = false;
        passwordError.textContent = "Password must be 8-12 characters, include at least one number, one uppercase letter, and one special character!";
    }

    // Validate confirm password (should match password)
    if (password.value !== confirmPassword.value) {
        formIsValid = false;
        confirmPasswordError.textContent = "Passwords do not match!";
    }

    // If the form is valid, proceed with Firebase registration
    if (formIsValid) {
        createUserWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                const user = userCredential.user;
                const userData = {
                    name: name.value,
                    username: username.value,
                    email: email.value
                };

                // Save user data to Firestore
                const docRef = doc(db, "users", user.uid);
                setDoc(docRef, userData)
                    .then(() => {
                        showMessage("Account Created Successfully", 'signUpMessage');
                        form.reset(); // Reset the form after successful submission
                        window.location.href = "resource/pages/home.html";
                    })
                    .catch((error) => {
                        console.error("Error writing document:", error);
                        showMessage("Unable to save user data.", 'signUpMessage');
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode == 'auth/email-already-in-use') {
                    showMessage('Email Address Already Exists !!!', 'signUpMessage');
                } else {
                    showMessage('Unable to create User', 'signUpMessage');
                }
            });
    }
});

// Sign in form submission handler
const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showMessage('Login is successful', 'signInMessage');
            const user = userCredential.user;
            localStorage.setItem('uid', user.uid); // Store the uid in localStorage
            window.location.href = "resource/pages/home.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/invalid-credential') {
                showMessage('Incorrect Email or Password', 'signInMessage');
            } else {
                showMessage('Account does not exist', 'signInMessage');
            }
        });
});

// Password visibility toggle for signup
const togglePasswordSignUp = document.getElementById("togglePasswordSignUp");
const passwordInputSignUp = document.getElementById("rPassword");

togglePasswordSignUp.addEventListener("click", function () {
  // Toggle the type of password input between 'password' and 'text'
  const type = passwordInputSignUp.type === "password" ? "text" : "password";
  passwordInputSignUp.type = type;

  // Toggle the eye icon based on the password visibility
  const icon = type === "password"
    ? `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm-161 161q76 0 127.5-52.5T660-500q0-20-4-37.5T644-571l58-58q26 28 35 65t-5 79q-42 95-122.5 157.5T480-200q-90 0-170-44-2-2-3-4l55-55q24 11 52 17t60 6Z"/></svg>`;
  togglePasswordSignUp.innerHTML = icon;
});
