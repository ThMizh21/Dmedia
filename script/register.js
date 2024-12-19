function showSignupForm() {
    document.getElementById("signIn").style.display = "none";
    document.getElementById("signup").style.display = "block";
}

function showSigninForm() {
    document.getElementById("signup").style.display = "none";
    document.getElementById("signIn").style.display = "block";
}

const signup = document.getElementById("signupForm");
const nam = document.getElementById("name");
const username = document.getElementById("username");
const email = document.getElementById("rEmail");
const password = document.getElementById("rPassword");
const confirmPassword = document.getElementById("confirmPassword");
const nameError = document.getElementById("nameError")

signup.addEventListener("submit" , (event)=>{
 nameError.textContent ="";
 if(nam=""){
  console.log("enter name")
 }
})
