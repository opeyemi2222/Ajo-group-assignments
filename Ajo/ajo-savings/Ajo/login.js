/* ==========================================
   USER AUTHENTICATION
========================================== */

// Elements

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");

function showMessage(message) {
    let messageBox = document.getElementById("authMessage");

    if (!messageBox) {
        messageBox = document.createElement("p");
        messageBox.id = "authMessage";
        messageBox.className = "auth-message";
        document.querySelector(".auth-card").prepend(messageBox);
    }

    messageBox.textContent = message;
}

/*==========================================
    TAB SWITCHING
==========================================*/

loginTab.addEventListener("click", () => {

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginBox.style.display = "block";
    registerBox.style.display = "none";

});

registerTab.addEventListener("click", () => {

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerBox.style.display = "block";
    loginBox.style.display = "none";

});


/*==========================================
    SHOW PASSWORD
==========================================*/

document.querySelectorAll(".togglePassword").forEach(icon=>{

    icon.addEventListener("click",function(){

        const input=this.parentElement.querySelector("input");

        if(input.type==="password"){

            input.type="text";

            this.classList.remove("fa-eye");

            this.classList.add("fa-eye-slash");

        }

        else{

            input.type="password";

            this.classList.remove("fa-eye-slash");

            this.classList.add("fa-eye");

        }

    });

});


/*==========================================
    PASSWORD STRENGTH
==========================================*/

const registerPassword=document.getElementById("registerPassword");

const strength=document.getElementById("strength");

if(registerPassword){

registerPassword.addEventListener("keyup",()=>{

    let password=registerPassword.value;

    let level="Weak";

    let color="red";

    if(password.length>=6){

        level="Medium";

        color="orange";

    }

    if(password.length>=8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)){

        level="Strong";

        color="green";

    }

    if(strength){

        strength.innerHTML=level;

        strength.style.color=color;

    }

});

}


/*==========================================
    REGISTER
==========================================*/

const registerForm=document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    const inputs=registerForm.querySelectorAll("input");

    const firstName=inputs[0].value.trim();

    const lastName=inputs[1].value.trim();

    const email=inputs[2].value.trim();

    const phone=inputs[3].value.trim();

    const password=document.getElementById("registerPassword").value;

    const confirm=document.getElementById("confirmPassword").value;

    if(password!==confirm){

        showMessage("Passwords do not match.");

        return;

    }

    const user={

        firstName,

        lastName,

        email,

        phone,

        password

    };

    localStorage.setItem("ajoUser",JSON.stringify(user));

    registerForm.reset();
    localStorage.setItem("userLoggedIn", "true");
    window.location.href = "home.html";

});

}


/*==========================================
    LOGIN
==========================================*/

const loginForm=document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    const email=document.getElementById("loginEmail").value;

    const password=document.getElementById("loginPassword").value;

    const saved=JSON.parse(localStorage.getItem("ajoUser"));

    if(!saved){

        showMessage("No account found. Please create an account first.");

        return;

    }

    if(email===saved.email && password===saved.password){

        localStorage.setItem("userLoggedIn","true");

        window.location.href="home.html";

    }

    else{

        showMessage("Incorrect email or password.");

    }

});

}


/*==========================================
    GOOGLE LOGIN
==========================================*/

const google=document.querySelector(".google-btn");

if(google){

google.addEventListener("click",()=>{

    showMessage("Google sign-in is not configured yet.");

});

}


/*==========================================
    FACEBOOK LOGIN
==========================================*/

const facebook=document.querySelector(".facebook-btn");

if(facebook){

facebook.addEventListener("click",()=>{

    showMessage("Facebook sign-in is not configured yet.");

});

}


