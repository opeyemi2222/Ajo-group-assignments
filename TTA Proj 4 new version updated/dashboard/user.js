// =========================================
// UTILITY HELPERS
// =========================================

function getStoredUser() {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch (e) { return {}; }
}

// Returns a localStorage key scoped to the current user's email.
// e.g. userKey("contribData") → "contribData_john@example.com"
// Falls back to the plain key so the page still works if somehow
// no user session exists (edge case / dev testing).
function userKey(base) {
    var u = getStoredUser();
    var email = (u.email || "").toLowerCase().trim();
    return email ? base + "_" + email : base;
}

function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "AO";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatUserDate(value) {
    if (!value) return "Not selected";
    return new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric"
    });
}

function formatShortDate(value) {
    if (!value) return "Not specified";
    return new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

// =========================================
// OPEN TAB
// Used by inline onclick and hash routing.
// Also closes the mobile sidebar if open,
// and scrolls the content area to the top.
// =========================================

function openTab(tabId) {
    // Find the sidebar/nav button for this tab
    const tabButton = document.querySelector('[data-bs-target="#' + tabId + '"]');
    if (!tabButton) return;

    // Activate the Bootstrap pill tab
    new bootstrap.Tab(tabButton).show();

    // Close mobile sidebar if it's open
    const sidebar = document.getElementById("dashboardSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar && overlay) {
        setTimeout(function () {
            sidebar.classList.remove("show");
            overlay.classList.remove("show");
        }, 150);
    }

    // Scroll main content back to top smoothly
    const main = document.querySelector(".dashboard-main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// =========================================
// TABLE SEARCH
// =========================================

function setupTableSearch(searchInputId, tableId) {
    const searchInput = document.getElementById(searchInputId);
    const table       = document.getElementById(tableId);
    if (!searchInput || !table) return;

    const tbody = table.querySelector("tbody");

    searchInput.addEventListener("input", function () {
        const term = this.value.toLowerCase().trim();
        let visible = 0;

        tbody.querySelectorAll("tr:not(.no-search-results)").forEach(function (row) {
            const match = row.textContent.toLowerCase().includes(term);
            row.style.display = match ? "" : "none";
            if (match) visible++;
        });

        const existing = tbody.querySelector(".no-search-results");
        if (existing) existing.remove();

        if (visible === 0) {
            const colCount = table.querySelectorAll("thead th").length || 4;
            const noRow = document.createElement("tr");
            noRow.className = "no-search-results";
            noRow.innerHTML = `<td colspan="${colCount}" class="text-center py-4">
                <i class="bi bi-search fs-4 d-block mb-2"></i>
                No matching records found.
            </td>`;
            tbody.appendChild(noRow);
        }
    });
}

// =========================================
// LOAD USER INTO DASHBOARD
// =========================================

function loadDashboardUser() {
    const user      = getStoredUser();
    const name      = user.name || user.fullName || "Akin John Ojo";
    const initials  = getInitials(name);
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || name;

    // Name display
    const dashboardUserName = document.getElementById("dashboardUserName");
    if (dashboardUserName) dashboardUserName.textContent = name;

    // Welcome message
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome back, ${firstName}! Here's an overview of your savings.`;
    }

    // Avatars — show image if stored, otherwise initials
    ["mobileUserAvatar", "mobileHeaderAvatar"].forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (user.avatar || user.image) {
            el.innerHTML = `<img src="${user.avatar || user.image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            el.textContent = initials;
        }
    });

    // Mobile header name
    const mobileHeaderName = document.getElementById("mobileHeaderName");
    if (mobileHeaderName) mobileHeaderName.textContent = firstName;

    // Header profile strong tag
    const profileStrong = document.querySelector(".user-profile strong");
    if (profileStrong) profileStrong.textContent = name;
}

// =========================================
// LOAD PAYMENT SCHEDULE TABLE
// =========================================

function loadPaymentScheduleTable() {
    const tbody = document.getElementById("paymentScheduleTableBody");
    if (!tbody) return;

    let payments = [];
    try { payments = JSON.parse(localStorage.getItem(userKey("scheduledPayments"))) || []; } catch (e) {}

    tbody.innerHTML = "";

    if (!payments.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">
            <i class="bi bi-calendar-x fs-3 d-block mb-2"></i>
            No scheduled payments yet.
        </td></tr>`;
        return;
    }

    payments.forEach(function (payment) {
        const status = payment.status || "Upcoming";
        const note   = payment.note
            ? `<small class="d-block text-muted">${payment.note}</small>`
            : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${payment.payment || "Scheduled Contribution"}</strong>${note}</td>
            <td>₦${Number(payment.amount || 0).toLocaleString("en-NG")}</td>
            <td>${formatUserDate(payment.date)}</td>
            <td><span class="status ${status.toLowerCase()}">${status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================
// LOAD MY PAYMENTS TABLE
// Only shows Pending and Completed entries
// =========================================

function loadMyPaymentsTable() {
    const tbody      = document.getElementById("myPaymentsTableBody");
    const emptyState = document.getElementById("myPaymentsEmpty");
    if (!tbody) return;

    let payments = [];
    try { payments = JSON.parse(localStorage.getItem(userKey("scheduledPayments"))) || []; } catch (e) {}

    // Only show Pending and Completed
    const visible = payments.filter(function (p) {
        return p.status === "Pending" || p.status === "Completed";
    });

    tbody.innerHTML = "";

    if (!visible.length) {
        if (emptyState) emptyState.classList.remove("d-none");
        return;
    }

    if (emptyState) emptyState.classList.add("d-none");

    visible.forEach(function (payment) {
        const status     = payment.status;
        const statusClass = status === "Completed" ? "active" : "pending";
        const date       = payment.paidAt
            ? formatUserDate(payment.paidAt.slice(0, 10))   // use paid date if available
            : formatUserDate(payment.date);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${payment.payment || "Scheduled Contribution"}</strong></td>
            <td><small class="text-muted">${payment.id || "—"}</small></td>
            <td><strong>₦${Number(payment.amount || 0).toLocaleString("en-NG")}</strong></td>
            <td>${date}</td>
            <td><span class="status ${statusClass}">${status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================
// MAIN DOMContentLoaded
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // Populate user data
    loadDashboardUser();

    // Populate dashboard overview (stat cards, chart, recent contribs, upcoming payment)
    loadDashboardOverview();

    // Populate payment schedule tab
    loadPaymentScheduleTable();

    // Populate my payments tab
    loadMyPaymentsTable();

    // Wire up table search (payments tab only — contributions tab no longer uses a search table)
    setupTableSearch("paymentSearch", "paymentTable");

    // ===== CONTRIBUTIONS =====
    initContributions();

    // ===== REFRESH TABLES WHEN TAB IS SHOWN =====
    // Ensures data is always current when navigating back to these tabs
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(function (tabBtn) {
        tabBtn.addEventListener("shown.bs.tab", function (e) {
            const target = e.target.getAttribute("data-bs-target");
            if (target === "#schedule")      loadPaymentScheduleTable();
            if (target === "#payments")      loadMyPaymentsTable();
            if (target === "#contributions") renderContribTab();
            if (target === "#savings")       loadMySavingsTab();
            if (target === "#dashboard")     loadDashboardOverview();
        });
    });

    // ===== SIDEBAR =====
    const sidebar    = document.getElementById("dashboardSidebar");
    const menuButton = document.getElementById("dashboardMenuBtn");
    const overlay    = document.getElementById("sidebarOverlay");

    if (menuButton && sidebar && overlay) {
        menuButton.addEventListener("click", function () {
            sidebar.classList.add("show");
            overlay.classList.add("show");
        });

        overlay.addEventListener("click", function () {
            sidebar.classList.remove("show");
            overlay.classList.remove("show");
        });
    }

    // Close sidebar when a nav tab is clicked on mobile
    // Delay the close slightly so Bootstrap can activate the tab first
    document.querySelectorAll(".dashboard-tabs .nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 991 && sidebar && overlay) {
                setTimeout(function () {
                    sidebar.classList.remove("show");
                    overlay.classList.remove("show");
                }, 150);
            }
        });
    });

    // ===== LOGOUT =====
    const logoutBtn = document.getElementById("logoutBtn");
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

    // ===== HASH-BASED TAB ROUTING =====
    const hash = window.location.hash.replace("#", "");
    if (hash) {
        setTimeout(function () { openTab(hash); }, 100);
    }

});


// =========================================
// CONTRIBUTIONS — STORAGE HELPERS
// =========================================

function getContribData() {
    try {
        return JSON.parse(localStorage.getItem(userKey("contribData"))) || {
            goal: 0,
            history: []   // { id, type:"contribute"|"withdraw", amount, note, date, balanceAfter }
        };
    } catch (e) {
        return { goal: 0, history: [] };
    }
}

function saveContribData(data) {
    localStorage.setItem(userKey("contribData"), JSON.stringify(data));
}

function getContribBalance(data) {
    return data.history.reduce(function (bal, entry) {
        return entry.type === "contribute"
            ? bal + entry.amount
            : bal - entry.amount;
    }, 0);
}


// =========================================
// CONTRIBUTIONS — PROGRESS BAR
// =========================================

function renderContribProgress(data) {
    const goal    = data.goal || 0;
    const balance = Math.max(0, getContribBalance(data));
    const pct     = goal > 0 ? Math.min(100, Math.round((balance / goal) * 100)) : 0;

    const fill    = document.getElementById("contribProgressFill");
    const pctEl   = document.getElementById("contribProgressPct");
    const label   = document.getElementById("contribProgressLabel");
    const saved   = document.getElementById("contribSavedAmt");
    const goalEl  = document.getElementById("contribGoalAmt");
    const section = document.getElementById("contribProgressSection");

    if (!fill) return;

    // Colour level
    fill.className = "contrib-progress-fill";
    if (pct >= 100)     fill.classList.add("done");
    else if (pct >= 75) fill.classList.add("great");
    else if (pct >= 50) fill.classList.add("good");
    else if (pct >= 25) fill.classList.add("fair");

    fill.style.width = pct + "%";
    if (pctEl)  pctEl.textContent  = pct + "%";
    if (saved)  saved.textContent  = "₦" + balance.toLocaleString("en-NG");
    if (goalEl) goalEl.textContent = "₦" + goal.toLocaleString("en-NG");

    if (label) {
        label.textContent = pct >= 100
            ? "🎉 Goal reached!"
            : "Progress toward goal";
    }

    // ---- Goal Reached — smart banner ----
    // Always remove and re-render so content stays accurate on every render call
    const existingBanner = document.getElementById("goalReachedBanner");
    if (existingBanner) existingBanner.remove();

    if (pct >= 100 && goal > 0 && section) {

        const fullyWithdrawn = balance === 0;

        const banner = document.createElement("div");
        banner.id = "goalReachedBanner";

        if (fullyWithdrawn) {
            // Balance is zero — all money has been withdrawn, clean slate ready
            banner.className = "alert alert-success d-flex align-items-start justify-content-between gap-3 mt-3 mb-0 flex-wrap";
            banner.innerHTML =
                '<div class="d-flex align-items-start gap-2">' +
                    '<i class="bi bi-trophy-fill flex-shrink-0 mt-1"></i>' +
                    '<div>' +
                        '<strong>Goal reached & funds withdrawn!</strong>' +
                        '<div style="font-size:13px;margin-top:3px;">' +
                            'Your ₦' + goal.toLocaleString("en-NG") + ' goal is complete and your balance is clear. ' +
                            'Start a new savings cycle by setting a new goal.' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<button type="button" id="resetGoalBtn" class="btn btn-success btn-sm flex-shrink-0">' +
                    '<i class="bi bi-arrow-clockwise me-1"></i>Start New Cycle' +
                '</button>';
        } else {
            // Balance still has money — prompt to withdraw first or skip
            banner.className = "alert alert-warning d-flex align-items-start justify-content-between gap-3 mt-3 mb-0 flex-wrap";
            banner.innerHTML =
                '<div class="d-flex align-items-start gap-2">' +
                    '<i class="bi bi-trophy-fill flex-shrink-0 mt-1"></i>' +
                    '<div>' +
                        '<strong>🎉 Goal of ₦' + goal.toLocaleString("en-NG") + ' reached!</strong>' +
                        '<div style="font-size:13px;margin-top:3px;">' +
                            'You still have <strong>₦' + balance.toLocaleString("en-NG") + '</strong> in your balance. ' +
                            'You can withdraw it first, or start a new cycle now — ' +
                            'your existing balance will carry over.' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="d-flex flex-column gap-2 flex-shrink-0">' +
                    '<button type="button" id="resetGoalBtn" class="btn btn-warning btn-sm">' +
                        '<i class="bi bi-arrow-clockwise me-1"></i>Start New Cycle' +
                    '</button>' +
                    '<small class="text-muted text-center" style="font-size:11px;">Balance carries over</small>' +
                '</div>';
        }

        section.appendChild(banner);

        // Wire up reset — only clears the goal, history is NEVER deleted
        document.getElementById("resetGoalBtn").addEventListener("click", function () {
            const confirmMsg = fullyWithdrawn
                ? "Start a new savings cycle? Your activity history will be kept."
                : "Start a new savings cycle? Your current balance of ₦" +
                  balance.toLocaleString("en-NG") + " will carry over and your history will be kept.";

            showConfirmModal(confirmMsg, function () {
                const d = getContribData();
                d.goal = 0;           // reset goal only — history stays intact
                saveContribData(d);

                // Clear goal input so user types a fresh amount
                const goalInput = document.getElementById("goalAmountInput");
                if (goalInput) goalInput.value = "";

                renderContribTab();

                const msg = fullyWithdrawn
                    ? "New cycle started! Set a new goal to begin saving."
                    : "New cycle started! Your ₦" + balance.toLocaleString("en-NG") +
                      " balance has carried over. Set a new goal to continue.";
                showContribAlert(msg, "success");
            });
        });
    }

    // Sync goal input field to current saved goal (only if not already typed)
    const goalInput = document.getElementById("goalAmountInput");
    if (goalInput && goal > 0 && !goalInput.value) {
        goalInput.value = goal;
    }
}


// =========================================
// CONTRIBUTIONS — STATS ROW
// =========================================

function renderContribStats(data) {
    const totalContrib   = data.history
        .filter(function (e) { return e.type === "contribute"; })
        .reduce(function (s, e) { return s + e.amount; }, 0);

    const totalWithdrawn = data.history
        .filter(function (e) { return e.type === "withdraw"; })
        .reduce(function (s, e) { return s + e.amount; }, 0);

    const net = totalContrib - totalWithdrawn;

    const elC = document.getElementById("statTotalContrib");
    const elW = document.getElementById("statTotalWithdrawn");
    const elN = document.getElementById("statNetBalance");

    if (elC) elC.textContent = "₦" + totalContrib.toLocaleString("en-NG");
    if (elW) elW.textContent = "₦" + totalWithdrawn.toLocaleString("en-NG");

    if (elN) {
        elN.textContent = "₦" + Math.abs(net).toLocaleString("en-NG");
        elN.style.color = net >= 0 ? "#198754" : "#dc3545";
        if (net < 0) elN.textContent = "-₦" + Math.abs(net).toLocaleString("en-NG");
    }
}


// =========================================
// CONTRIBUTIONS — HISTORY TABLE
// =========================================

function renderContribHistory(data) {
    const tbody    = document.getElementById("contribHistoryBody");
    const emptyEl  = document.getElementById("contribHistoryEmpty");
    const tableEl  = document.getElementById("contribHistoryTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.history.length) {
        if (emptyEl)  emptyEl.classList.remove("d-none");
        if (tableEl)  tableEl.style.display = "none";
        return;
    }

    if (emptyEl)  emptyEl.classList.add("d-none");
    if (tableEl)  tableEl.style.display = "";

    // Show newest first
    const sorted = data.history.slice().reverse();

    sorted.forEach(function (entry) {
        const isContrib = entry.type === "contribute";

        const badgeClass = isContrib ? "contribute" : "withdraw";
        const badgeIcon  = isContrib ? "bi-arrow-up-circle-fill" : "bi-arrow-down-circle-fill";
        const badgeLabel = isContrib ? "Contribute" : "Withdraw";

        const amountText = (isContrib ? "+" : "−") +
            " ₦" + entry.amount.toLocaleString("en-NG");
        const amountColor = isContrib ? "#198754" : "#dc3545";

        const dateObj = new Date(entry.date);
        const dateStr = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
        });
        const timeStr = dateObj.toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit"
        });

        const balanceStr = "₦" + entry.balanceAfter.toLocaleString("en-NG");

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <span class="contrib-type-badge ${badgeClass}">
                    <i class="bi ${badgeIcon}"></i>
                    ${badgeLabel}
                </span>
            </td>
            <td>
                <strong style="color:${amountColor};">${amountText}</strong>
            </td>
            <td>
                <span class="text-muted" style="font-size:13px;">
                    ${entry.note || "—"}
                </span>
            </td>
            <td style="font-size:13px; white-space:nowrap;">
                ${dateStr}
                <small class="d-block text-muted">${timeStr}</small>
            </td>
            <td style="font-size:13px;">
                <strong>₦${entry.balanceAfter.toLocaleString("en-NG")}</strong>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// =========================================
// CONTRIBUTIONS — ALERT
// Uses Bootstrap alert classes
// =========================================

function showContribAlert(message, type) {
    const el = document.getElementById("contribAlert");
    if (!el) return;

    // Map internal type names to Bootstrap alert variants + icons
    const map = {
        success: { cls: "alert-success", icon: "bi-check-circle-fill" },
        error:   { cls: "alert-danger",  icon: "bi-exclamation-circle-fill" },
        warning: { cls: "alert-warning", icon: "bi-exclamation-triangle-fill" }
    };
    const cfg = map[type] || map.error;

    el.className = "alert " + cfg.cls + " d-flex align-items-center gap-2";
    el.innerHTML =
        '<i class="bi ' + cfg.icon + ' flex-shrink-0"></i>' +
        '<span>' + message + '</span>';
    el.classList.remove("d-none");

    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function () {
        el.classList.add("d-none");
    }, 3500);
}


// =========================================
// CONTRIBUTIONS — FULL RENDER
// =========================================

function renderContribTab() {
    const data = getContribData();
    renderContribProgress(data);
    renderContribStats(data);
    renderContribHistory(data);
}


// =========================================
// CONTRIBUTIONS — INIT (called on DOMContentLoaded)
// =========================================

function initContributions() {

    renderContribTab();

    // ---- Set Goal ----
    const setGoalBtn   = document.getElementById("setGoalBtn");
    const goalInput    = document.getElementById("goalAmountInput");

    if (setGoalBtn && goalInput) {
        // Pre-fill input with stored goal
        const stored = getContribData();
        if (stored.goal > 0) goalInput.value = stored.goal;

        setGoalBtn.addEventListener("click", function () {
            const val = parseFloat(goalInput.value);
            if (!val || val <= 0) {
                showContribAlert("Please enter a valid goal amount.", "error");
                goalInput.focus();
                return;
            }
            const data = getContribData();
            data.goal = val;
            saveContribData(data);
            renderContribProgress(data);
            showContribAlert(
                "Goal set to ₦" + val.toLocaleString("en-NG") + ".",
                "success"
            );
        });

        // Allow Enter key on goal input
        goalInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") setGoalBtn.click();
        });
    }


    // ---- Withdraw ----
    const withdrawBtn = document.getElementById("withdrawBtn");
    if (withdrawBtn) {
        withdrawBtn.addEventListener("click", function () {
            handleContribAction("withdraw");
        });
    }


    // ---- Clear History ----
    const clearBtn = document.getElementById("clearHistoryBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            showConfirmModal(
                "Clear all contribution history? This cannot be undone.",
                function () {
                    const data = getContribData();
                    data.history = [];
                    saveContribData(data);
                    renderContribTab();
                    showContribAlert("History cleared.", "warning");
                }
            );
        });
    }
}


