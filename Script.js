const bootMessages = [
    'INITIALIZING...',
    'CONNECTING AI NODES...',
    'CONNECTING BLOCKCHAINS...',
    'ESTABLISHING SUPPORT LAYER...',
    'SYNCHRONIZING COMMUNITY...',
    'ACTIVATING INTELLIGENCE NETWORK...',
    'WELCOME TO TEC5UPORT DIMENSION'
];

let currentIndex = 0;
const bootText = document.getElementById('boot-text');

function nextMessage() {
    if (currentIndex < bootMessages.length) {
        bootText.textContent = bootMessages[currentIndex];
        currentIndex += 1;
        setTimeout(nextMessage, 700);
        return;
    }

    setTimeout(() => {
        document.getElementById('boot-screen').classList.add('boot-hidden');
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.add('loaded');
    }, 1200);
}

window.addEventListener('load', () => {
    nextMessage();
    
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const siteNav = document.getElementById('site-nav');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = siteNav.classList.toggle('nav-open');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        siteNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('nav-open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Section reveal animation
    const revealElements = document.querySelectorAll('section');
    revealElements.forEach((el) => el.classList.remove('visible'));

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
    });

    revealElements.forEach((el) => observer.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Utility function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}