document.addEventListener("DOMContentLoaded", function () {


    // =================================
    // GET PAYMENT ID FROM URL
    // =================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const paymentId =
        urlParams.get("id");


    // =================================
    // SCOPED KEY FOR CURRENT USER
    // =================================

    var _scopedUser = {};
    try { _scopedUser = JSON.parse(localStorage.getItem("user")) || {}; } catch(e) {}
    var _paymentsKey = "scheduledPayments_" + (_scopedUser.email || "guest").toLowerCase();


    // =================================
    // ELEMENTS
    // =================================

    const paymentReference =
        document.getElementById("paymentReference");

    const paymentAmount =
        document.getElementById("paymentAmount");

    const paymentNote =
        document.getElementById("paymentNote");

    const summaryReference =
        document.getElementById("summaryReference");

    const summaryAmount =
        document.getElementById("summaryAmount");

    const summaryMethod =
        document.getElementById("summaryMethod");

    const transferInfo =
        document.getElementById("transferInfo");

    const makePaymentForm =
        document.getElementById("makePaymentForm");


    // =================================
    // GET SCHEDULED PAYMENTS
    // =================================

    let scheduledPayments =
        JSON.parse(
            localStorage.getItem(_paymentsKey)
        ) || [];


    // =================================
    // FIND PAYMENT
    // =================================

    const payment =
        scheduledPayments.find(
            item => item.id === paymentId
        );


    // =================================
    // CHECK PAYMENT
    // =================================

    if (!payment) {

        showAlert(
            "Payment could not be found. Redirecting to Payments...",
            "danger"
        );

        setTimeout(
            function () {

                window.location.href =
                    "../payments/payments.html";

            },
            2000
        );

        return;

    }


    // =================================
    // ALREADY COMPLETED
    // =================================

    if (payment.status === "Completed") {

        showAlert(
            "This payment has already been completed. Redirecting to Payments...",
            "warning"
        );

        setTimeout(
            function () {

                window.location.href =
                    "../payments/payments.html";

            },
            2000
        );

        return;

    }


    // =================================
    // DISPLAY PAYMENT
    // =================================

    paymentReference.value =
        payment.id;

    paymentAmount.value =
        Number(payment.amount)
            .toLocaleString("en-NG");


    summaryReference.textContent =
        payment.id;

    summaryAmount.textContent =
        "₦" +
        Number(payment.amount)
            .toLocaleString("en-NG");


    // =================================
    // PAYMENT METHOD
    // =================================

    const paymentMethods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentMethods.forEach(
        method => {

            method.addEventListener(
                "change",
                function () {


                    summaryMethod.textContent =
                        this.value;


                    // Show bank details

                    if (
                        this.value ===
                        "Bank Transfer"
                    ) {

                        transferInfo.classList.remove(
                            "d-none"
                        );

                    } else {

                        transferInfo.classList.add(
                            "d-none"
                        );

                    }

                }
            );

        }
    );


    // =================================
    // SUBMIT PAYMENT
    // =================================

    makePaymentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // Validate

            if (
                !makePaymentForm.checkValidity()
            ) {

                makePaymentForm.reportValidity();

                return;

            }


            const selectedMethod =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            if (!selectedMethod) {

                showAlert(
                    "Please select a payment method.",
                    "warning"
                );

                return;

            }


            // =================================
            // UPDATE PAYMENT
            // =================================

            payment.status =
                "Pending";

            payment.paymentMethod =
                selectedMethod.value;

            payment.paymentNote =
                paymentNote.value.trim();

            payment.paidAt =
                new Date().toISOString();


            // =================================
            // SAVE
            // =================================

            localStorage.setItem(
                _paymentsKey,
                JSON.stringify(
                    scheduledPayments
                )
            );


            // =================================
            // SUCCESS
            // =================================

            showAlert(
                "Payment submitted successfully. Your payment is now pending verification.",
                "success"
            );


            // =================================
            // REDIRECT
            // =================================

            setTimeout(
                function () {

                    window.location.href =
                        "../payments/payments.html";

                },
                2000
            );

        }
    );

});


// =================================
// SHOW ALERT
// =================================

function showAlert(message, type) {

    const alertBox =
        document.getElementById("paymentAlert");

    const alertMessage =
        document.getElementById("paymentAlertMessage");

    const alertIcon =
        document.getElementById("paymentAlertIcon");


    alertBox.classList.remove(
        "alert-success",
        "alert-danger",
        "alert-warning",
        "d-none"
    );

    alertBox.classList.add(
        "alert-" + type
    );


    const icons = {

        success: "bi-check-circle-fill",

        danger: "bi-exclamation-circle-fill",

        warning: "bi-exclamation-triangle-fill"

    };

    alertIcon.className =
        "bi me-2 " +
        (icons[type] || "bi-info-circle-fill");


    alertMessage.textContent =
        message;


    // Trigger Bootstrap fade animation

    setTimeout(
        function () {

            alertBox.classList.add("show");

        },
        10
    );


    alertBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =================================
// HIDE ALERT
// =================================

function hidePaymentAlert() {

    const alertBox =
        document.getElementById("paymentAlert");


    alertBox.classList.remove("show");


    setTimeout(
        function () {

            alertBox.classList.add("d-none");

        },
        150
    );

}
