const bootMessages = [
    'INITIALIZING...',
    'CONNECTING AI NODES...',
    'CONNECTING BLOCKCHAINS...',
    'ESTABLISHING SUPPORT LAYER...',
    'SYNCHRONIZING COMMUNITY...',
    'ACTIVATING INTELLIGENCE NETWORK...',
    'WELCOME TO T5D'
];

let currentIndex = 0;
const bootText = document.getElementById('boot-text');

function nextMessage() {
    if (!bootText) return;

    if (currentIndex < bootMessages.length) {
        bootText.textContent = bootMessages[currentIndex];
        currentIndex += 1;
        setTimeout(nextMessage, 700);
        return;
    }

    setTimeout(() => {
        const bootScreen = document.getElementById('boot-screen');
        if (bootScreen) bootScreen.classList.add('boot-hidden');
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.add('loaded');
    }, 1200);
}

window.addEventListener('load', () => {
    nextMessage();

    // Footer year (content pages use <span data-year></span>)
    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

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

    // Mobile navigation toggle (content pages: data-menu-toggle / data-nav-links)
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const navLinks = document.querySelector('[data-nav-links]');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
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

    // Agent API Quick Start Sandbox
    const sandboxFetchBtn = document.getElementById('sandbox-fetch-btn');
    const sandboxFetchOutput = document.getElementById('sandbox-fetch-output');
    const sandboxFetchStatus = document.getElementById('sandbox-fetch-status');

    if (sandboxFetchBtn && sandboxFetchOutput) {
        sandboxFetchBtn.addEventListener('click', async () => {
            sandboxFetchBtn.disabled = true;
            if (sandboxFetchStatus) sandboxFetchStatus.textContent = 'Requesting…';
            sandboxFetchOutput.textContent = '';

            try {
                const response = await fetch('https://api.tec5uportdimension.com/.well-known/t5d-token-support');
                const data = await response.json();
                sandboxFetchOutput.textContent = JSON.stringify(data, null, 2);
                if (sandboxFetchStatus) sandboxFetchStatus.textContent = `HTTP ${response.status} · live response`;
            } catch (error) {
                const detail = error && error.message ? error.message : String(error);
                sandboxFetchOutput.textContent = `// Request failed. The gateway may be temporarily unavailable.\n// ${detail}`;
                if (sandboxFetchStatus) sandboxFetchStatus.textContent = 'Request failed';
            } finally {
                sandboxFetchBtn.disabled = false;
            }
        });
    }

    const sandboxReceiptOutput = document.getElementById('sandbox-receipt-output');
    if (sandboxReceiptOutput) {
        const observedAt = new Date().toISOString();
        const exampleReceipt = {
            receiptVersion: '2.0',
            receiptId: 't5d-er2:eip155:8453/erc20:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913:illustrative',
            issuedAt: observedAt,
            assetId: 'eip155:8453/erc20:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
            observation: {
                status: 'current',
                source: 'direct-base-rpc',
                chainId: 8453,
                blockNumber: 'illustrative-only',
                observedAt: observedAt,
                contractDeployed: true,
                bytecode: { present: true, byteLength: 'illustrative-only' },
                metadata: { name: 'USDC', symbol: 'USDC', decimals: 6 },
                metadataErrors: [],
                proxy: { standard: 'erc1967', status: 'not-observed', implementation: null, beacon: null, errors: [] },
                error: null
            },
            registry: {
                version: '2.0',
                match: true,
                recordId: 't5d-tr-base-usdc-circle',
                recordVersion: '2.0',
                recordStatus: 'active',
                reviewedAt: '2026-08-22'
            },
            integrity: {
                deterministicInputs: ['receiptVersion', 'assetId', 'observation.blockNumber'],
                statement: 'receiptId is a deterministic non-secret response reference. It is not a signature, attestation, audit certificate, or cryptographic proof.'
            },
            boundaries: {
                notProvided: ['price', 'liquidity', 'holder concentration', 'risk score', 'investment recommendation', 'transaction suitability', 'legal opinion'],
                safety: 'An evidence receipt records observations and curated provenance. It does not establish that an asset or contract is safe, appropriate, audited, compliant, liquid, legitimate in every jurisdiction, or suitable for any transaction.'
            },
            _illustrative: 'This example was generated in your browser and was not fetched from the paid API.'
        };
        sandboxReceiptOutput.textContent = JSON.stringify(exampleReceipt, null, 2);
    }

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