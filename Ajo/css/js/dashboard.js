// Sidebar Toggle
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
            sidebar.classList.toggle('show');
        } else {
            sidebar.classList.toggle('hide');
        }
    });

    document.addEventListener('click', (event) => {
        if (
            window.innerWidth <= 992 &&
            sidebar.classList.contains('show') &&
            !sidebar.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {
            sidebar.classList.remove('show');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            sidebar.classList.remove('show');
        }
    });
}

const logoutButton = document.querySelector('[data-logout]');

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    });
}

let themeToggle = document.querySelector('[data-theme-toggle]');

if (!themeToggle) {
    const actions = document.querySelector('.topbar-right, .right-nav');

    if (actions) {
        themeToggle = document.createElement('button');
        themeToggle.type = 'button';
        themeToggle.dataset.themeToggle = '';
        themeToggle.setAttribute('aria-label', 'Enable dark mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        actions.insertBefore(themeToggle, actions.querySelector('img'));
    }
}

function setTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('ajoTheme', isDark ? 'dark' : 'light');

    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        themeToggle.setAttribute('aria-label', isDark ? 'Enable light mode' : 'Enable dark mode');
    }
}

setTheme(localStorage.getItem('ajoTheme') === 'dark');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        setTheme(!document.body.classList.contains('dark-mode'));
    });
}

const notificationButton = document.querySelector('.topbar-right button:first-child, .right-nav button:first-child');

if (notificationButton) {
    const notifications = [
        { title: 'Contribution received', text: 'Grace James added ₦5,000.', time: '10 minutes ago' },
        { title: 'Payment is pending', text: 'A payout needs your review.', time: '1 hour ago' },
        { title: 'New member added', text: 'A new member joined AJO SAVE.', time: 'Today' }
    ];
    const panel = document.createElement('section');
    const savedReadState = localStorage.getItem('ajoNotificationsRead') === 'true';

    notificationButton.type = 'button';
    notificationButton.classList.add('notification-button');
    notificationButton.setAttribute('aria-label', 'Open notifications');
    notificationButton.setAttribute('aria-expanded', 'false');

    if (!savedReadState) {
        notificationButton.insertAdjacentHTML('beforeend', '<span class="notification-badge">3</span>');
    }

    panel.className = 'notification-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
        <div class="notification-header">
            <strong>Notifications</strong>
            <button type="button" class="mark-read">Mark all as read</button>
        </div>
        <div class="notification-list">
            ${notifications.map(item => `
                <article class="notification-item">
                    <i class="fa-solid fa-bell"></i>
                    <div>
                        <strong>${item.title}</strong>
                        <p>${item.text}</p>
                        <small>${item.time}</small>
                    </div>
                </article>
            `).join('')}
        </div>
    `;
    document.body.appendChild(panel);

    notificationButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = panel.classList.toggle('show');
        notificationButton.setAttribute('aria-expanded', String(isOpen));
        panel.setAttribute('aria-hidden', String(!isOpen));
    });

    panel.querySelector('.mark-read').addEventListener('click', () => {
        localStorage.setItem('ajoNotificationsRead', 'true');
        notificationButton.querySelector('.notification-badge')?.remove();
        panel.classList.remove('show');
        notificationButton.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
    });

    document.addEventListener('click', (event) => {
        if (!panel.contains(event.target) && !notificationButton.contains(event.target)) {
            panel.classList.remove('show');
            notificationButton.setAttribute('aria-expanded', 'false');
            panel.setAttribute('aria-hidden', 'true');
        }
    });
}

// Simple welcome animation
window.addEventListener('load', () => {
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = '0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
});
