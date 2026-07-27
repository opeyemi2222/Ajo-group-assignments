/* ==========================================
   REPORTS PAGE
========================================== */

// Dummy Report Data

const reportData = {
    totalMembers: 120,
    totalSavings: 15450000,
    totalPayments: 4250000,
    pendingPayments: 350000
};

const monthlyContribution = [
    250000,
    420000,
    610000,
    800000,
    950000,
    1200000,
    1500000,
    1800000,
    1600000,
    1900000,
    2100000,
    2500000
];

const paymentDistribution = {
    completed: 85,
    pending: 10,
    cancelled: 5
};

/* ==========================================
   BAR CHART
========================================== */

const monthlyCtx = document.getElementById("monthlyChart");

if (monthlyCtx) {

    new Chart(monthlyCtx, {

        type: "bar",

        data: {

            labels: [

                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"

            ],

            datasets: [{

                label: "Monthly Contributions",

                data: monthlyContribution,

                backgroundColor: "#2563eb",

                borderRadius: 8

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================
   PIE CHART
========================================== */

const paymentCtx = document.getElementById("paymentChart");

if (paymentCtx) {

    new Chart(paymentCtx, {

        type: "doughnut",

        data: {

            labels: [

                "Completed",

                "Pending",

                "Cancelled"

            ],

            datasets: [{

                data: [

                    paymentDistribution.completed,

                    paymentDistribution.pending,

                    paymentDistribution.cancelled

                ],

                backgroundColor: [

                    "#22c55e",

                    "#facc15",

                    "#ef4444"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

/* ==========================================
   FILTER REPORT
========================================== */

const reportFilter = document.querySelector(".filter-area");

if (reportFilter) {

    reportFilter.addEventListener("change", () => {

        console.log("Filter Changed");

    });

}

/* ==========================================
   EXPORT BUTTONS
========================================== */

const buttons = document.querySelectorAll(".page-title button");

function downloadReportCsv() {
    const rows = [
        ["Metric", "Value"],
        ["Total Members", reportData.totalMembers],
        ["Total Savings", reportData.totalSavings],
        ["Total Payments", reportData.totalPayments],
        ["Pending Payments", reportData.pendingPayments]
    ];
    const csv = rows.map(row => row.join(",")).join("\n");
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "ajo-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

buttons.forEach(button => {

    button.addEventListener("click", function () {

        const text = this.textContent.trim();

        switch (text) {

            case "Export Excel":
                downloadReportCsv();

                break;

            case "Export PDF":
                window.print();

                break;

            case "Print":

                window.print();

                break;

        }

    });

});

/* ==========================================
   REPORT SUMMARY
========================================== */

function loadSummary() {

    console.log("========== REPORT ==========");

    console.log("Members :", reportData.totalMembers);

    console.log("Savings :", reportData.totalSavings);

    console.log("Payments :", reportData.totalPayments);

    console.log("Pending :", reportData.pendingPayments);

}

/* ==========================================
   CALCULATE SAVINGS
========================================== */

function calculateSavings() {

    const totalContribution = monthlyContribution.reduce(

        (total, amount) => total + amount,

        0

    );

    console.log(

        "Total Contribution:",

        totalContribution.toLocaleString()

    );

}

/* ==========================================
   TOP CONTRIBUTORS
========================================== */

const topContributors = [

    {
        name: "John David",
        amount: 250000
    },

    {
        name: "Grace James",
        amount: 210000
    },

    {
        name: "Michael Daniel",
        amount: 180000
    }

];

function displayTopContributors() {

    console.table(topContributors);

}

/* ==========================================
   PAGE LOAD
========================================== */

window.onload = () => {

    loadSummary();

    calculateSavings();

    displayTopContributors();

};
