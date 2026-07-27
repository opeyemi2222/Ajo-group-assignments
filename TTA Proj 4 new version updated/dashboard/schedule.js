// =========================================
// USER KEY HELPER
// =========================================

function userKey(base) {
    try {
        var u = JSON.parse(localStorage.getItem("user")) || {};
        var email = (u.email || "").toLowerCase().trim();
        return email ? base + "_" + email : base;
    } catch (e) { return base; }
}

document.addEventListener("DOMContentLoaded", function () {

    // =================================
    // ELEMENTS
    // =================================

    const scheduleForm =
        document.getElementById("schedulePaymentForm");

    const paymentAmount =
        document.getElementById("paymentAmount");

    const paymentFrequency =
        document.getElementById("paymentFrequency");

    const paymentDate =
        document.getElementById("paymentDate");

    const paymentNote =
        document.getElementById("paymentNote");


    // =================================
    // SUMMARY ELEMENTS
    // =================================

    const summaryAmount =
        document.getElementById("summaryAmount");

    const summaryFrequency =
        document.getElementById("summaryFrequency");

    const summaryDate =
        document.getElementById("summaryDate");

    const summaryNote =
        document.getElementById("summaryNote");


    const confirmPaymentBtn =
        document.getElementById("confirmPaymentBtn");


    // =================================
    // FORMAT AMOUNT
    // =================================

    function formatAmount(amount) {

        if (!amount) {
            return "₦0";
        }

        return "₦" +
            Number(amount).toLocaleString("en-NG");

    }


    // =================================
    // FORMAT PAYMENT MONTH
    // =================================

    function formatFrequency(frequency) {

        return frequency || "Not selected";

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
                month: "long",
                year: "numeric"
            }
        );

    }


    // =================================
    // UPDATE SUMMARY
    // =================================

    function updateSummary() {

        summaryAmount.textContent =
            formatAmount(paymentAmount.value);


        summaryFrequency.textContent =
            formatFrequency(
                paymentFrequency.value
            );


        summaryDate.textContent =
            formatDate(
                paymentDate.value
            );


        const note =
            paymentNote.value.trim();


        summaryNote.textContent =
            note || "No note";

    }


    // =================================
    // FORM SUBMIT
    // =================================

    scheduleForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // Check form validation

            if (!scheduleForm.checkValidity()) {

                scheduleForm.reportValidity();

                return;

            }


            // Update payment summary

            updateSummary();


            // Scroll to summary

            document
                .querySelector(".payment-summary")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );


    // =================================
    // LIVE SUMMARY UPDATE
    // =================================

    paymentAmount.addEventListener(
        "input",
        updateSummary
    );


    paymentFrequency.addEventListener(
        "change",
        updateSummary
    );


    paymentDate.addEventListener(
        "change",
        updateSummary
    );


    paymentNote.addEventListener(
        "input",
        updateSummary
    );


    // =================================
    // CONFIRM PAYMENT
    // =================================

    confirmPaymentBtn.addEventListener(
        "click",
        function () {


            // Validate form

            if (!scheduleForm.checkValidity()) {

                scheduleForm.reportValidity();

                return;

            }


            // =================================
            // CREATE PAYMENT OBJECT
            // =================================

            const newPayment = {

                id:
                    "PAY-" +
                    Date.now(),

                payment:
                    paymentFrequency.value +
                    " Contribution",

                amount:
                    Number(
                        paymentAmount.value
                    ),

                frequency:
                    paymentFrequency.value,

                date:
                    paymentDate.value,

                note:
                    paymentNote.value.trim(),

                status:
                    "Upcoming",

                createdAt:
                    new Date().toISOString()

            };


            // =================================
            // GET EXISTING PAYMENTS
            // =================================

            let scheduledPayments =
                JSON.parse(
                    localStorage.getItem(
                        userKey("scheduledPayments")
                    )
                ) || [];


            // =================================
            // ADD NEW PAYMENT
            // =================================

            scheduledPayments.unshift(
                newPayment
            );


            // =================================
            // SAVE PAYMENT
            // =================================

            localStorage.setItem(
                userKey("scheduledPayments"),
                JSON.stringify(
                    scheduledPayments
                )
            );


            // =================================
            // SUCCESS MESSAGE
            // =================================

            showSuccessAlert("Payment scheduled successfully!");

            // =================================
            // REDIRECT AFTER 3 SECONDS
            // =================================

            setTimeout(() => {
                window.location.href = "./user.html#schedule";
            }, 3000);

        }
    );

});


// =================================
// BOOTSTRAP ALERT HELPERS
// (global scope so onclick in HTML works)
// =================================

function showSuccessAlert(message) {
    const alertBox     = document.getElementById("successAlert");
    const alertMessage = document.getElementById("successAlertMessage");
    if (!alertBox || !alertMessage) return;

    alertMessage.textContent = message;
    alertBox.className = "alert alert-success alert-dismissible fade show";
    alertBox.classList.remove("d-none");
}

function hideSuccessAlert() {
    const alertBox = document.getElementById("successAlert");
    if (!alertBox) return;
    alertBox.classList.remove("show");
    setTimeout(function () {
        alertBox.classList.add("d-none");
    }, 150);
}