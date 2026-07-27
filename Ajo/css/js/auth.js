/* ==========================================
   AUTHENTICATION PAGE
========================================== */

/* ==========================================
   SHOW / HIDE PASSWORD
========================================== */

function showFieldError(input, message) {
    input.setCustomValidity(message);
    input.reportValidity();
    input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
}

document.querySelectorAll(".togglePassword").forEach(icon => {

    icon.addEventListener("click", function () {

        const input = this.previousElementSibling;

        if (input.type === "password") {

            input.type = "text";

            this.classList.remove("fa-eye");

            this.classList.add("fa-eye-slash");

        } else {

            input.type = "password";

            this.classList.remove("fa-eye-slash");

            this.classList.add("fa-eye");

        }

    });

});

/* ==========================================
   REGISTER
========================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const firstName = this.querySelectorAll("input")[0].value.trim();
        const lastName = this.querySelectorAll("input")[1].value.trim();
        const email = this.querySelectorAll("input")[2].value.trim();
        const phone = this.querySelectorAll("input")[3].value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (
            firstName === "" ||
            lastName === "" ||
            email === "" ||
            phone === "" ||
            password === ""
        ) {

            showFieldError(this.querySelector("input:invalid"), "Please fill in all fields.");

            return;

        }

        if (password.length < 6) {

            showFieldError(document.getElementById("registerPassword"), "Password must be at least 6 characters.");

            return;

        }

        if (password !== confirmPassword) {

            showFieldError(document.getElementById("confirmPassword"), "Passwords do not match.");

            return;

        }

        const user = {
            firstName,
            lastName,
            email,
            phone,
            password
        };

        localStorage.setItem("ajoUser", JSON.stringify(user));

        localStorage.setItem("isLoggedIn", "true");

        registerForm.reset();

        window.location.href = "dashboard.html";

    });

}

/* ==========================================
   LOGIN
========================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const savedUser = JSON.parse(localStorage.getItem("ajoUser"));

        if (!savedUser) {

            showFieldError(document.getElementById("loginEmail"), "No account found. Please register first.");

            return;

        }

        if (
            email === savedUser.email &&
            password === savedUser.password
        ) {

            localStorage.setItem("isLoggedIn", "true");

            window.location.href = "dashboard.html";

        } else {

            showFieldError(document.getElementById("loginPassword"), "Invalid email or password.");

        }

    });

}

/* ==========================================
   REMEMBER ME
========================================== */

const rememberMe = document.querySelector("input[type='checkbox']");

if (rememberMe) {

    rememberMe.addEventListener("change", function () {

        if (this.checked) {

            console.log("Remember Me Enabled");

        } else {

            console.log("Remember Me Disabled");

        }

    });

}

/* ==========================================
   LOGOUT FUNCTION
========================================== */

function logout() {

    localStorage.removeItem("isLoggedIn");

    window.location.href = "index.html";

}