// =========================================
// CONTRIBUTIONS — HANDLE ACTION
// Only withdrawals are triggered from this tab.
// Contributions come in automatically from
// markPaymentAsPaid in payments.js.
// =========================================

function handleContribAction(type) {
    if (type !== "withdraw") return;   // safety guard

    const amountInput = document.getElementById("contribAmountInput");
    const noteInput   = document.getElementById("contribNoteInput");

    if (!amountInput) return;

    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        showContribAlert("Please enter a valid withdrawal amount.", "error");
        amountInput.focus();
        return;
    }

    const data    = getContribData();
    const balance = getContribBalance(data);

    if (amount > balance) {
        showContribAlert(
            "Cannot withdraw ₦" + amount.toLocaleString("en-NG") +
            ". Your current balance is ₦" + balance.toLocaleString("en-NG") + ".",
            "error"
        );
        return;
    }

    const newBalance = balance - amount;

    const entry = {
        id:           "C-" + Date.now(),
        type:         "withdraw",
        amount:       amount,
        note:         noteInput ? noteInput.value.trim() : "",
        date:         new Date().toISOString(),
        balanceAfter: newBalance
    };

    data.history.push(entry);
    saveContribData(data);

    amountInput.value = "";
    if (noteInput) noteInput.value = "";

    renderContribTab();

    showContribAlert(
        "Withdrawal of ₦" + amount.toLocaleString("en-NG") + " recorded.",
        "warning"
    );
}


