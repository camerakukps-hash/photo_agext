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
});
