// =================================
// SCOPED KEY HELPER
// Returns a localStorage key namespaced to
// the currently logged-in user's email so
// no two users ever share the same data.
// =================================

function getScopedKey(base) {
    var u = {};
    try { u = JSON.parse(localStorage.getItem("user")) || {}; } catch(e) {}
    return base + "_" + (u.email || "guest").toLowerCase();
}

document.addEventListener("DOMContentLoaded", function () {


    // =================================
    // ELEMENTS
    // =================================

    const paymentsTableBody =
        document.getElementById("paymentsTableBody");

    const paymentSearch =
        document.getElementById("paymentSearch");

    const paymentFilter =
        document.getElementById("paymentFilter");

    const emptyState =
        document.getElementById("emptyState");


    // Statistics

    const totalPayments =
        document.getElementById("totalPayments");

    const completedPayments =
        document.getElementById("completedPayments");

    const upcomingPayments =
        document.getElementById("upcomingPayments");

    const pendingPayments =
        document.getElementById("pendingPayments");


    // =================================
    // GET PAYMENTS
    // =================================

    function getPayments() {

        return JSON.parse(
            localStorage.getItem(getScopedKey("scheduledPayments"))
        ) || [];

    }


    // =================================
    // FORMAT AMOUNT
    // =================================

    function formatAmount(amount) {

        return "₦" +
            Number(amount).toLocaleString("en-NG");

    }


    // =================================
    // FORMAT DATE
    // =================================

    function formatDate(dateValue) {

        if (!dateValue) {

            return "Not selected";

        }

        const date =
            new Date(dateValue + "T00:00:00");


        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =================================
    // FORMAT FREQUENCY
    // =================================

    function formatFrequency(frequency) {

        const names = {

            January: "January",

            February: "February",

            March: "March",

            April: "April",

            May: "May",

            June: "June",

            July: "July",

            August: "August",

            September: "September",

            October: "October",

            November: "November",

            December: "December"

        };


        return names[frequency] || frequency || "N/A";

    }


    // =================================
    // UPDATE STATISTICS
    // =================================

    function updateStatistics(payments) {

        totalPayments.textContent =
            payments.length


        completedPayments.textContent =
            payments.filter(
                payment =>
                    payment.status === "Completed"
            ).length;


        upcomingPayments.textContent =
            payments.filter(
                payment =>
                    payment.status === "Upcoming"
            ).length;


        pendingPayments.textContent =
            payments.filter(
                payment =>
                    payment.status === "Pending"
            ).length;

    }


    // =================================
    // DISPLAY PAYMENTS
    // =================================

    function displayPayments() {


        const payments =
            getPayments();


        const searchTerm =
            paymentSearch.value
                .toLowerCase()
                .trim();


        const filterValue =
            paymentFilter.value;


        // FILTER PAYMENTS

        const filteredPayments =
            payments.filter(
                payment => {


                    const searchableContent = [

                        payment.payment,

                        payment.id,

                        payment.amount,

                        payment.frequency,

                        payment.date,

                        payment.status,

                        payment.note

                    ]
                        .join(" ")
                        .toLowerCase();


                    const matchesSearch =
                        searchableContent
                            .includes(searchTerm);


                    const matchesFilter =
                        filterValue === "all" ||
                        payment.status === filterValue;


                    return (
                        matchesSearch &&
                        matchesFilter
                    );

                }
            );


        // CLEAR TABLE

        paymentsTableBody.innerHTML = "";


        // EMPTY STATE

        if (filteredPayments.length === 0) {

            emptyState.classList.remove("d-none");

            return;

        }


        emptyState.classList.add("d-none");


        // CREATE ROWS

        filteredPayments.forEach(
            payment => {


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>

                        <strong>
                            ${payment.payment}
                        </strong>

                    </td>


                    <td>

                        <small>
                            ${payment.id}
                        </small>

                    </td>


                    <td>

                        <strong>
                            ${formatAmount(payment.amount)}
                        </strong>

                    </td>


                    <td>

                        ${formatFrequency(payment.frequency)}

                    </td>


                    <td>

                        ${formatDate(payment.date)}

                    </td>


                    <td>

                        <span class="status ${payment.status.toLowerCase()}">

                            ${payment.status}

                        </span>

                    </td>


                    <td>

                        <button
                            class="view-btn"
                            onclick="viewPayment('${payment.id}')">

                            <i class="bi bi-eye"></i>

                            View

                        </button>

                        ${
                            payment.status === "Pending" &&
                            !payment.paymentMethod
                            ?
                            `
                            <a
                                href="../make-payments/make.html?id=${payment.id}"
                                class="pay-btn">

                                <i class="bi bi-wallet2"></i>

                                Pay Now

                            </a>
                            `
                            :
                            ""
                        }

                    </td>

                `;


                paymentsTableBody.appendChild(row);

            }
        );

    }


    // =================================
    // SEARCH
    // =================================

    paymentSearch.addEventListener(
        "input",
        displayPayments
    );


    // =================================
    // FILTER
    // =================================

    paymentFilter.addEventListener(
        "change",
        displayPayments
    );

// =================================
// INITIAL LOAD
// =================================

// First update payment statuses
updatePaymentStatuses();


// Get updated payments
const currentPayments =
    getPayments();


// Update statistics
updateStatistics(
    currentPayments
);


// Display payments
displayPayments();

});

// =================================
// FORMAT RECEIPT DATE
// =================================

function formatReceiptDate(dateValue) {

    if (!dateValue) {

        return "Not selected";

    }


    const date =
        new Date(
            dateValue + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}

// =================================
// VIEW PAYMENT
// =================================

function viewPayment(paymentId) {

    const payments =
        JSON.parse(
            localStorage.getItem(getScopedKey("scheduledPayments"))
        ) || [];


    const payment =
        payments.find(
            item =>
                item.id === paymentId
        );


    if (!payment) {

        return;

    }


    const details =
        document.getElementById(
            "paymentDetailsContent"
        );


    // =================================
    // PAYMENT STATUS
    // =================================

    let statusClass =
        payment.status.toLowerCase();

    let statusText =
        payment.status;


    // =================================
    // CREATE RECEIPT CONTENT
    // =================================

    details.innerHTML = `

        <div class="mb-3">

            <small class="text-muted">
                Payment Reference
            </small>

            <h6>
                ${payment.id}
            </h6>

        </div>


        <div class="mb-3">

            <small class="text-muted">
                Payment
            </small>

            <h6>
                ${payment.payment}
            </h6>

        </div>


        <div class="mb-3">

            <small class="text-muted">
                Amount
            </small>

            <h6>
                ₦${Number(payment.amount)
                    .toLocaleString("en-NG")}
            </h6>

        </div>


        <div class="mb-3">

            <small class="text-muted">
                Due Date
            </small>

            <h6>
                ${formatReceiptDate(payment.date)}
            </h6>

        </div>


        <div class="mb-3">

            <small class="text-muted">
                Payment Status
            </small>

            <div>

                <span class="status ${statusClass}">

                    ${statusText}

                </span>

            </div>

        </div>


        <div class="mb-3">

            <small class="text-muted">
                Note
            </small>

            <p>

                ${payment.paymentNote || payment.note || "No note added"}

            </p>

        </div>


        ${
            payment.paymentMethod
            ?
            `

            <div class="mb-3">

                <small class="text-muted">
                    Payment Method
                </small>

                <h6>
                    ${payment.paymentMethod}
                </h6>

            </div>

            `
            :
            ""
        }


        ${
            payment.status === "Pending" &&
            payment.paymentMethod
            ?
            `

            <button
                type="button"
                class="btn btn-success w-100"
                onclick="markPaymentAsPaid('${payment.id}')">

                <i class="bi bi-check-circle-fill"></i>

                Mark as Paid

            </button>

            `
            :
            payment.status === "Pending"
            ?
            `

            <a
                href="../make-payments/make.html?id=${payment.id}"
                class="btn btn-success w-100">

                <i class="bi bi-wallet2"></i>

                Make Payment

            </a>

            `
            :
            payment.status === "Completed"
            ?
            `

            <div class="alert alert-success mb-0">

                <i class="bi bi-check-circle-fill"></i>

                This payment has already been paid.

            </div>

            `
            :
            `

            <div class="alert alert-info mb-0">

                <i class="bi bi-clock"></i>

                This payment is not yet due.

            </div>

            `
        }

    `;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "paymentDetailsModal"
            )
        );


    modal.show();

}

// =================================
// MARK PAYMENT AS PAID
// =================================

function markPaymentAsPaid(paymentId) {

    let payments =
        JSON.parse(
            localStorage.getItem(
                getScopedKey("scheduledPayments")
            )
        ) || [];


    const paymentIndex =
        payments.findIndex(
            payment =>
                payment.id === paymentId
        );


    // =================================
    // PAYMENT NOT FOUND
    // =================================

    if (paymentIndex === -1) {

        showPaymentToast("Payment could not be found.", "danger");

        return;

    }


    // =================================
    // UPDATE STATUS
    // =================================

    payments[paymentIndex].status =
        "Completed";


    payments[paymentIndex].paidAt =
        new Date().toISOString();


    // =================================
    // SAVE UPDATED PAYMENT
    // =================================

    localStorage.setItem(
        getScopedKey("scheduledPayments"),
        JSON.stringify(
            payments
        )
    );


    // =================================
    // RECORD IN CONTRIBUTION HISTORY
    // When a payment is marked as paid it
    // automatically appears as a contribution
    // in the My Contributions tab.
    // =================================

    (function () {
        var paid = payments[paymentIndex];
        var contribData;
        try {
            contribData = JSON.parse(localStorage.getItem(getScopedKey("contribData"))) || { goal: 0, history: [] };
        } catch (e) {
            contribData = { goal: 0, history: [] };
        }

        // Calculate current balance before this entry
        var currentBalance = contribData.history.reduce(function (bal, entry) {
            return entry.type === "contribute" ? bal + entry.amount : bal - entry.amount;
        }, 0);

        var amount = Number(paid.amount) || 0;
        var newBalance = currentBalance + amount;

        contribData.history.push({
            id:           "C-PAY-" + paid.id,
            type:         "contribute",
            amount:       amount,
            note:         paid.payment + (paid.paymentNote || paid.note ? " — " + (paid.paymentNote || paid.note) : ""),
            date:         paid.paidAt || new Date().toISOString(),
            balanceAfter: newBalance,
            paymentRef:   paid.id
        });

        localStorage.setItem(getScopedKey("contribData"), JSON.stringify(contribData));
    }());


    // =================================
    // CLOSE CURRENT MODAL
    // =================================

    const modalElement =
        document.getElementById(
            "paymentDetailsModal"
        );


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    if (modal) {

        modal.hide();

    }


    // =================================
    // REFRESH PAGE DATA
    // =================================

    setTimeout(
        function () {

            location.reload();

        },
        300
    );

}

// =================================
// UPDATE PAYMENT STATUSES
// =================================

function updatePaymentStatuses() {

    let payments =
        JSON.parse(
            localStorage.getItem(
                getScopedKey("scheduledPayments")
            )
        ) || [];


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    let hasChanges = false;


    payments.forEach(
        payment => {


            // Do not change already
            // completed payments

            if (
                payment.status === "Completed"
            ) {

                return;

            }


            if (!payment.date) {

                return;

            }


            const dueDate =
                new Date(
                    payment.date + "T00:00:00"
                );


            dueDate.setHours(
                0,
                0,
                0,
                0
            );


            // =================================
            // CALCULATE DAYS UNTIL DUE DATE
            // =================================

            const difference =
                dueDate.getTime() -
                today.getTime();


            const daysUntilDue =
                Math.ceil(
                    difference /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );


            // =================================
            // 20 DAYS OR LESS
            // CHANGE TO PENDING
            // =================================

            if (
                daysUntilDue <= 20 &&
                daysUntilDue >= 0
            ) {

                if (
                    payment.status !== "Pending"
                ) {

                    payment.status =
                        "Pending";


                    hasChanges = true;

                }

            }

        }
    );


    // =================================
    // SAVE CHANGES
    // =================================

    if (hasChanges) {

        localStorage.setItem(
            getScopedKey("scheduledPayments"),
            JSON.stringify(
                payments
            )
        );

    }

}


// =========================================
// BOOTSTRAP TOAST HELPER
// =========================================

function showPaymentToast(message, type) {
    const toastEl  = document.getElementById("appToast");
    const msgEl    = document.getElementById("appToastMessage");
    const iconEl   = document.getElementById("appToastIcon");
    if (!toastEl || !msgEl) return;

    const map = {
        success: { bg: "text-bg-success", icon: "bi-check-circle-fill" },
        danger:  { bg: "text-bg-danger",  icon: "bi-exclamation-circle-fill" },
        warning: { bg: "text-bg-warning", icon: "bi-exclamation-triangle-fill" },
        info:    { bg: "text-bg-primary", icon: "bi-info-circle-fill" }
    };
    const cfg = map[type] || map.info;

    toastEl.className = "toast align-items-center border-0 shadow " + cfg.bg;
    if (iconEl) iconEl.className = "bi " + cfg.icon;
    msgEl.textContent = message;

    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4000 }).show();
}
