document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // SIDEBAR ELEMENTS
    // =========================================

    const sidebar      = document.querySelector(".profile-sidebar");
    const toggleButton = document.getElementById("profileSidebarToggle");
    const overlay      = document.getElementById("profileOverlay");

    // =========================================
    // OPEN SIDEBAR
    // =========================================

    if (toggleButton) {
        toggleButton.addEventListener("click", function () {
            sidebar.classList.add("show");
            overlay.classList.add("show");
        });
    }

    // =========================================
    // CLOSE SIDEBAR
    // =========================================

    if (overlay) {
        overlay.addEventListener("click", function () {
            sidebar.classList.remove("show");
            overlay.classList.remove("show");
        });
    }

    // =========================================
    // CLOSE SIDEBAR AFTER SELECTING TAB
    // =========================================

    document.querySelectorAll(".profile-menu .nav-link").forEach(function (item) {
        item.addEventListener("click", function () {
            if (window.innerWidth <= 991) {
                sidebar.classList.remove("show");
                overlay.classList.remove("show");
            }
        });
    });

    // =========================================
    // GET SAVED PROFILE
    // =========================================

    // BUG FIX: was localStorage.setItem("user", JSON.stringify(user))
    // which is undefined and destructive — changed to getItem
    let profile = {};
    try {
        profile = JSON.parse(localStorage.getItem("user")) || {};
    } catch (e) {
        profile = {};
    }

    // Fallback defaults so the page never shows blank fields
    profile.name        = profile.name        || "";
    profile.phone       = profile.phone       || "";
    profile.email       = profile.email       || "";
    profile.group       = profile.group       || "";
    profile.memberSince = profile.memberSince || "";
    profile.avatar      = profile.avatar      || "";
    profile.role        = profile.role        || "Savings Member";
    profile.createdAt   = profile.createdAt   || "";

    // =========================================
    // BACKFILL memberId FOR EXISTING ACCOUNTS
    // If the stored user has no memberId (registered before this feature
    // was added), find their position in the accounts array and assign one,
    // then save it back so it stays consistent on every visit.
    // =========================================
    if (!profile.memberId && profile.email) {
        var allAccounts = [];
        try { allAccounts = JSON.parse(localStorage.getItem("accounts")) || []; } catch(e) {}

        // Find their 1-based position by email
        var idx = allAccounts.findIndex(function(a) {
            return a.email && a.email.toLowerCase() === profile.email.toLowerCase();
        });

        // If found use their index; otherwise fall back to array length + 1
        var memberNum = (idx >= 0 ? idx + 1 : allAccounts.length + 1);
        profile.memberId = "AJO-" + String(memberNum).padStart(3, "0");

        // Save the backfilled id into both accounts[] and the session user
        if (idx >= 0) {
            allAccounts[idx].memberId = profile.memberId;
            localStorage.setItem("accounts", JSON.stringify(allAccounts));
        }
        localStorage.setItem("user", JSON.stringify(profile));
    }

    // =========================================
    // PROFILE ELEMENTS
    // =========================================

    const profileName        = document.getElementById("profileName");
    const profileNameDetail  = document.getElementById("profileNameDetail");
    const profilePhone       = document.getElementById("profilePhone");
    const profileEmail       = document.getElementById("profileEmail");
    const profileMemberId    = document.getElementById("profileMemberId");
    const profileMemberSince = document.getElementById("profileMemberSince");
    const profileRole        = document.getElementById("profileRole");
    const profileAvatar      = document.getElementById("profileAvatar");
    const emptyAvatar        = document.getElementById("emptyAvatar");
    const accountMemberId    = document.getElementById("accountMemberId");
    const accountJoined      = document.getElementById("accountJoined");

    // =========================================
    // EDIT FORM ELEMENTS
    // =========================================

    const editProfileForm = document.getElementById("editProfileForm");
    const editName        = document.getElementById("editName");
    const editPhone       = document.getElementById("editPhone");
    const editEmail       = document.getElementById("editEmail");
    const editGroup       = document.getElementById("editGroup");

    // =========================================
    // DISPLAY PROFILE
    // =========================================

    function displayProfile() {

        if (profileName)        profileName.textContent        = profile.name        || "—";
        if (profileNameDetail)  profileNameDetail.textContent  = profile.name        || "—";
        if (profilePhone)       profilePhone.textContent       = profile.phone       || "—";
        if (profileEmail)       profileEmail.textContent       = profile.email       || "—";
        if (profileMemberId)    profileMemberId.textContent    = profile.memberId    || "—";
        if (profileMemberSince) profileMemberSince.textContent = profile.memberSince || "—";
        if (profileRole)        profileRole.textContent        = profile.role        || "Savings Member";

        // Member ID — set at registration, e.g. "AJO-001"
        if (accountMemberId) {
            accountMemberId.textContent = profile.memberId || "—";
        }

        // Joined — format the ISO createdAt date as "Month YYYY"
        if (accountJoined) {
            if (profile.createdAt) {
                var joined = new Date(profile.createdAt);
                accountJoined.textContent = joined.toLocaleString("en-GB", { month: "long", year: "numeric" });
            } else if (profile.memberSince) {
                accountJoined.textContent = profile.memberSince;
            } else {
                accountJoined.textContent = "—";
            }
        }

        // Avatar: show image if available, otherwise show placeholder icon
        if (profileAvatar) {
            if (profile.avatar) {
                profileAvatar.src = profile.avatar;
                profileAvatar.style.display = "block";
                if (emptyAvatar) emptyAvatar.style.display = "none";
            } else {
                profileAvatar.src = "";
                profileAvatar.style.display = "none";
                if (emptyAvatar) emptyAvatar.style.display = "flex";
            }
        }
    }

    // =========================================
    // LOAD PROFILE INTO EDIT FORM
    // =========================================

    function loadProfileIntoForm() {
        if (editName)  editName.value  = profile.name  || "";
        if (editPhone) editPhone.value = profile.phone || "";
        if (editEmail) editEmail.value = profile.email || "";
        if (editGroup) editGroup.value = profile.group || "";
    }

    // =========================================
    // INITIALIZE
    // =========================================

    displayProfile();
    loadProfileIntoForm();

    // =========================================
    // SAVE PROFILE
    // =========================================

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const updatedName  = editName  ? editName.value.trim()  : "";
            const updatedPhone = editPhone ? editPhone.value.trim() : "";
            const updatedEmail = editEmail ? editEmail.value.trim() : "";

            if (!updatedName || !updatedPhone || !updatedEmail) {
                showProfileAlert("Please fill in all required fields.", "danger");
                return;
            }

            // Update profile object
            profile.name  = updatedName;
            profile.phone = updatedPhone;
            profile.email = updatedEmail;

            // Save back to localStorage under the same "user" key
            localStorage.setItem("user", JSON.stringify(profile));

            displayProfile();

            showProfileAlert("Profile updated successfully!", "success");

            // Go back to Profile Overview tab
            const overviewTab = document.querySelector('[data-bs-target="#profile-overview"]');
            if (overviewTab) {
                new bootstrap.Tab(overviewTab).show();
            }
        });
    }

    // =========================================
    // AVATAR UPLOAD PREVIEW
    // =========================================

    const avatarInput   = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");

    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                showProfileAlert("Image must be less than 2MB.", "danger");
                avatarInput.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                avatarPreview.src = e.target.result;

                if (profileAvatar) {
                    profileAvatar.src = e.target.result;
                    profileAvatar.style.display = "block";
                    if (emptyAvatar) emptyAvatar.style.display = "none";
                }

                profile.avatar = e.target.result;
                localStorage.setItem("user", JSON.stringify(profile));

                showProfileAlert("Profile photo updated.", "success");
            };
            reader.readAsDataURL(file);
        });
    }

});


// =========================================
// PROFILE — BOOTSTRAP ALERT HELPER
// =========================================

function showProfileAlert(message, type) {
    const el = document.getElementById("profileAlert");
    if (!el) return;

    const map = {
        success: { cls: "alert-success", icon: "bi-check-circle-fill" },
        danger:  { cls: "alert-danger",  icon: "bi-exclamation-circle-fill" },
        warning: { cls: "alert-warning", icon: "bi-exclamation-triangle-fill" }
    };
    const cfg = map[type] || map.danger;

    el.className = "alert " + cfg.cls + " d-flex align-items-center gap-2 mb-3";
    el.innerHTML =
        '<i class="bi ' + cfg.icon + ' flex-shrink-0"></i>' +
        '<span>' + message + '</span>';
    el.classList.remove("d-none");

    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function () {
        el.classList.add("d-none");
    }, 4000);
}
