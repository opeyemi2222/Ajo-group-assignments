/* ==========================================
   AJO SAVE - MEMBERS PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadMembers();
    searchMembers();
    filterMembers();
    animateCounters();

});

/* ==========================================
   SAMPLE MEMBERS
   (Temporary until JSON Server)
========================================== */

const memberNames = [
    "John Doe", "Sarah Johnson", "Michael David", "Grace Williams", "Daniel Okafor",
    "Amina Bello", "Chinedu Okoro", "Esther James", "Tunde Adeyemi", "Blessing Musa",
    "Emeka Nwosu", "Fatima Ibrahim", "Samuel Ojo", "Ruth Eze", "Kelechi Obi",
    "Ngozi Umeh", "Ibrahim Sule", "Deborah Akin", "Victor Amos", "Joy Martins",
    "Femi Lawal", "Zainab Ali", "Patrick Ibe", "Mercy Daniel", "Kelvin Brown",
    "Adaeze Nnamdi", "Oluwaseun King", "Hauwa Garba", "David Friday", "Precious Hope"
];

const savingsPlans = ["Daily Savings", "Weekly Savings", "Monthly Savings"];
const joinedDates = ["20 Jan 2026", "15 Feb 2026", "12 Mar 2026", "05 Apr 2026", "18 May 2026", "10 Jun 2026"];

const members = memberNames.map((name, index) => ({
    id: index + 1,
    name,
    role: index === 0 ? "Leader" : index === 1 ? "Treasurer" : index === 2 ? "Secretary" : "Member",
    status: index < 27 ? "Active" : "Inactive",
    savings: savingsPlans[index % savingsPlans.length],
    progress: 45 + ((index * 7) % 51),
    joined: joinedDates[index % joinedDates.length],
    image: `https://i.pravatar.cc/200?img=${index + 1}`
}));

/* ==========================================
   LOAD MEMBERS
========================================== */

function loadMembers() {

    const container = document.getElementById("memberContainer");

    if (!container) return;

    container.innerHTML = "";

    members.forEach(member => {

        let badge = "member-role";
        let card = "";

        if (member.role === "Leader") {
            badge = "leader-role";
            card = "leader";
        }

        if (member.role === "Treasurer") {
            badge = "treasurer-role";
            card = "treasurer";
        }

        if (member.role === "Secretary") {
            badge = "secretary-role";
            card = "secretary";
        }

        container.innerHTML += `

        <div class="col-lg-4 col-md-6 member-item"
             data-name="${member.name.toLowerCase()}"
             data-role="${member.role}"
             data-status="${member.status}">

            <div class="member-card ${card}">

                <div class="member-image">

                    <img src="${member.image}" alt="${member.name}">

                    <span class="online"></span>

                </div>

                <h4>${member.name}</h4>

                <span class="role ${badge}">
                    ${member.role}
                </span>

                <div class="progress mt-4">

                    <div
                        class="progress-bar bg-success"
                        style="width:${member.progress}%">

                        ${member.progress}%

                    </div>

                </div>

                <div class="member-info">

                    <p>

                        <i class="fa-solid fa-wallet"></i>

                        ${member.savings}

                    </p>

                    <p>

                        <i class="fa-solid fa-calendar"></i>

                        Joined: ${member.joined}

                    </p>

                    <p>

                        <i class="fa-solid fa-circle-check"></i>

                        ${member.status}

                    </p>

                </div>

                <div class="buttons">

                    <button
                        class="btn btn-primary"
                        onclick="viewProfile(${member.id})">

                        <i class="fa-solid fa-user"></i>

                        View

                    </button>

                    <button
                        class="btn btn-success">

                        <i class="fa-solid fa-phone"></i>

                        Contact

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

/* ==========================================
   SEARCH
========================================== */

function searchMembers() {

    const search = document.getElementById("searchMember");

    if (!search) return;

    search.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".member-item").forEach(card => {

            card.style.display =
                card.dataset.name.includes(value)
                    ? "block"
                    : "none";

        });

    });

}

/* ==========================================
   FILTERS
========================================== */

function filterMembers() {

    const role = document.getElementById("roleFilter");
    const status = document.getElementById("statusFilter");

    if (!role || !status) return;

    function applyFilter() {

        document.querySelectorAll(".member-item").forEach(card => {

            const roleMatch =
                role.value === "" ||
                card.dataset.role === role.value;

            const statusMatch =
                status.value === "" ||
                card.dataset.status === status.value;

            card.style.display =
                roleMatch && statusMatch
                    ? "block"
                    : "none";

        });

    }

    role.addEventListener("change", applyFilter);
    status.addEventListener("change", applyFilter);

}

/* ==========================================
   VIEW PROFILE
========================================== */

function viewProfile(id) {

    const member = members.find(m => m.id === id);

    if (!member) return;

    Swal.fire({

        title: member.name,

        html: `

            <img
                src="${member.image}"
                style="
                    width:120px;
                    height:120px;
                    border-radius:50%;
                    margin-bottom:15px;
                ">

            <p><b>Role:</b> ${member.role}</p>

            <p><b>Status:</b> ${member.status}</p>

            <p><b>Saving Plan:</b> ${member.savings}</p>

            <p><b>Contribution:</b> ${member.progress}%</p>

            <p><b>Joined:</b> ${member.joined}</p>

        `,

        confirmButtonColor: "#2563eb"

    });

}

/* ==========================================
   COUNTER ANIMATION
========================================== */

function animateCounters() {

    const counter = document.getElementById("totalMembers");

    if (!counter) return;

    let start = 0;

    const end = members.length;

    const timer = setInterval(() => {

        start++;

        counter.innerHTML = start;

        if (start >= end) {

            clearInterval(timer);

        }

    }, 80);

}

/* ==========================================
   CONTACT BUTTON
========================================== */

document.addEventListener("click", function (e) {

    if (e.target.closest(".btn-success")) {

        Swal.fire({

            icon: "info",

            title: "Coming Soon",

            text: "Chat & Contact feature will be available soon.",

            confirmButtonColor: "#10b981"

        });

    }

});
