/* ==========================================
   CONTRIBUTIONS PAGE
========================================== */

const contributions = [
    {
        id: 1,
        member: "John David",
        amount: 10000,
        date: "2026-07-20",
        method: "Cash",
        status: "Completed"
    },
    {
        id: 2,
        member: "Grace James",
        amount: 5000,
        date: "2026-07-20",
        method: "Transfer",
        status: "Completed"
    },
    {
        id: 3,
        member: "Michael Daniel",
        amount: 8000,
        date: "2026-07-19",
        method: "POS",
        status: "Pending"
    }
];

/* ==========================================
   LOAD CONTRIBUTIONS
========================================== */

function loadContributions(data = contributions) {

    const table = document.getElementById("contributionTable");

    if (!table) return;

    table.innerHTML = "";

    data.forEach((item, index) => {

        table.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${item.member}</td>

                <td>₦${item.amount.toLocaleString()}</td>

                <td>${item.date}</td>

                <td>${item.method}</td>

                <td>
                    <span class="badge ${item.status === "Completed" ? "bg-success" : "bg-warning"}">
                        ${item.status}
                    </span>
                </td>

                <td>

                    <button class="btn btn-primary btn-sm viewBtn"
                        data-id="${item.id}">
                        <i class="fa fa-eye"></i>
                    </button>

                    <button class="btn btn-warning btn-sm editBtn"
                        data-id="${item.id}">
                        <i class="fa fa-edit"></i>
                    </button>

                    <button class="btn btn-danger btn-sm deleteBtn"
                        data-id="${item.id}">
                        <i class="fa fa-trash"></i>
                    </button>

                </td>

            </tr>
        `;

    });

}

/* ==========================================
   SEARCH
========================================== */

const searchInput = document.getElementById("searchContribution");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const keyword = this.value.toLowerCase();

        const filtered = contributions.filter(item =>
            item.member.toLowerCase().includes(keyword) ||
            item.method.toLowerCase().includes(keyword) ||
            item.status.toLowerCase().includes(keyword)
        );

        loadContributions(filtered);

    });

}

/* ==========================================
   FILTER BY MEMBER
========================================== */

const memberFilter = document.querySelector(".filter-area select");

if (memberFilter) {

    memberFilter.addEventListener("change", function () {

        const value = this.value;

        if (value === "All Members") {

            loadContributions();

            return;

        }

        const filtered = contributions.filter(item => item.member === value);

        loadContributions(filtered);

    });

}

/* ==========================================
   FILTER BY DATE
========================================== */

const dateFilter = document.querySelector(".filter-area input[type='date']");

if (dateFilter) {

    dateFilter.addEventListener("change", function () {

        const value = this.value;

        if (!value) {

            loadContributions();

            return;

        }

        const filtered = contributions.filter(item => item.date === value);

        loadContributions(filtered);

    });

}

/* ==========================================
   BUTTON EVENTS
========================================== */

document.addEventListener("click", function (e) {

    /* View */

    if (e.target.closest(".viewBtn")) {

        const id = e.target.closest(".viewBtn").dataset.id;

        const contribution = contributions.find(item => item.id == id);

        prompt(
`Contribution Receipt

Member: ${contribution.member}

Amount: ₦${contribution.amount.toLocaleString()}

Date: ${contribution.date}

Method: ${contribution.method}

Status: ${contribution.status}`
        );

    }

    /* Edit */

    if (e.target.closest(".editBtn")) {

        const id = e.target.closest(".editBtn").dataset.id;

        const contribution = contributions.find(item => item.id == id);
        const amount = prompt("Enter the new contribution amount:", contribution.amount);

        if (amount === null) return;

        const newAmount = Number(amount);

        if (Number.isFinite(newAmount) && newAmount > 0) {
            contribution.amount = newAmount;
            loadContributions();
        }

    }

    /* Delete */

    if (e.target.closest(".deleteBtn")) {

        const id = e.target.closest(".deleteBtn").dataset.id;

        if (confirm("Delete this contribution?")) {

            const index = contributions.findIndex(item => item.id == id);
            contributions.splice(index, 1);
            loadContributions();

        }

    }

});

/* ==========================================
   ADD CONTRIBUTION
========================================== */

const addContributionForm = document.getElementById("addContributionForm");

if (addContributionForm) {

    addContributionForm.addEventListener("submit", function (e) {

        e.preventDefault();

        this.reset();

    });

}

/* ==========================================
   SUMMARY CALCULATIONS
========================================== */

function calculateTotals() {

    const total = contributions.reduce((sum, item) => sum + item.amount, 0);

    console.log("Total Contributions:", total);

}

/* ==========================================
   PAGE LOAD
========================================== */

window.onload = () => {

    loadContributions();

    calculateTotals();

};
