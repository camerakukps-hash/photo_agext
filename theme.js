// Manage Dark/Light Theme
const STORAGE_KEY = 'photo_agext_theme';

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem(STORAGE_KEY, 'dark');
        }
    }
}

function updateToggleSwitch() {
    const toggle = document.getElementById('themeToggleSwitch');
    if (toggle) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        toggle.checked = currentTheme === 'dark';
    }
}

// Initialize immediately to prevent flash
initTheme();

// Setup UI after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    updateToggleSwitch();
    
    const toggle = document.getElementById('themeToggleSwitch');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(STORAGE_KEY, newTheme);
        });
    }

    // Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('show-menu');
            
            // Toggle icon between bars and times
            const icon = hamburgerBtn.querySelector('i');
            if (navLinks.classList.contains('show-menu')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('show-menu') && !navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                navLinks.classList.remove('show-menu');
                const icon = hamburgerBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
});
