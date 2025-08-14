// Elements
const navList = document.getElementById('nav-list');
const navToggle = document.getElementById('nav-toggle');
const themeToggle = document.getElementById('theme-toggle'); // may not exist now
const clockEl = document.getElementById('clock');
const navLinks = document.querySelectorAll('.nav-link');
const yearSpan = document.getElementById('year');
const avatarImg = document.querySelector('.avatar');
const heroAvatar = document.querySelector('.hero-avatar');

// Set year
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Mobile nav toggle
navToggle?.addEventListener('click', () => {
navList.classList.toggle('show');
});

// Close mobile nav when a link is clicked
navLinks.forEach(link => {
link.addEventListener('click', () => {
    navList.classList.remove('show');
});
});

// Theme: store preference in localStorage
const THEME_KEY = 'prefers-theme';
function setTheme(dark) {
if (dark) {
    document.documentElement.style.setProperty('--bg', '#071026');
    if (themeToggle) themeToggle.textContent = '☀️';
    localStorage.setItem(THEME_KEY, 'dark');
} else {
    document.documentElement.style.setProperty('--bg', '#f6f8fa');
    // Light mode adjustments to variables for contrast
    document.documentElement.style.setProperty('--card', 'rgba(0,0,0,0.03)');
    document.documentElement.style.setProperty('--muted', '#4b5563');
    document.documentElement.style.setProperty('--text', '#0b1220');
    document.documentElement.style.setProperty('--glass', 'rgba(0,0,0,0.02)');
    if (themeToggle) themeToggle.textContent = '🌙';
    localStorage.setItem(THEME_KEY, 'light');
}
}

// Initialize theme
const stored = localStorage.getItem(THEME_KEY);
if (stored === 'light') setTheme(false);
else setTheme(true); // default dark

// If themeToggle exists, keep supporting click; else ignore
themeToggle?.addEventListener('click', () => {
    const curr = localStorage.getItem(THEME_KEY);
    setTheme(curr !== 'light');
});

// Digital clock for Budapest time (Europe/Budapest) - hours and minutes only
function updateClock(){
    if (!clockEl) return;
    try {
        const now = new Date();
                const opts = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Budapest' };
        const parts = new Intl.DateTimeFormat(undefined, opts).format(now);
        // flash animation toggle
        clockEl.textContent = parts;
        clockEl.classList.remove('flash');
        // force reflow for replaying animation
        void clockEl.offsetWidth;
        clockEl.classList.add('flash');
    } catch (e) {
        // fallback to local time if Intl/timeZone unsupported
                clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
// Align updates to the start of each minute
function scheduleClockUpdate(){
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => { updateClock(); scheduleClockUpdate(); }, Math.max(0, delay));
}
updateClock();
scheduleClockUpdate();

// Smooth scrolling (native in modern browsers)
// Add behavior: smooth on click for nav links
navLinks.forEach(link => {
link.addEventListener('click', e => {
    const targetId = link.getAttribute('href')?.slice(1);
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
});

// IntersectionObserver to highlight nav items as you scroll
const sections = document.querySelectorAll('main section[id]');
const options = { root: null, rootMargin: '0px', threshold: 0.45 };

const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    const id = entry.target.id;
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (entry.isIntersecting) {
    link?.classList.add('active');
    } else {
    link?.classList.remove('active');
    }
});
}, options);

sections.forEach(section => observer.observe(section));

// Avatar lightbox (click to enlarge)
function enableLightbox(imgEl){
    imgEl.addEventListener('click', () => {
    const src = imgEl.getAttribute('src');
        if (!src) return;
        const backdrop = document.createElement('div');
        backdrop.className = 'lightbox-backdrop';
        const big = document.createElement('img');
        big.className = 'lightbox-image';
        big.src = src;
                big.alt = imgEl.alt || 'Profile photo';
        backdrop.appendChild(big);
        document.body.appendChild(backdrop);

        const close = () => {
            backdrop.classList.add('closing');
            // remove after fade out
            backdrop.addEventListener('animationend', () => backdrop.remove(), { once: true });
            window.removeEventListener('keydown', onKey);
        };

        const onKey = (e) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        backdrop.addEventListener('click', (e) => {
            // close when clicking backdrop, but ignore clicks on the image itself
            if (e.target === backdrop) close();
        });
    });
}

if (avatarImg) enableLightbox(avatarImg);
if (heroAvatar) enableLightbox(heroAvatar);