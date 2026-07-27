/* ==========================================
   MEMBERS PAGE
========================================== */

const members = [
    {
        id: 1,
        name: "John David",
        phone: "08031234567",
        email: "john@gmail.com",
        gender: "Male",
        contribution: 5000,
        status: "Active",
        photo: "https://i.pravatar.cc/80?img=1"
    },
    {
        id: 2,
        name: "Grace James",
        phone: "08145678912",
        email: "grace@gmail.com",
        gender: "Female",
        contribution: 10000,
        status: "Active",
        photo: "https://i.pravatar.cc/80?img=2"
    },
    {
        id: 3,
        name: "Michael Daniel",
        phone: "08098765432",
        email: "michael@gmail.com",
        gender: "Male",
        contribution: 8000,
        status: "Inactive",
        photo: "https://i.pravatar.cc/80?img=3"
    }
];

/* ==========================================
   LOAD MEMBERS
========================================== */

function loadMembers(data = members) {

    const table = document.getElementById("memberTable");

    if (!table) return;

    table.innerHTML = "";

    data.forEach((member, index) => {

        table.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>
                <img src="${member.photo}" class="avatar">
            </td>

            <td>${member.name}</td>

            <td>${member.phone}</td>

            <td>${member.email}</td>

            <td>${member.gender}</td>

            <td>₦${member.contribution.toLocaleString()}</td>

            <td>

                <span class="badge ${member.status === 'Active' ? 'bg-success' : 'bg-danger'}">

                    ${member.status}

                </span>

            </td>

            <td>

                <button class="btn btn-primary btn-sm viewBtn"
                    data-id="${member.id}">
                    <i class="fa fa-eye"></i>
                </button>

                <button class="btn btn-warning btn-sm editBtn"
                    data-id="${member.id}">
                    <i class="fa fa-edit"></i>
                </button>

                <button class="btn btn-danger btn-sm deleteBtn"
                    data-id="${member.id}">
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

const search = document.getElementById("searchMember");

if (search) {

    search.addEventListener("keyup", function () {

        const keyword = this.value.toLowerCase();

        const filtered = members.filter(member =>

            member.name.toLowerCase().includes(keyword) ||

            member.phone.includes(keyword) ||

            member.email.toLowerCase().includes(keyword)

        );

        loadMembers(filtered);

    });

}

/* ==========================================
   FILTER
========================================== */

const filter = document.querySelector(".filter-area select");

if (filter) {

    filter.addEventListener("change", function () {

        const value = this.value;

        if (value === "All Members") {

            loadMembers();

            return;

        }

        const filtered = members.filter(member => member.status === value);

        loadMembers(filtered);

    });

}

/* ==========================================
   BUTTON EVENTS
========================================== */

document.addEventListener("click", function (e) {

    /* View */

    if (e.target.closest(".viewBtn")) {

        const id = e.target.closest(".viewBtn").dataset.id;

        const member = members.find(item => item.id == id);
        prompt("Member details (copy if needed):", `${member.name} | ${member.phone} | ${member.email} | ${member.status}`);

    }

    /* Edit */

    if (e.target.closest(".editBtn")) {

        const id = e.target.closest(".editBtn").dataset.id;

        const member = members.find(item => item.id == id);
        const name = prompt("Enter the member's new name:", member.name);

        if (name && name.trim()) {
            member.name = name.trim();
            loadMembers();
        }

    }

    /* Delete */

    if (e.target.closest(".deleteBtn")) {

        const id = e.target.closest(".deleteBtn").dataset.id;

        const confirmDelete = confirm("Delete this member?");

        if (confirmDelete) {

            const index = members.findIndex(item => item.id == id);
            members.splice(index, 1);
            loadMembers();

        }

    }

});

/* ==========================================
   ADD MEMBER
========================================== */

const addForm = document.getElementById("addMemberForm");

if (addForm) {

    addForm.addEventListener("submit", function (e) {

        e.preventDefault();

        this.reset();

    });

}

/* ==========================================
   PAGE LOAD
========================================== */

window.onload = () => {

    loadMembers();

};
