/* ==========================================
   PROFILE PAGE
========================================== */

/* Dummy Profile Data */

const profile = {
    firstName: "John",
    lastName: "Doe",
    email: "admin@ajosave.com",
    phone: "+2348012345678",
    gender: "Male",
    dob: "2002-03-04",
    address: "Ijebu Ode, Ogun State, Nigeria",
    role: "Super Admin",
    status: "Active"
};

/* ==========================================
   LOAD PROFILE
========================================== */

function loadProfile() {
    const fields = document.querySelectorAll(".profile-details input");
    const gender = document.querySelector(".profile-details select");
    const address = document.querySelector(".profile-details textarea");

    if (fields.length < 5 || !gender || !address) return;

    fields[0].value = profile.firstName;
    fields[1].value = profile.lastName;
    fields[2].value = profile.email;
    fields[3].value = profile.phone;
    fields[4].value = profile.dob;
    gender.value = profile.gender;
    address.value = profile.address;

}

/* ==========================================
   SAVE PROFILE
========================================== */

function saveProfile() {
    const fields = document.querySelectorAll(".profile-details input");
    const gender = document.querySelector(".profile-details select");
    const address = document.querySelector(".profile-details textarea");

    profile.firstName = fields[0].value.trim();
    profile.lastName = fields[1].value.trim();
    profile.email = fields[2].value.trim();
    profile.phone = fields[3].value.trim();
    profile.dob = fields[4].value;
    profile.gender = gender.value;
    profile.address = address.value.trim();
    localStorage.setItem("ajoProfile", JSON.stringify(profile));
}

function setProfileEditing(isEditing) {
    document.querySelectorAll(".profile-details input, .profile-details textarea").forEach(field => {
        field.readOnly = !isEditing;
    });

    const gender = document.querySelector(".profile-details select");
    if (gender) gender.disabled = !isEditing;

    if (editButton) {
        editButton.dataset.editing = String(isEditing);
        editButton.classList.toggle("btn-success", isEditing);
        editButton.classList.toggle("btn-primary", !isEditing);
        editButton.innerHTML = isEditing
            ? '<i class="fa-solid fa-floppy-disk"></i> Save Changes'
            : '<i class="fa-solid fa-pen"></i> Edit Profile';
    }
}

/* ==========================================
   EDIT BUTTON
========================================== */

const editButton = document.querySelector(".page-title .btn");

if (editButton) {

    editButton.addEventListener("click", () => {
        const isEditing = editButton.dataset.editing === "true";

        if (isEditing) {
            saveProfile();
        }

        setProfileEditing(!isEditing);
    });

}

/* ==========================================
   PROFILE IMAGE
========================================== */

const uploadButton = document.querySelector(".profile-card .btn");

if (uploadButton) {

    uploadButton.addEventListener("click", () => {

        const imageUrl = prompt("Paste the URL of your profile image:");

        if (imageUrl && imageUrl.trim()) {
            document.querySelectorAll(".profile-image").forEach(image => {
                image.src = imageUrl.trim();
            });
            localStorage.setItem("ajoProfileImage", imageUrl.trim());
        }

    });

}

/* ==========================================
   SAVE BUTTON
========================================== */

const saveBtn = document.getElementById("saveProfile");

if (saveBtn) {

    saveBtn.addEventListener("click", saveProfile);

}

/* ==========================================
   PASSWORD CHANGE
========================================== */

const passwordForm = document.getElementById("passwordForm");

if (passwordForm) {

    passwordForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const password = document.getElementById("newPassword").value;

        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {

            const confirmInput = document.getElementById("confirmPassword");
            confirmInput.setCustomValidity("Passwords do not match.");
            confirmInput.reportValidity();
            confirmInput.addEventListener("input", () => confirmInput.setCustomValidity(""), { once: true });

            return;

        }

        localStorage.setItem("ajoPassword", password);

        this.reset();

    });

}

/* ==========================================
   ACTIVITY LOG
========================================== */

const activities = [

    "Logged into the system",

    "Added a new member",

    "Recorded contribution",

    "Approved payment",

    "Generated report"

];

function displayActivities() {

    console.table(activities);

}

/* ==========================================
   ACCOUNT STATS
========================================== */

const statistics = {

    members: 120,

    contributions: 520,

    payments: 215,

    reports: 45

};

function loadStatistics() {

    console.log("Account Statistics");

    console.log(statistics);

}

/* ==========================================
   AUTO SAVE (Demo)
========================================== */

document.querySelectorAll(".profile-details input, textarea").forEach(field => {

    field.addEventListener("change", () => {

        console.log("Changes detected...");

    });

});

/* ==========================================
   PAGE LOAD
========================================== */

window.onload = () => {

    const savedProfile = localStorage.getItem("ajoProfile");
    const savedImage = localStorage.getItem("ajoProfileImage");

    if (savedProfile) {
        Object.assign(profile, JSON.parse(savedProfile));
    }

    loadProfile();
    setProfileEditing(false);

    if (savedImage) {
        document.querySelectorAll(".profile-image").forEach(image => {
            image.src = savedImage;
        });
    }

    loadStatistics();

    displayActivities();

};
