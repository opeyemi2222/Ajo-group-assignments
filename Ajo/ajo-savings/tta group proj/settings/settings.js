document.addEventListener("DOMContentLoaded", function () {

    const sidebar =
        document.querySelector(".settings-sidebar");

    const toggleButton =
        document.getElementById("settingsSidebarToggle");

    const overlay =
        document.getElementById("settingsOverlay");


    // Open Sidebar

    toggleButton.addEventListener("click", function () {

        sidebar.classList.add("show");

        overlay.classList.add("show");

    });


    // Close Sidebar

    overlay.addEventListener("click", function () {

        sidebar.classList.remove("show");

        overlay.classList.remove("show");

    });


    // Close Sidebar after selecting a tab on mobile

    const menuItems =
        document.querySelectorAll(".settings-menu .nav-link");


    menuItems.forEach(function (item) {

        item.addEventListener("click", function () {

            if (window.innerWidth <= 991) {

                sidebar.classList.remove("show");

                overlay.classList.remove("show");

            }

        });

    });

});