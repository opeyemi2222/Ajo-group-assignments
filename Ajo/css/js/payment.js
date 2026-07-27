/* ==========================================
   PAYMENTS PAGE
========================================== */

const payments = [
    {
        id: 1,
        member: "John David",
        amount: 25000,
        date: "2026-07-20",
        method: "Bank Transfer",
        status: "Completed"
    },
    {
        id: 2,
        member: "Grace James",
        amount: 18000,
        date: "2026-07-19",
        method: "Cash",
        status: "Pending"
    },
    {
        id: 3,
        member: "Michael Daniel",
        amount: 30000,
        date: "2026-07-18",
        method: "POS",
        status: "Completed"
    },
    {
        id: 4,
        member: "Sarah Johnson",
        amount: 15000,
        date: "2026-07-17",
        method: "Transfer",
        status: "Completed"
    }
];

/* ==========================================
   LOAD PAYMENTS
========================================== */

function loadPayments(data = payments) {

    const table = document.getElementById("paymentTable");

    if (!table) return;

    table.innerHTML = "";

    data.forEach((payment, index) => {

        table.innerHTML += `
        <tr>

            <td>${index + 1}</td>

            <td>${payment.member}</td>

            <td>₦${payment.amount.toLocaleString()}</td>

            <td>${payment.date}</td>

            <td>${payment.method}</td>

            <td>

                <span class="badge ${
                    payment.status === "Completed"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }">

                    ${payment.status}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-primary btn-sm viewBtn"
                    data-id="${payment.id}">
                    <i class="fa fa-eye"></i>
                </button>

                <button
                    class="btn btn-warning btn-sm editBtn"
                    data-id="${payment.id}">
                    <i class="fa fa-edit"></i>
                </button>

                <button
                    class="btn btn-danger btn-sm deleteBtn"
                    data-id="${payment.id}">
                    <i class="fa fa-trash"></i>
                </button>

            </td>

        </tr>
        `;

    });

}

/* ==========================================
   SEARCH PAYMENT
========================================== */

const searchPayment = document.getElementById("searchPayment");

if (searchPayment) {

    searchPayment.addEventListener("keyup", function () {

        const keyword = this.value.toLowerCase();

        const filtered = payments.filter(payment =>

            payment.member.toLowerCase().includes(keyword) ||

            payment.method.toLowerCase().includes(keyword) ||

            payment.status.toLowerCase().includes(keyword)

        );

        loadPayments(filtered);

    });

}

/* ==========================================
   FILTER STATUS
========================================== */

const statusFilter = document.querySelector(".filter-area select");

if (statusFilter) {

    statusFilter.addEventListener("change", function () {

        const value = this.value;

        if (value === "All Status") {

            loadPayments();

            return;

        }

        const filtered = payments.filter(payment => payment.status === value);

        loadPayments(filtered);

    });

}

/* ==========================================
   FILTER DATE
========================================== */

const dateFilter = document.querySelector(".filter-area input[type='date']");

if (dateFilter) {

    dateFilter.addEventListener("change", function () {

        const value = this.value;

        if (!value) {

            loadPayments();

            return;

        }

        const filtered = payments.filter(payment => payment.date === value);

        loadPayments(filtered);

    });

}

/* ==========================================
   BUTTON EVENTS
========================================== */

document.addEventListener("click", function (e) {

    /* View */

    if (e.target.closest(".viewBtn")) {

        const id = e.target.closest(".viewBtn").dataset.id;

        const payment = payments.find(item => item.id == id);

        prompt(

`PAYMENT RECEIPT

Member : ${payment.member}

Amount : ₦${payment.amount.toLocaleString()}

Method : ${payment.method}

Date : ${payment.date}

Status : ${payment.status}`

        );

    }

    /* Edit */

    if (e.target.closest(".editBtn")) {

        const id = e.target.closest(".editBtn").dataset.id;

        const payment = payments.find(item => item.id == id);
        const amount = prompt("Enter the new payment amount:", payment.amount);

        if (amount === null) return;

        const newAmount = Number(amount);

        if (Number.isFinite(newAmount) && newAmount > 0) {
            payment.amount = newAmount;
            loadPayments();
        }

    }

    /* Delete */

    if (e.target.closest(".deleteBtn")) {

        const id = e.target.closest(".deleteBtn").dataset.id;

        if (confirm("Delete this payment record?")) {

            const index = payments.findIndex(item => item.id == id);
            payments.splice(index, 1);
            loadPayments();

        }

    }

});

/* ==========================================
   ADD PAYMENT
========================================== */

const addPaymentForm = document.getElementById("addPaymentForm");

if (addPaymentForm) {

    addPaymentForm.addEventListener("submit", function (e) {

        e.preventDefault();

        this.reset();

    });

}

/* ==========================================
   PAYMENT SUMMARY
========================================== */

function calculateSummary() {

    const totalPaid = payments.reduce((sum, payment) => {

        return payment.status === "Completed"
            ? sum + payment.amount
            : sum;

    }, 0);

    const pendingAmount = payments.reduce((sum, payment) => {

        return payment.status === "Pending"
            ? sum + payment.amount
            : sum;

    }, 0);

    console.log("Total Paid:", totalPaid);

    console.log("Pending:", pendingAmount);

}

/* ==========================================
   PAGE LOAD
========================================== */

window.onload = function () {

    loadPayments();

    calculateSummary();

};