// =========================================
// DASHBOARD OVERVIEW
// Reads from contribData + scheduledPayments
// and populates all stat cards, the chart,
// the recent contributions list, and the
// upcoming payment block.
// =========================================

function loadDashboardOverview() {

    var data = getContribData();

    // ---- Totals ----
    var totalContrib = data.history
        .filter(function (e) { return e.type === "contribute"; })
        .reduce(function (s, e) { return s + e.amount; }, 0);

    var totalWithdrawn = data.history
        .filter(function (e) { return e.type === "withdraw"; })
        .reduce(function (s, e) { return s + e.amount; }, 0);

    var balance = Math.max(0, totalContrib - totalWithdrawn);
    var goal    = data.goal || 0;

    // ---- Stat Cards ----
    var elBal  = document.getElementById("overviewBalance");
    var elCont = document.getElementById("overviewContributions");
    var elWith = document.getElementById("overviewWithdrawn");
    var elGoal = document.getElementById("overviewGoal");

    if (elBal)  elBal.textContent  = "₦" + balance.toLocaleString("en-NG");
    if (elCont) elCont.textContent = "₦" + totalContrib.toLocaleString("en-NG");
    if (elWith) elWith.textContent = "₦" + totalWithdrawn.toLocaleString("en-NG");
    if (elGoal) elGoal.textContent = goal > 0 ? "₦" + goal.toLocaleString("en-NG") : "Not set";

    // ---- Chart — last 6 months of contributions ----
    var chartEl = document.getElementById("overviewChartBars");
    if (chartEl) {

        // Build a map: "YYYY-MM" → { contrib, withdraw }
        var monthMap = {};
        var now      = new Date();

        // Initialise the last 6 calendar months (oldest → newest)
        for (var i = 5; i >= 0; i--) {
            var d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
            var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
            monthMap[key] = { contrib: 0, withdraw: 0 };
        }

        // Accumulate history entries into the map
        data.history.forEach(function (entry) {
            var entryDate = new Date(entry.date);
            var entryKey  = entryDate.getFullYear() + "-" +
                            String(entryDate.getMonth() + 1).padStart(2, "0");
            if (monthMap[entryKey] !== undefined) {
                if (entry.type === "contribute") {
                    monthMap[entryKey].contrib += entry.amount;
                } else {
                    monthMap[entryKey].withdraw += entry.amount;
                }
            }
        });

        // Find the max value across all months for scaling
        var maxVal = 0;
        Object.keys(monthMap).forEach(function (k) {
            var v = Math.max(monthMap[k].contrib, monthMap[k].withdraw);
            if (v > maxVal) maxVal = v;
        });

        // Short month names
        var monthNames = ["Jan","Feb","Mar","Apr","May","Jun",
                          "Jul","Aug","Sep","Oct","Nov","Dec"];

        chartEl.innerHTML = "";

        Object.keys(monthMap).forEach(function (key) {
            var parts      = key.split("-");
            var monthIndex = parseInt(parts[1], 10) - 1;
            var label      = monthNames[monthIndex];

            var contribH  = maxVal > 0
                ? Math.round((monthMap[key].contrib  / maxVal) * 90) + 5
                : 5;
            var withdrawH = maxVal > 0
                ? Math.round((monthMap[key].withdraw / maxVal) * 90) + 5
                : 5;

            var contribTitle  = "Contributed: ₦" + monthMap[key].contrib.toLocaleString("en-NG");
            var withdrawTitle = "Withdrawn: ₦"   + monthMap[key].withdraw.toLocaleString("en-NG");

            var group = document.createElement("div");
            group.className = "bar-group";
            group.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;";

            group.innerHTML =
                '<div style="display:flex;align-items:flex-end;gap:3px;height:100%;">' +
                    '<div class="bar contribution-bar" title="' + contribTitle + '" ' +
                         'style="height:' + contribH + '%;flex:1;"></div>' +
                    (monthMap[key].withdraw > 0
                        ? '<div class="bar" title="' + withdrawTitle + '" ' +
                               'style="height:' + withdrawH + '%;flex:1;background:var(--purple,#7c3aed);opacity:.7;border-radius:4px 4px 0 0;"></div>'
                        : '') +
                '</div>' +
                '<span style="font-size:11px;color:var(--muted,#6b7280);margin-top:4px;">' + label + '</span>';

            chartEl.appendChild(group);
        });

        // Empty chart placeholder when no data exists
        if (maxVal === 0) {
            chartEl.innerHTML =
                '<div style="width:100%;text-align:center;color:var(--muted,#6b7280);font-size:13px;padding:40px 0;">' +
                    '<i class="bi bi-bar-chart" style="font-size:2rem;display:block;margin-bottom:8px;"></i>' +
                    'No contribution data yet.' +
                '</div>';
        }
    }

    // ---- Recent Contributions (last 4 entries) ----
    var listEl   = document.getElementById("recentContribList");
    var emptyEl  = document.getElementById("recentContribEmpty");

    if (listEl) {
        listEl.innerHTML = "";

        var contribs = data.history
            .filter(function (e) { return e.type === "contribute"; })
            .slice()
            .reverse()
            .slice(0, 4);

        if (!contribs.length) {
            if (emptyEl) emptyEl.classList.remove("d-none");
        } else {
            if (emptyEl) emptyEl.classList.add("d-none");

            contribs.forEach(function (entry) {
                var dateStr = new Date(entry.date).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                });

                var item = document.createElement("div");
                item.className = "contribution-item";
                item.innerHTML =
                    '<div class="member-avatar" style="background:var(--primary-light,#eaf2ff);color:var(--primary,#0b2d89);">' +
                        '<i class="bi bi-arrow-up-circle-fill"></i>' +
                    '</div>' +
                    '<div class="member-info">' +
                        '<strong>' + (entry.note || "Contribution") + '</strong>' +
                        '<small>' + dateStr + '</small>' +
                    '</div>' +
                    '<strong class="amount" style="color:#198754;">+₦' +
                        entry.amount.toLocaleString("en-NG") +
                    '</strong>';

                listEl.appendChild(item);
            });
        }
    }

    // ---- Upcoming Payment (nearest non-Completed scheduled payment) ----
    var payments = [];
    try { payments = JSON.parse(localStorage.getItem(userKey("scheduledPayments"))) || []; } catch (e) {}

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter to pending/upcoming payments with a future-or-today date, sort soonest first
    var upcoming = payments
        .filter(function (p) {
            if (p.status === "Completed") return false;
            if (!p.date) return false;
            var due = new Date(p.date + "T00:00:00");
            return due >= today;
        })
        .sort(function (a, b) {
            return new Date(a.date + "T00:00:00") - new Date(b.date + "T00:00:00");
        });

    var blockEl  = document.getElementById("upcomingPaymentBlock");
    var emptyUpEl = document.getElementById("upcomingPaymentEmpty");

    if (upcoming.length) {
        var next    = upcoming[0];
        var dueDate = new Date(next.date + "T00:00:00");

        var monthAbbr = dueDate.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
        var dayNum    = dueDate.getDate();
        var fullDate  = dueDate.toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });

        var elMonth  = document.getElementById("upcomingPaymentMonth");
        var elDay    = document.getElementById("upcomingPaymentDay");
        var elName   = document.getElementById("upcomingPaymentName");
        var elFull   = document.getElementById("upcomingPaymentFullDate");
        var elAmt    = document.getElementById("upcomingPaymentAmount");

        if (elMonth) elMonth.textContent = monthAbbr;
        if (elDay)   elDay.textContent   = dayNum;
        if (elName)  elName.textContent  = next.payment || "Next Contribution";
        if (elFull)  elFull.textContent  = fullDate;
        if (elAmt)   elAmt.textContent   = "₦" + Number(next.amount || 0).toLocaleString("en-NG");

        if (blockEl)   blockEl.classList.remove("d-none");
        if (emptyUpEl) emptyUpEl.classList.add("d-none");

    } else {
        if (blockEl)   blockEl.classList.add("d-none");
        if (emptyUpEl) emptyUpEl.classList.remove("d-none");
    }
}


