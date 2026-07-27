document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // USER KEY HELPER (matches dashboard/payments)
    // =========================================

    function userKey(base) {
        try {
            var u = JSON.parse(localStorage.getItem("user")) || {};
            var email = (u.email || "").toLowerCase().trim();
            return email ? base + "_" + email : base;
        } catch (e) { return base; }
    }


    // =========================================
    // POPULATE ACCOUNT INFORMATION TAB
    // =========================================

    function loadAccountInfo() {
        var user = getSessionUser();

        // Strip timestamp suffix from raw memberId for display
        function fmtId(raw) {
            if (!raw) return "—";
            var parts = raw.split("-");
            return parts.slice(0, 2).join("-");
        }

        var elName        = document.getElementById("settingsName");
        var elEmail       = document.getElementById("settingsEmail");
        var elMemberId    = document.getElementById("settingsMemberId");
        var elMemberSince = document.getElementById("settingsMemberSince");

        if (elName)        elName.value        = user.name        || "—";
        if (elEmail)       elEmail.value       = user.email       || "—";
        if (elMemberId)    elMemberId.value    = fmtId(user.memberId);
        if (elMemberSince) elMemberSince.value = user.memberSince || "—";
    }

    loadAccountInfo();

    // =========================================
    // SIDEBAR TOGGLE
    // =========================================

    const sidebar      = document.querySelector(".settings-sidebar");
    const toggleButton = document.getElementById("settingsSidebarToggle");
    const overlay      = document.getElementById("settingsOverlay");

    toggleButton.addEventListener("click", function () {
        sidebar.classList.add("show");
        overlay.classList.add("show");
    });

    overlay.addEventListener("click", function () {
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
    });

    document.querySelectorAll(".settings-menu .nav-link").forEach(function (item) {
        item.addEventListener("click", function () {
            if (window.innerWidth <= 991) {
                sidebar.classList.remove("show");
                overlay.classList.remove("show");
            }
        });
    });


    // =========================================
    // LOGOUT
    // =========================================

    const logoutBtn = document.querySelector("#logout .btn-danger");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            showConfirmModal(
                "Are you sure you want to log out?",
                function () {
                    localStorage.removeItem("user");
                    window.location.href = "../login.html";
                }
            );
        });
    }


    // =========================================
    // EXPORT CONTRIBUTION HISTORY AS CSV
    // =========================================

    const exportBtn = document.getElementById("exportHistoryBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", function () {

            var contribData = { goal: 0, history: [] };
            try {
                contribData = JSON.parse(localStorage.getItem(userKey("contribData"))) || contribData;
            } catch (e) {}

            if (!contribData.history || !contribData.history.length) {
                showConfirmModal(
                    "No contribution history to export yet.",
                    function () {}
                );
                // Replace modal with a simple alert-style notice since there's nothing to confirm
                var msgEl = document.getElementById("confirmModalMessage");
                var okBtn = document.getElementById("confirmModalOk");
                var cancelBtn = document.getElementById("confirmModalCancel");
                if (msgEl) msgEl.textContent = "No contribution history to export yet.";
                if (okBtn)     okBtn.textContent     = "OK";
                if (cancelBtn) cancelBtn.style.display = "none";
                return;
            }

            // Build CSV rows
            var rows = [
                ["Type", "Amount (₦)", "Note", "Date", "Time", "Balance After (₦)"]
            ];

            contribData.history.forEach(function (entry) {
                var dt      = new Date(entry.date);
                var dateStr = dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                var timeStr = dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                var type    = entry.type === "contribute" ? "Contribution" : "Withdrawal";
                var note    = (entry.note || "").replace(/,/g, " ");  // escape commas

                rows.push([
                    type,
                    entry.amount,
                    note,
                    dateStr,
                    timeStr,
                    entry.balanceAfter
                ]);
            });

            var csv     = rows.map(function (r) { return r.join(","); }).join("\n");
            var blob    = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            var url     = URL.createObjectURL(blob);
            var user    = getSessionUser();
            var name    = (user.name || "user").replace(/\s+/g, "_").toLowerCase();
            var today   = new Date().toISOString().slice(0, 10);
            var filename = "contribution_history_" + name + "_" + today + ".csv";

            var a = document.createElement("a");
            a.href     = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }


    // =========================================
    // NOTIFICATIONS — SAVE / LOAD PREFS
    // Stored under notifPrefs_<email> so each
    // user keeps their own preferences.
    // =========================================

    function getNotifPrefs() {
        try {
            return JSON.parse(localStorage.getItem(userKey("notifPrefs"))) || {
                paymentDue:      true,
                contribution:    true,
                paymentRecorded: true,
                goalReached:     true,
                daysBefore:      7
            };
        } catch (e) {
            return { paymentDue: true, contribution: true, paymentRecorded: true, goalReached: true, daysBefore: 7 };
        }
    }

    function loadNotifPrefs() {
        var prefs = getNotifPrefs();
        var elDue      = document.getElementById("notifPaymentDue");
        var elContrib  = document.getElementById("notifContribution");
        var elRecorded = document.getElementById("notifPaymentRecorded");
        var elGoal     = document.getElementById("notifGoalReached");
        var elDays     = document.getElementById("notifDaysBefore");
        if (elDue)      elDue.checked      = prefs.paymentDue;
        if (elContrib)  elContrib.checked  = prefs.contribution;
        if (elRecorded) elRecorded.checked = prefs.paymentRecorded;
        if (elGoal)     elGoal.checked     = prefs.goalReached;
        if (elDays)     elDays.value       = String(prefs.daysBefore);
    }

    function showNotifAlert(message, type) {
        var el = document.getElementById("notifAlert");
        if (!el) return;
        var map = {
            success: { cls: "alert-success", icon: "bi-check-circle-fill" },
            danger:  { cls: "alert-danger",  icon: "bi-exclamation-circle-fill" }
        };
        var cfg = map[type] || map.success;
        el.className = "alert " + cfg.cls + " d-flex align-items-center gap-2 mb-4";
        el.innerHTML = '<i class="bi ' + cfg.icon + ' flex-shrink-0"></i><span>' + message + '</span>';
        el.classList.remove("d-none");
        clearTimeout(el._t);
        el._t = setTimeout(function () { el.classList.add("d-none"); }, 3500);
    }

    // Load prefs immediately and re-load when tab is shown
    loadNotifPrefs();
    var notifTabBtn = document.querySelector('[data-bs-target="#notifications"]');
    if (notifTabBtn) {
        notifTabBtn.addEventListener("shown.bs.tab", loadNotifPrefs);
    }

    // Save button
    var saveNotifBtn = document.getElementById("saveNotifBtn");
    if (saveNotifBtn) {
        saveNotifBtn.addEventListener("click", function () {
            var prefs = {
                paymentDue:      !!(document.getElementById("notifPaymentDue")      && document.getElementById("notifPaymentDue").checked),
                contribution:    !!(document.getElementById("notifContribution")    && document.getElementById("notifContribution").checked),
                paymentRecorded: !!(document.getElementById("notifPaymentRecorded") && document.getElementById("notifPaymentRecorded").checked),
                goalReached:     !!(document.getElementById("notifGoalReached")     && document.getElementById("notifGoalReached").checked),
                daysBefore:      document.getElementById("notifDaysBefore") ? parseInt(document.getElementById("notifDaysBefore").value, 10) : 7
            };
            localStorage.setItem(userKey("notifPrefs"), JSON.stringify(prefs));
            showNotifAlert("Notification preferences saved.", "success");
        });
    }


    // =========================================
    // PASSWORD VISIBILITY TOGGLES
    // =========================================

    document.querySelectorAll(".pwd-toggle").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const input = document.getElementById(btn.dataset.target);
            const icon  = document.getElementById(btn.dataset.icon);
            if (!input || !icon) return;
            const show = input.type === "password";
            input.type      = show ? "text" : "password";
            icon.className  = show ? "bi bi-eye-slash" : "bi bi-eye";
        });
    });


    // =========================================
    // PASSWORD STRENGTH METER
    // =========================================

    const newPasswordInput = document.getElementById("newPassword");
    const bars = [
        document.getElementById("pwdBar1"),
        document.getElementById("pwdBar2"),
        document.getElementById("pwdBar3"),
        document.getElementById("pwdBar4")
    ];
    const strengthLabel = document.getElementById("pwdStrengthLabel");

    function getStrength(pw) {
        let score = 0;
        if (pw.length >= 8)                score++;
        if (/[A-Z]/.test(pw))              score++;
        if (/[0-9]/.test(pw))              score++;
        if (/[^A-Za-z0-9]/.test(pw))       score++;
        return score;
    }

    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", function () {
            const score  = getStrength(this.value);
            const levels = ["", "weak", "fair", "strong", "strong"];
            const labels = ["", "Weak", "Fair", "Strong", "Very strong"];

            bars.forEach(function (bar, i) {
                bar.className = "pwd-bar" + (i < score ? " " + levels[score] : "");
            });
            if (strengthLabel) {
                strengthLabel.textContent = this.value ? labels[score] : "";
            }
        });
    }


    // =========================================
    // CHANGE PASSWORD FORM
    // =========================================

    const changePasswordForm = document.getElementById("changePasswordForm");
    const passwordAlert      = document.getElementById("passwordAlert");

    function showPasswordAlert(message, type) {
        // Map to Bootstrap alert variants
        const map = {
            success: { cls: "alert-success", icon: "bi-check-circle-fill" },
            danger:  { cls: "alert-danger",  icon: "bi-exclamation-circle-fill" },
            warning: { cls: "alert-warning", icon: "bi-exclamation-triangle-fill" }
        };
        const cfg = map[type] || map.danger;

        passwordAlert.className = "alert " + cfg.cls + " d-flex align-items-center gap-2";
        passwordAlert.innerHTML =
            '<i class="bi ' + cfg.icon + ' flex-shrink-0"></i>' +
            '<span>' + message + '</span>';
        passwordAlert.classList.remove("d-none");
        passwordAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hidePasswordAlert() {
        passwordAlert.classList.add("d-none");
        passwordAlert.className = "alert d-none";
    }

    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", function (e) {
            e.preventDefault();
            hidePasswordAlert();

            const currentPwd = document.getElementById("currentPassword").value;
            const newPwd     = document.getElementById("newPassword").value;
            const confirmPwd = document.getElementById("confirmNewPassword").value;

            // ---- Validate fields ----
            if (!currentPwd) {
                showPasswordAlert("Please enter your current password.", "danger");
                document.getElementById("currentPassword").focus();
                return;
            }

            if (newPwd.length < 8) {
                showPasswordAlert("New password must be at least 8 characters.", "danger");
                document.getElementById("newPassword").focus();
                return;
            }

            if (newPwd !== confirmPwd) {
                showPasswordAlert("New passwords do not match.", "danger");
                document.getElementById("confirmNewPassword").focus();
                return;
            }

            if (newPwd === currentPwd) {
                showPasswordAlert("New password must be different from your current password.", "danger");
                document.getElementById("newPassword").focus();
                return;
            }

            // ---- Verify current password against stored account ----
            const sessionUser = getSessionUser();
            const accounts    = getAccounts();

            // Find the matching account by email
            const accountIndex = accounts.findIndex(function (a) {
                return a.email.toLowerCase() === (sessionUser.email || "").toLowerCase();
            });

            // Demo account — no stored password in accounts list, so skip the check
            // and just show a "not applicable" message
            if (accountIndex === -1) {
                showPasswordAlert(
                    "Password changes are not available for the demo account.",
                    "danger"
                );
                return;
            }

            if (accounts[accountIndex].password !== currentPwd) {
                showPasswordAlert("Current password is incorrect.", "danger");
                document.getElementById("currentPassword").focus();
                return;
            }

            // ---- Update password ----
            accounts[accountIndex].password = newPwd;
            localStorage.setItem("accounts", JSON.stringify(accounts));

            // ---- Clear fields ----
            changePasswordForm.reset();
            bars.forEach(function (bar) { bar.className = "pwd-bar"; });
            if (strengthLabel) strengthLabel.textContent = "";

            showPasswordAlert("Password updated successfully.", "success");
        });
    }


    // =========================================
    // HELPERS
    // =========================================

    function getSessionUser() {
        try { return JSON.parse(localStorage.getItem("user")) || {}; } catch (e) { return {}; }
    }

    function getAccounts() {
        try { return JSON.parse(localStorage.getItem("accounts")) || []; } catch (e) { return []; }
    }

});


// =========================================
// BOOTSTRAP CONFIRM MODAL HELPER
// Reuses #confirmModal already in settings.html
// =========================================

function showConfirmModal(message, onConfirm) {
    const modalEl = document.getElementById("confirmModal");
    const msgEl   = document.getElementById("confirmModalMessage");
    const okBtn   = document.getElementById("confirmModalOk");
    if (!modalEl || !msgEl || !okBtn) {
        if (window.confirm(message)) onConfirm();
        return;
    }

    msgEl.textContent = message;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    const newOk = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    newOk.addEventListener("click", function () {
        modal.hide();
        onConfirm();
    });

    modal.show();
}
