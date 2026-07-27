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

    // Strip the timestamp suffix from the raw memberId for display
    // Raw format: "AJO-001-1722000000000"  →  display: "AJO-001"
    function memberIdDisplay(rawId) {
        if (!rawId) return "—";
        const parts = rawId.split("-");
        return parts.slice(0, 2).join("-");
    }

    // If this user has no memberId (registered before the feature was added),
    // generate one now by checking all accounts for the highest sequence,
    // then save it back so it persists on every future visit.
    if (!profile.memberId) {
        var allAccounts = [];
        try { allAccounts = JSON.parse(localStorage.getItem("accounts")) || []; } catch (e) {}

        var maxSeq = 0;
        allAccounts.forEach(function (a) {
            if (a.memberId) {
                var parts = a.memberId.split("-");
                var seq = parseInt(parts[1], 10);
                if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
            }
        });

        var next   = maxSeq + 1;
        var padded = String(next).padStart(3, "0");
        profile.memberId = "AJO-" + padded + "-" + Date.now();

        // Persist to session user
        localStorage.setItem("user", JSON.stringify(profile));

        // Also update the matching entry in the accounts array
        var updatedAccounts = allAccounts.map(function (a) {
            if (a.email && profile.email && a.email.toLowerCase() === profile.email.toLowerCase()) {
                a.memberId = profile.memberId;
            }
            return a;
        });
        localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
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

    // Account tab elements
    const accountMemberId = document.getElementById("accountMemberId");
    const accountJoined   = document.getElementById("accountJoined");

    // =========================================
    // EDIT FORM ELEMENTS
    // =========================================

    const editProfileForm = document.getElementById("editProfileForm");
    const editName        = document.getElementById("editName");
    const editPhone       = document.getElementById("editPhone");
    const editEmail       = document.getElementById("editEmail");

    // =========================================
    // DISPLAY PROFILE
    // =========================================

    function displayProfile() {

        if (profileName)        profileName.textContent        = profile.name        || "—";
        if (profileNameDetail)  profileNameDetail.textContent  = profile.name        || "—";
        if (profilePhone)       profilePhone.textContent       = profile.phone       || "—";
        if (profileEmail)       profileEmail.textContent       = profile.email       || "—";
        if (profileMemberId)    profileMemberId.textContent    = memberIdDisplay(profile.memberId);
        if (profileMemberSince) profileMemberSince.textContent = profile.memberSince || "—";
        if (profileRole)        profileRole.textContent        = profile.role        || "Savings Member";

        // Account tab
        if (accountMemberId) accountMemberId.textContent = memberIdDisplay(profile.memberId);
        if (accountJoined)   accountJoined.textContent   = profile.memberSince || "—";

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