// =========================================
// MY SAVINGS TAB
// Reads from contribData (goal + history)
// and renders stats, progress bar, and
// the full contribution/withdrawal history.
// =========================================

function loadMySavingsTab() {

    const data = getContribData();

    // ---- Totals ----
    const totalContrib = data.history
        .filter(function (e) { return e.type === "contribute"; })
        .reduce(function (s, e) { return s + e.amount; }, 0);

    const totalWithdrawn = data.history
        .filter(function (e) { return e.type === "withdraw"; })
        .reduce(function (s, e) { return s + e.amount; }, 0);

    const balance = totalContrib - totalWithdrawn;
    const goal    = data.goal || 0;

    // ---- Stat Cards ----
    var elC = document.getElementById("savingsTotalContrib");
    var elW = document.getElementById("savingsTotalWithdrawn");
    var elB = document.getElementById("savingsNetBalance");
    var elG = document.getElementById("savingsGoalStat");

    if (elC) elC.textContent = "₦" + totalContrib.toLocaleString("en-NG");
    if (elW) elW.textContent = "₦" + totalWithdrawn.toLocaleString("en-NG");
    if (elB) {
        elB.textContent = "₦" + Math.max(0, balance).toLocaleString("en-NG");
        elB.style.color = balance >= 0 ? "" : "#dc3545";
    }
    if (elG) elG.textContent = goal > 0 ? "₦" + goal.toLocaleString("en-NG") : "Not set";

    // ---- Progress Bar ----
    var fill        = document.getElementById("savingsProgressFill");
    var pctBadge    = document.getElementById("savingsGoalPctBadge");
    var savedEl     = document.getElementById("savingsProgressSaved");
    var goalEl      = document.getElementById("savingsProgressGoal");
    var msgEl       = document.getElementById("savingsProgressMsg");
    var noGoalEl    = document.getElementById("savingsNoGoalNotice");

    var pct = goal > 0 ? Math.min(100, Math.round((Math.max(0, balance) / goal) * 100)) : 0;

    if (fill) {
        fill.className = "contrib-progress-fill";
        if      (pct >= 100) fill.classList.add("done");
        else if (pct >= 75)  fill.classList.add("great");
        else if (pct >= 50)  fill.classList.add("good");
        else if (pct >= 25)  fill.classList.add("fair");
        fill.style.width = pct + "%";
    }

    if (pctBadge) {
        pctBadge.textContent = pct + "%";
        // Colour the badge to match progress
        pctBadge.className = "status";
        if      (pct >= 100) pctBadge.classList.add("active");
        else if (pct >= 50)  { pctBadge.style.background = "#eaf2ff"; pctBadge.style.color = "#0b2d89"; }
        else                 pctBadge.classList.add("pending");
        pctBadge.style.fontSize  = "13px";
        pctBadge.style.padding   = "6px 14px";
    }

    if (savedEl) savedEl.textContent = "₦" + Math.max(0, balance).toLocaleString("en-NG");
    if (goalEl)  goalEl.textContent  = goal > 0 ? "₦" + goal.toLocaleString("en-NG") : "—";

    if (msgEl) {
        if (pct >= 100)      msgEl.textContent = "🎉 Goal reached!";
        else if (goal <= 0)  msgEl.textContent = "";
        else {
            var remaining = goal - Math.max(0, balance);
            msgEl.textContent = "₦" + remaining.toLocaleString("en-NG") + " to go";
        }
    }

    if (noGoalEl) {
        if (goal <= 0) noGoalEl.classList.remove("d-none");
        else           noGoalEl.classList.add("d-none");
    }

    // ---- Full History Table ----
    var tbody    = document.getElementById("savingsHistoryBody");
    var emptyEl  = document.getElementById("savingsHistoryEmpty");
    var tableEl  = document.getElementById("savingsHistoryTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.history.length) {
        if (emptyEl) emptyEl.classList.remove("d-none");
        if (tableEl) tableEl.style.display = "none";
        return;
    }

    if (emptyEl) emptyEl.classList.add("d-none");
    if (tableEl) tableEl.style.display = "";

    // Newest first
    data.history.slice().reverse().forEach(function (entry) {

        var isContrib   = entry.type === "contribute";
        var badgeClass  = isContrib ? "contribute" : "withdraw";
        var badgeIcon   = isContrib ? "bi-arrow-up-circle-fill" : "bi-arrow-down-circle-fill";
        var badgeLabel  = isContrib ? "Contribution" : "Withdrawal";
        var amountSign  = isContrib ? "+" : "−";
        var amountColor = isContrib ? "#198754" : "#dc3545";

        var dateObj = new Date(entry.date);
        var dateStr = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        var timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

        var tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <span class="contrib-type-badge ${badgeClass}">
                    <i class="bi ${badgeIcon}"></i>
                    ${badgeLabel}
                </span>
            </td>
            <td>
                <strong style="color:${amountColor};">
                    ${amountSign} ₦${entry.amount.toLocaleString("en-NG")}
                </strong>
            </td>
            <td style="font-size:13px; color:var(--muted);">${entry.note || "—"}</td>
            <td style="font-size:13px; white-space:nowrap;">
                ${dateStr}
                <small class="d-block text-muted">${timeStr}</small>
            </td>
            <td style="font-size:13px;">
                <strong>₦${entry.balanceAfter.toLocaleString("en-NG")}</strong>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// =========================================
// BOOTSTRAP CONFIRM MODAL HELPER
// Reuses the #confirmModal already in user.html
// =========================================

function showConfirmModal(message, onConfirm) {
    const modalEl  = document.getElementById("confirmModal");
    const msgEl    = document.getElementById("confirmModalMessage");
    const okBtn    = document.getElementById("confirmModalOk");
    if (!modalEl || !msgEl || !okBtn) {
        // Fallback if modal is somehow missing
        if (window.confirm(message)) onConfirm();
        return;
    }

    msgEl.textContent = message;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    // Remove any previous listener to prevent stacking
    const newOk = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);

    newOk.addEventListener("click", function () {
        modal.hide();
        onConfirm();
    });

    modal.show();
}


// =========================================
// NOTIFICATION SYSTEM
// =========================================

// ---- Storage helpers ----

function getNotifPrefs() {
    var base = "notifPrefs";
    var key  = userKey(base);
    try {
        return JSON.parse(localStorage.getItem(key)) || {
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

function getStoredNotifs() {
    try {
        return JSON.parse(localStorage.getItem(userKey("notifList"))) || [];
    } catch (e) { return []; }
}

function saveNotifs(list) {
    localStorage.setItem(userKey("notifList"), JSON.stringify(list));
}

// ---- Add a notification (avoids exact duplicates on same day) ----

function addNotif(type, title, message) {
    var list  = getStoredNotifs();
    var today = new Date().toISOString().slice(0, 10);

    // Deduplicate: same type+title on the same calendar day = skip
    var duplicate = list.find(function (n) {
        return n.type === type &&
               n.title === title &&
               n.createdAt.slice(0, 10) === today;
    });
    if (duplicate) return;

    list.unshift({
        id:        "N-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        type:      type,       // "due" | "paid" | "contrib" | "goal" | "info"
        title:     title,
        message:   message,
        createdAt: new Date().toISOString(),
        read:      false
    });

    // Keep at most 50 notifications
    if (list.length > 50) list = list.slice(0, 50);

    saveNotifs(list);
}

// ---- Render the panel ----

function renderNotifPanel() {
    var list      = getStoredNotifs();
    var listEl    = document.getElementById("notifList");
    var emptyEl   = document.getElementById("notifEmpty");
    var badgeEl   = document.getElementById("notifBadge");

    if (!listEl) return;

    // Count unread
    var unread = list.filter(function (n) { return !n.read; }).length;

    if (badgeEl) {
        badgeEl.textContent  = unread > 9 ? "9+" : String(unread);
        badgeEl.style.display = unread > 0 ? "block" : "none";
    }

    // Clear existing items (keep empty placeholder)
    Array.from(listEl.querySelectorAll(".notif-item")).forEach(function (el) {
        el.remove();
    });

    if (!list.length) {
        if (emptyEl) emptyEl.style.display = "flex";
        return;
    }

    if (emptyEl) emptyEl.style.display = "none";

    var iconMap = {
        due:    { cls: "due",    icon: "bi-calendar-event-fill" },
        paid:   { cls: "paid",   icon: "bi-check-circle-fill"   },
        contrib:{ cls: "contrib",icon: "bi-cash-stack"          },
        goal:   { cls: "goal",   icon: "bi-trophy-fill"         },
        info:   { cls: "info",   icon: "bi-info-circle-fill"    }
    };

    list.forEach(function (notif) {
        var cfg      = iconMap[notif.type] || iconMap.info;
        var timeAgo  = formatTimeAgo(notif.createdAt);

        var item = document.createElement("div");
        item.className = "notif-item" + (notif.read ? "" : " unread");
        item.dataset.id = notif.id;

        item.innerHTML =
            '<div class="notif-item-icon ' + cfg.cls + '">' +
                '<i class="bi ' + cfg.icon + '"></i>' +
            '</div>' +
            '<div class="notif-item-body">' +
                '<p class="notif-item-title">' + escapeHtml(notif.title) + '</p>' +
                '<p class="notif-item-msg">'   + escapeHtml(notif.message) + '</p>' +
            '</div>' +
            '<span class="notif-item-time">' + timeAgo + '</span>';

        // Mark as read on click
        item.addEventListener("click", function () {
            markNotifRead(notif.id);
        });

        listEl.appendChild(item);
    });
}

// ---- Mark one notification as read ----

function markNotifRead(id) {
    var list = getStoredNotifs();
    list.forEach(function (n) {
        if (n.id === id) n.read = true;
    });
    saveNotifs(list);
    renderNotifPanel();
}

// ---- Mark all as read ----

function markAllNotifsRead() {
    var list = getStoredNotifs();
    list.forEach(function (n) { n.read = true; });
    saveNotifs(list);
    renderNotifPanel();
}

// ---- Clear all ----

function clearAllNotifs() {
    saveNotifs([]);
    renderNotifPanel();
}

// ---- Time-ago helper ----

function formatTimeAgo(isoString) {
    var diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60)      return "Just now";
    if (diff < 3600)    return Math.floor(diff / 60) + "m ago";
    if (diff < 86400)   return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
}

// ---- HTML escape ----

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ---- Check due payments and generate notifications ----

function checkPaymentNotifications() {
    var prefs = getNotifPrefs();
    if (!prefs.paymentDue) return;

    var payments = [];
    try { payments = JSON.parse(localStorage.getItem(userKey("scheduledPayments"))) || []; } catch (e) {}

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var threshold = prefs.daysBefore || 7;

    payments.forEach(function (p) {
        if (p.status === "Completed") return;
        if (!p.date) return;

        var due  = new Date(p.date + "T00:00:00");
        due.setHours(0, 0, 0, 0);
        var daysLeft = Math.round((due - today) / 86400000);

        if (daysLeft < 0) {
            // Overdue
            addNotif(
                "due",
                "Payment Overdue",
                (p.payment || "A payment") + " was due " + Math.abs(daysLeft) +
                    " day" + (Math.abs(daysLeft) !== 1 ? "s" : "") + " ago — ₦" +
                    Number(p.amount || 0).toLocaleString("en-NG") + "."
            );
        } else if (daysLeft === 0) {
            addNotif(
                "due",
                "Payment Due Today",
                (p.payment || "A payment") + " of ₦" +
                    Number(p.amount || 0).toLocaleString("en-NG") + " is due today."
            );
        } else if (daysLeft <= threshold) {
            addNotif(
                "due",
                "Upcoming Payment",
                (p.payment || "A payment") + " of ₦" +
                    Number(p.amount || 0).toLocaleString("en-NG") +
                    " is due in " + daysLeft + " day" + (daysLeft !== 1 ? "s" : "") + "."
            );
        }
    });
}

// ---- Check goal and generate notification ----

function checkGoalNotification() {
    var prefs = getNotifPrefs();
    if (!prefs.goalReached) return;

    var data = getContribData();
    if (!data.goal || data.goal <= 0) return;

    var balance = getContribBalance(data);
    if (balance >= data.goal) {
        addNotif(
            "goal",
            "Savings Goal Reached! 🎉",
            "You have reached your savings goal of ₦" +
                data.goal.toLocaleString("en-NG") + ". Great work!"
        );
    }
}

// ---- Wire up bell button + panel toggle ----

function initNotifBell() {
    var bellBtn  = document.getElementById("notifBellBtn");
    var panel    = document.getElementById("notifPanel");
    var clearBtn = document.getElementById("notifClearBtn");

    if (!bellBtn || !panel) return;

    // Toggle panel open/closed
    bellBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = panel.classList.contains("open");
        panel.classList.toggle("open", !isOpen);

        // Mark all as read when panel opens
        if (!isOpen) {
            markAllNotifsRead();
        }
    });

    // Close panel when clicking outside
    document.addEventListener("click", function (e) {
        if (!panel.contains(e.target) && e.target !== bellBtn) {
            panel.classList.remove("open");
        }
    });

    // Clear all button
    if (clearBtn) {
        clearBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            clearAllNotifs();
        });
    }
}

// ---- Bootstrap entry point ----
// Called from DOMContentLoaded in the existing code block.

document.addEventListener("DOMContentLoaded", function () {
    // Run checks and build initial notifications
    checkPaymentNotifications();
    checkGoalNotification();

    // Render the panel with whatever is stored
    renderNotifPanel();

    // Wire up the bell
    initNotifBell();
});
