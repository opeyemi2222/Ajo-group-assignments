document.addEventListener("DOMContentLoaded", function () {


    // =========================================
    // SIDEBAR ELEMENTS
    // =========================================

    const sidebar =
        document.querySelector(".profile-sidebar");

    const toggleButton =
        document.getElementById("profileSidebarToggle");

    const overlay =
        document.getElementById("profileOverlay");


    // =========================================
    // OPEN SIDEBAR
    // =========================================

    if (toggleButton) {

        toggleButton.addEventListener(
            "click",
            function () {

                sidebar.classList.add("show");

                overlay.classList.add("show");

            }
        );

    }


    // =========================================
    // CLOSE SIDEBAR
    // =========================================

    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                sidebar.classList.remove("show");

                overlay.classList.remove("show");

            }
        );

    }


    // =========================================
    // CLOSE SIDEBAR AFTER SELECTING TAB
    // =========================================

    const menuItems =
        document.querySelectorAll(
            ".profile-menu .nav-link"
        );


    menuItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                if (window.innerWidth <= 991) {

                    sidebar.classList.remove("show");

                    overlay.classList.remove("show");

                }

            }
        );

    });

    // =========================================
    // GET SAVED PROFILE
    // =========================================

    let profile =
        JSON.parse(
            localStorage.setItem("user", JSON.stringify(user))
        );

        


    // =========================================
    // PROFILE ELEMENTS
    // =========================================

    const profileName =
        document.getElementById("profileName");

    const profileNameDetail =
        document.getElementById("profileNameDetail");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileEmail =
        document.getElementById("profileEmail");

    const profileGroup =
        document.getElementById("profileGroup");

    const profileMemberSince =
        document.getElementById("profileMemberSince");

    const profileAvatar =
        document.getElementById("profileAvatar");



    // =========================================
    // EDIT FORM ELEMENTS
    // =========================================

    const editProfileForm =
        document.getElementById(
            "editProfileForm"
        );

    const editName =
        document.getElementById("editName");

    const editPhone =
        document.getElementById("editPhone");

    const editEmail =
        document.getElementById("editEmail");

    const editGroup =
        document.getElementById("editGroup");



    // =========================================
    // DISPLAY PROFILE
    // =========================================

    function displayProfile() {


        // Name

        if (profileName) {

            profileName.textContent =
                profile.name;

        }


        if (profileNameDetail) {

            profileNameDetail.textContent =
                profile.name;

        }


        // Phone

        if (profilePhone) {

            profilePhone.textContent =
                profile.phone;

        }


        // Email

        if (profileEmail) {

            profileEmail.textContent =
                profile.email;

        }


        // Group

        if (profileGroup) {

            profileGroup.textContent =
                profile.group;

        }


        // Member Since

        if (profileMemberSince) {

            profileMemberSince.textContent =
                profile.memberSince;

        }


        // Avatar

        if (profileAvatar) {

            profileAvatar.src =
                profile.avatar;

        }

    }



    // =========================================
    // LOAD PROFILE INTO EDIT FORM
    // =========================================

    function loadProfileIntoForm() {


        if (editName) {

            editName.value =
                profile.name;

        }


        if (editPhone) {

            editPhone.value =
                profile.phone;

        }


        if (editEmail) {

            editEmail.value =
                profile.email;

        }


        if (editGroup) {

            editGroup.value =
                profile.group;

        }

    }



    // =========================================
    // INITIALIZE PROFILE
    // =========================================

    displayProfile();

    loadProfileIntoForm();



    // =========================================
    // SAVE PROFILE
    // =========================================

    if (editProfileForm) {


        editProfileForm.addEventListener(
            "submit",
            function (event) {


                // Prevent page reload

                event.preventDefault();



                // Get values from form

                const updatedName =
                    editName.value.trim();

                const updatedPhone =
                    editPhone.value.trim();

                const updatedEmail =
                    editEmail.value.trim();



                // Validate

                if (
                    updatedName === "" ||
                    updatedPhone === "" ||
                    updatedEmail === ""
                ) {

                    alert(
                        "Please fill in all required fields."
                    );

                    return;

                }



                // Update profile object

                profile.name =
                    updatedName;

                profile.phone =
                    updatedPhone;

                profile.email =
                    updatedEmail;



                // Save to LocalStorage

                localStorage.setItem(
                    "ajoProfile",
                    JSON.stringify(profile)
                );



                // Update profile display

                displayProfile();



                // Success message

                alert(
                    "Profile updated successfully!"
                );



                // Go back to Profile Overview

                const overviewTab =
                    document.querySelector(
                        '[data-bs-target="#profile-overview"]'
                    );


                if (overviewTab) {

                    const tab =
                        new bootstrap.Tab(
                            overviewTab
                        );

                    tab.show();

                }

            }
        );

    }



    // =========================================
    // AVATAR PREVIEW
    // =========================================

    const avatarInput =
        document.getElementById("avatarInput");

    const avatarPreview =
        document.getElementById("avatarPreview");


    if (
        avatarInput &&
        avatarPreview
    ) {


        avatarInput.addEventListener(
            "change",
            function (event) {


                const file =
                    event.target.files[0];


                if (file) {


                    // Check image size

                    if (
                        file.size >
                        2 * 1024 * 1024
                    ) {

                        alert(
                            "Image must be less than 2MB."
                        );

                        avatarInput.value = "";

                        return;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function (e) {


                            // Preview

                            avatarPreview.src =
                                e.target.result;


                            // Main profile avatar

                            profileAvatar.src =
                                e.target.result;


                            // Save avatar

                            profile.avatar =
                                e.target.result;


                            localStorage.setItem(
                                "ajoProfile",
                                JSON.stringify(profile)
                            );


                        };


                    reader.readAsDataURL(file);

                }

            }
        );

    }


});